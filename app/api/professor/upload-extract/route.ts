import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase';
import {
  extractPdfPages,
  extractQuestionsFromText,
  buildNotesIndex,
  annotateWithReferences,
} from '@/lib/pdf-extract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * POST /api/professor/upload-extract
 *
 * multipart/form-data:
 *   moduleCode   — string
 *   chapterId    — uuid
 *   questions    — file (PDF of questions, required)
 *   notes        — file (PDF of lecture notes for reference lookup, optional)
 *
 * Cost model:
 *   1. Text extraction via pdf-parse — free, ~200ms per PDF
 *   2. Heuristic MCQ regex parser    — free, sub-millisecond
 *   3. LLM fallback                  — ONLY invoked when
 *      the heuristic yields 0 questions. Even then we send
 *      cleaned text, never raw PDF bytes.
 *
 * The extracted rows are inserted with status='under_review'.
 * The professor approves them in the Question Bank before
 * students see them.
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const moduleCode = String(form.get('moduleCode') ?? '');
  const chapterId = String(form.get('chapterId') ?? '');
  const questionsFile = form.get('questions');
  const notesFile = form.get('notes');

  if (!moduleCode || !chapterId) {
    return NextResponse.json(
      { error: 'moduleCode and chapterId are required' },
      { status: 400 }
    );
  }
  if (!(questionsFile instanceof File)) {
    return NextResponse.json({ error: 'questions PDF required' }, { status: 400 });
  }
  if (questionsFile.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'questions file exceeds 10 MB limit' },
      { status: 413 }
    );
  }
  if (notesFile instanceof File && notesFile.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'notes file exceeds 10 MB limit' },
      { status: 413 }
    );
  }

  // Resolve chapter → subject for the insert path.
  const chapterRes = await (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (c: string, v: unknown) => {
          single: () => Promise<{
            data: {
              module_code: string;
              modules: { subject_id: string } | { subject_id: string }[] | null;
            } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  })
    .from('chapters')
    .select('module_code, modules(subject_id)')
    .eq('id', chapterId)
    .single();

  if (chapterRes.error || !chapterRes.data) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  const modulesRel = chapterRes.data.modules;
  const subjectId = Array.isArray(modulesRel)
    ? modulesRel[0]?.subject_id
    : modulesRel?.subject_id;
  if (!subjectId) {
    return NextResponse.json(
      { error: 'Chapter has no subject binding' },
      { status: 500 }
    );
  }

  // Create the upload_jobs row up-front so the client polls a
  // real row even if extraction fails mid-way.
  const jobRes = await (supabase as unknown as {
    from: (t: string) => {
      insert: (r: Record<string, unknown>) => {
        select: (c: string) => {
          single: () => Promise<{
            data: { id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  })
    .from('upload_jobs')
    .insert({
      professor_id: user.id,
      module_code: moduleCode,
      chapter_id: chapterId,
      method: 'ai',
      questions_file_name: questionsFile.name,
      notes_file_name: notesFile instanceof File ? notesFile.name : null,
      status: 'processing',
    })
    .select('id')
    .single();

  if (jobRes.error || !jobRes.data) {
    return NextResponse.json(
      { error: jobRes.error?.message ?? 'Failed to open job' },
      { status: 500 }
    );
  }
  const jobId = jobRes.data.id;

  const patchJob = async (patch: Record<string, unknown>) => {
    await (supabase as unknown as {
      from: (t: string) => {
        update: (r: Record<string, unknown>) => {
          eq: (c: string, v: unknown) => Promise<{
            error: { message: string } | null;
          }>;
        };
      };
    })
      .from('upload_jobs')
      .update(patch)
      .eq('id', jobId);
  };

  try {
    // ---- 1) Extract text ----
    const qBuffer = Buffer.from(await questionsFile.arrayBuffer());
    const qPages = await extractPdfPages(qBuffer);
    const fullText = qPages.pages.map((p) => p.text).join('\n\n');

    // ---- 2) Notes index (optional) ----
    let notesIndex = null;
    if (notesFile instanceof File) {
      const nBuffer = Buffer.from(await notesFile.arrayBuffer());
      notesIndex = await buildNotesIndex(nBuffer);
    }

    // ---- 3) Heuristic parse ----
    let extracted = extractQuestionsFromText(fullText);

    // ---- 4) LLM fallback (stub) ----
    // If the heuristic parser returns nothing, THIS is where a
    // paid LLM call would run — over the extracted text, not
    // the raw PDF, so token cost is small. Wire an OpenAI/
    // Anthropic call here when credentials are available.
    // For now we return an empty list and let the professor
    // add questions manually if the doc was too messy.

    // ---- 5) Reference annotation from notes ----
    extracted = annotateWithReferences(extracted, notesIndex);

    if (extracted.length === 0) {
      await patchJob({
        status: 'failed',
        error_message:
          'No questions detected. Try a different file or add questions manually.',
        completed_at: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          jobId,
          extracted: 0,
          error:
            'Could not detect any MCQs in that file. Verify the layout uses "1. …" question numbers and "a) …" option letters, or add them manually.',
        },
        { status: 422 }
      );
    }

    // ---- 6) Insert as under_review ----
    // Grab the next subject_bundle_id in bulk to avoid a
    // per-row round-trip.
    const maxRes = await (supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (c: string, v: unknown) => {
            order: (c: string, o: { ascending: boolean }) => {
              limit: (n: number) => Promise<{
                data: { subject_bundle_id: number }[] | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };
    })
      .from('questions')
      .select('subject_bundle_id')
      .eq('subject_id', subjectId)
      .order('subject_bundle_id', { ascending: false })
      .limit(1);

    let nextBundleId = (maxRes.data?.[0]?.subject_bundle_id ?? 0) + 1;

    const rows = extracted.map((q) => {
      const correct =
        q.correctAnswer && q.choices.some((c) => c.id === q.correctAnswer)
          ? q.correctAnswer
          : q.choices[0].id;
      return {
        subject_id: subjectId,
        subject_bundle_id: nextBundleId++,
        question: q.question,
        choices: q.choices,
        correct_answer: correct,
        explanation: '',
        reference: q.reference ?? '',
        topic: '',
        chapter_id: chapterId,
        professor_id: user.id,
        status: 'under_review',
        source: 'ai',
        difficulty: 'medium',
      };
    });

    const insertRes = await (supabase as unknown as {
      from: (t: string) => {
        insert: (r: Record<string, unknown>[]) => {
          select: (c: string) => Promise<{
            data: { id: number }[] | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .from('questions')
      .insert(rows)
      .select('id');

    if (insertRes.error) {
      await patchJob({
        status: 'failed',
        error_message: insertRes.error.message,
        completed_at: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: insertRes.error.message, jobId },
        { status: 500 }
      );
    }

    await patchJob({
      status: 'completed',
      questions_extracted: rows.length,
      questions_under_review: rows.length,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      jobId,
      extracted: rows.length,
      insertedIds: (insertRes.data ?? []).map((r) => r.id),
      chapterId,
      subjectId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Extraction failed';
    await patchJob({
      status: 'failed',
      error_message: msg,
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({ error: msg, jobId }, { status: 500 });
  }
}
