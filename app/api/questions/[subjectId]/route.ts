import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { withCache } from '@/lib/cache';
import { CACHE_KEYS, TTL } from '@/lib/redis';
import { histologyQuestions, type HistologyQuestion } from '@/data/histology-questions';
import type { Database } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/questions/[subjectId]
 *
 * Returns the full MCQ bank for a subject.
 *
 * Why a 24h TTL:
 *   Question banks are versioned, published artifacts. Once
 *   Dr. Zahra publishes a block, the 11 questions don't mutate
 *   for the rest of the term. The 24h TTL is a safety net — the
 *   editorial publish flow should call invalidateCache(
 *   CACHE_KEYS.questionBank(subjectId)) on every publish, which
 *   means cold lookups dominate and the TTL itself is rarely
 *   the eviction trigger.
 *
 * Why the cache pays off so much here:
 *   Every student starting the histology block hits this
 *   endpoint. For a cohort of 1k students opening the quiz over
 *   24h, this is the difference between 1k Postgres reads of a
 *   ~100KB payload and a single one served from Upstash.
 *
 * Auth:
 *   Requires a signed-in session. The bank itself is published
 *   material owned by faculty — exposing it anonymously would
 *   leak exam content to scrapers. Per-student answer history is
 *   gated separately by /api/student/stats.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjectId = params.subjectId;

  const questions = await withCache(
    CACHE_KEYS.questionBank(subjectId),
    TTL.QUESTIONS,
    () => fetchQuestionsFromDB(subjectId)
  );

  return NextResponse.json({ subjectId, questions });
}

/**
 * Read questions from the source of truth.
 *
 * In production this would hit Supabase:
 *
 *   const { data, error } = await supabase
 *     .from('questions')
 *     .select('id, question, choices, correct_answer, explanation, reference, topic, choice_rationales')
 *     .eq('subject_id', subjectId)
 *     .order('id', { ascending: true });
 *
 *   if (error) throw error;
 *   return data ?? [];
 *
 * For this demo the histology bank is bundled as a static module,
 * so we serve it directly. Coming-soon subjects return [].
 */
async function fetchQuestionsFromDB(subjectId: string): Promise<HistologyQuestion[]> {
  if (subjectId === 'histology') {
    return histologyQuestions;
  }
  return [];
}
