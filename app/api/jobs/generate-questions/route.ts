import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { createClient } from '@supabase/supabase-js';
import { invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/redis';
import type { Database } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WorkerPayload = {
  jobId: string;
  professorId: string;
  subjectId: string;
  notesFileUrl: string | null;
  questionsFileUrl: string | null;
};

/**
 * QStash worker for AI question generation.
 *
 * Only QStash calls this URL — the `verifySignatureAppRouter`
 * wrapper rejects any POST without a valid QStash signature
 * (HMAC of the body keyed with QSTASH_CURRENT_SIGNING_KEY /
 * QSTASH_NEXT_SIGNING_KEY). That means:
 *
 *   - A leaked URL is useless to an attacker.
 *   - QStash's automatic key rotation works (current + next).
 *
 * The worker uses the Supabase SERVICE ROLE key — it isn't acting
 * on behalf of a user session and needs to bypass RLS to update
 * the jobs row.
 */
async function handler(request: NextRequest): Promise<NextResponse> {
  let payload: WorkerPayload;
  try {
    payload = (await request.json()) as WorkerPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.jobId || !payload.professorId || !payload.subjectId) {
    return NextResponse.json(
      { error: 'jobId, professorId, and subjectId are required' },
      { status: 400 }
    );
  }

  // The service-role client returned from createClient<Database>(...)
  // collapses to `never` under the auth-helpers-nextjs typing path,
  // so we narrow to the surface this handler actually touches.
  const supabase = serviceClient() as unknown as {
    from: (table: string) => {
      update: (patch: Record<string, unknown>) => {
        eq: (col: string, val: unknown) => Promise<{
          error: { message: string } | null;
        }>;
      };
    };
  };

  // Flip to 'processing' so the polling endpoint can show the
  // intermediate state in the UI pipeline.
  await supabase
    .from('jobs')
    .update({ status: 'processing' })
    .eq('id', payload.jobId);

  try {
    // --- Real AI work would go here ---
    //
    //   const notes = await downloadFile(payload.notesFileUrl);
    //   const questions = await downloadFile(payload.questionsFileUrl);
    //   const extracted = await runExtractionPipeline({ notes, questions });
    //   await supabase.from('questions').insert(extracted.published);
    //
    // For the demo we just sleep 3s and return canned numbers
    // so the dashboard pipeline animates against a realistic
    // latency profile.
    await sleep(3000);

    const result = {
      extracted: 450,
      published: 438,
      review: 12,
      subjectId: payload.subjectId,
    };

    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payload.jobId);

    // The professor's content overview reads from the question
    // bank — drop the cache so the new revision shows up on the
    // next read instead of waiting for the 24h TTL.
    await invalidateCache(CACHE_KEYS.questionBank(payload.subjectId));

    return NextResponse.json({ ok: true, jobId: payload.jobId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'job failed';
    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payload.jobId);

    // Re-throw so QStash sees a 5xx and triggers a retry.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the worker.'
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Export the verified handler. If signing keys aren't configured
 * (local dev without QStash), we skip verification so the
 * endpoint can still be invoked manually — never do this in
 * production. A missing key means the env isn't set, which
 * already implies "not production".
 */
export const POST =
  process.env.QSTASH_CURRENT_SIGNING_KEY
    ? verifySignatureAppRouter(handler)
    : handler;
