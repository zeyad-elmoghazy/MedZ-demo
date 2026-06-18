'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Flame,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { histologyQuestions } from '@/data/histology-questions';
import type { SavedSession } from '@/lib/store';
import {
  getEmptyStudentStats,
  getMockStudentStats,
  type StudentStats,
  type Subject,
} from '@/lib/dashboard-data';
import {
  fetchStudentStats,
  pingStreak,
} from '@/lib/student-api';
import {
  clearDemoProfile,
  createBrowserClient,
  isDemoMode,
  readDemoProfile,
} from '@/lib/supabase';
import { useQuizStore } from '@/lib/store';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { cn } from '@/lib/utils';

const AnalyticsDashboard = dynamic(
  () => import('@/components/dashboard/Analytics'),
  { loading: () => <AnalyticsSkeleton />, ssr: false }
);

type ApiStudentStats = StudentStats & {
  profile?: { id: string; full_name: string | null; email: string | null };
  bookmarksCount?: number;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const startSession = useQuizStore((s) => s.startSession);
  const loadSession = useQuizStore((s) => s.loadSession);
  const clearSession = useQuizStore((s) => s.clearSession);

  const [stats, setStats] = useState<ApiStudentStats | null>(null);
  const [userName, setUserName] = useState<string>('Student');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeSession, setResumeSession] = useState<SavedSession | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Step 1 — Get user name (fast, so the greeting paints early).
    if (isDemoMode()) {
      const demo = readDemoProfile();
      if (demo?.full_name) setUserName(demo.full_name);
    } else {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          const profile = data as { full_name: string | null } | null;
          if (profile?.full_name) setUserName(profile.full_name);
        }
      } catch {
        // Name fetch is best-effort — we still render "Student".
      }
    }

    // Step 2 — Ping streak (fire-and-forget).
    if (!isDemoMode()) {
      pingStreak().catch(() => {});
    }

    // Step 3 — Fetch real stats.
    if (isDemoMode()) {
      setStats(getMockStudentStats());
    } else {
      try {
        const data = (await fetchStudentStats()) as ApiStudentStats;
        setStats(data);
        if (data.profile?.full_name) setUserName(data.profile.full_name);
      } catch {
        setError('Failed to load your stats.');
        setStats(getEmptyStudentStats());
      }
    }

    // Step 4 — Done.
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    clearDemoProfile();
    if (!isDemoMode()) {
      await supabase.auth.signOut().catch(() => {});
    }
    router.push('/login');
    router.refresh();
  }

  function handleStartHistology() {
    // Try to restore a saved session — if one exists, show the
    // resume modal so the student picks Start Fresh vs Continue.
    const resumed = loadSession('histology');
    if (resumed) {
      const saved = useQuizStore.getState().savedSession;
      setResumeSession(saved);
      setShowResumeModal(true);
      return;
    }
    startSession();
    router.push('/student/quiz/histology');
  }

  function handleResumeContinue() {
    setShowResumeModal(false);
    // loadSession already merged the saved state into the store;
    // we just navigate.
    router.push('/student/quiz/histology');
  }

  function handleResumeFresh() {
    clearSession();
    setShowResumeModal(false);
    startSession();
    router.push('/student/quiz/histology');
  }

  const initials = useMemo(() => {
    const trimmed = userName.trim() || 'Student';
    return trimmed
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  // -------------- LOADING --------------
  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#09090E' }}>
        <TopNav
          userName={userName}
          initials={initials}
          signingOut={signingOut}
          onLogout={handleLogout}
        />
        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Header skeleton */}
          <div className="flex justify-between mb-8">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
          </div>

          {/* Metric cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>

          {/* Chart + subjects skeleton */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-6">
              <div className="h-72 bg-slate-800/50 rounded-2xl animate-pulse" />
              <div className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
            </div>
            <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // -------------- ERROR (no usable data) --------------
  if (error && (!stats || stats.totalQuestionsAnswered === 0)) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: '#09090E' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            backgroundColor: '#0F0F1A',
            border: '1px solid #1E1E2E',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          <span
            className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl"
            style={{
              backgroundColor: 'rgba(239,68,68,0.12)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.35)',
              boxShadow: '0 0 20px rgba(239,68,68,0.3)',
            }}
          >
            <AlertCircle className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Couldn&apos;t load your data
          </h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/student/dashboard"
              onClick={(e) => {
                e.preventDefault();
                loadDashboard();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-text-primary transition hover:text-white"
              style={{ border: '1px solid #1E1E2E', backgroundColor: '#0A0A12' }}
            >
              Retry without reload
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition"
              style={{
                backgroundColor: '#7C3AED',
                boxShadow: '0 0 22px rgba(124,58,237,0.5)',
              }}
            >
              Try again
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // -------------- DASHBOARD --------------
  const data = stats ?? getEmptyStudentStats();
  const challengesCompleted = data.subjects.reduce(
    (sum, s) => sum + s.challengesCompleted,
    0
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#09090E' }}>
      <TopNav
        userName={userName}
        initials={initials}
        signingOut={signingOut}
        onLogout={handleLogout}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
        }}
        className="p-8 max-w-[1400px] mx-auto"
      >
        {error && (
          <FadeUp>
            <div
              className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#FCA5A5',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error} Showing what we have on file.
            </div>
          </FadeUp>
        )}

        {/* Header */}
        <FadeUp>
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-violet-300">
                Welcome back
              </p>
              <h1
                className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                style={{ textShadow: '0 0 18px rgba(124,58,237,0.45)' }}
              >
                Hi, {userName.split(' ')[0]}.
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                {data.streakDays > 0
                  ? `You're on a ${data.streakDays}-day streak — keep it alive today.`
                  : 'Pick a subject below to start your streak.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartHistology}
              className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition"
              style={{
                backgroundColor: '#7C3AED',
                boxShadow: '0 0 24px rgba(124,58,237,0.5)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Start Histology challenge
              <ArrowRight className="h-4 w-4" />
            </button>
          </header>
        </FadeUp>

        {/* Metric cards */}
        <FadeUp>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricTile
              icon={<ListChecks className="h-4 w-4" />}
              label="Questions Answered"
              value={data.totalQuestionsAnswered.toLocaleString()}
              hint={`${data.totalCorrectAnswers.toLocaleString()} correct`}
              accent="#9F67FF"
            />
            <MetricTile
              icon={<Target className="h-4 w-4" />}
              label="Accuracy"
              value={`${data.overallAccuracy}%`}
              hint={
                data.totalQuestionsAnswered > 0
                  ? 'Lifetime average'
                  : 'Answer one to start'
              }
              accent="#10B981"
            />
            <MetricTile
              icon={<Flame className="h-4 w-4" />}
              label="Streak"
              value={`${data.streakDays}d`}
              hint={data.streakDays > 0 ? 'Keep it going' : 'Begin today'}
              accent="#EF4444"
            />
            <MetricTile
              icon={<Trophy className="h-4 w-4" />}
              label="Challenges"
              value={challengesCompleted.toString()}
              hint={`${data.recentChallenges.length} recent`}
              accent="#9F67FF"
            />
          </div>
        </FadeUp>

        {/* Chart + subjects */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <FadeUp>
              {data.progressHistory.length > 0 ? (
                <AnalyticsDashboard
                  data={data.progressHistory}
                  currentAccuracy={data.overallAccuracy}
                />
              ) : (
                <EmptyChartCard />
              )}
            </FadeUp>
            <FadeUp>
              <RecentChallenges challenges={data.recentChallenges} />
            </FadeUp>
          </div>
          <FadeUp>
            <SubjectsSidebar
              subjects={data.subjects}
              onStartHistology={handleStartHistology}
            />
          </FadeUp>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResumeModal && resumeSession && (
          <ResumeModal
            session={resumeSession}
            onContinue={handleResumeContinue}
            onStartFresh={handleResumeFresh}
            onClose={() => setShowResumeModal(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ResumeModal({
  session,
  onContinue,
  onStartFresh,
  onClose,
}: {
  session: SavedSession;
  onContinue: () => void;
  onStartFresh: () => void;
  onClose: () => void;
}) {
  const total = histologyQuestions.length;
  const answeredCount = Object.keys(session.answers).length;
  const correctCount = histologyQuestions.reduce(
    (sum, q) => (session.answers[q.id] === q.correctAnswer ? sum + 1 : sum),
    0
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-8 shadow-2xl mx-4"
        style={{
          backgroundColor: '#161B26',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
          <PlayCircle className="h-6 w-6 text-purple-400" />
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-white">
          Resume Challenge?
        </h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          You have an unfinished Histology session.
        </p>

        <div
          className="mb-6 rounded-xl p-4"
          style={{ backgroundColor: '#0F0F1A' }}
        >
          <ProgressRow
            label="Progress saved"
            value={`${answeredCount} / ${total} questions`}
          />
          <ProgressRow
            label="Last question"
            value={`Question ${session.currentQuestionIndex + 1}`}
            valueClass="text-purple-400 font-semibold"
          />
          <ProgressRow
            label="Correct so far"
            value={String(correctCount)}
            valueClass="text-emerald-400 font-semibold"
            last
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onStartFresh}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-300 transition-colors duration-200"
            style={{
              backgroundColor: '#1E1E2E',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#252535')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#1E1E2E')
            }
          >
            Start Fresh
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors duration-200"
            style={{ backgroundColor: '#9333EA' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#7E22CE')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#9333EA')
            }
          >
            Continue Session
          </button>
        </div>
      </motion.div>
    </>
  );
}

function ProgressRow({
  label,
  value,
  valueClass,
  last,
}: {
  label: string;
  value: string;
  valueClass?: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-2 text-sm text-slate-400"
      style={
        last
          ? undefined
          : { borderBottom: '1px solid rgba(255,255,255,0.05)' }
      }
    >
      <span>{label}</span>
      <span className={valueClass ?? 'text-white font-semibold'}>{value}</span>
    </div>
  );
}

// ============== Helpers ==============

function FadeUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  );
}

function TopNav({
  userName,
  initials,
  signingOut,
  onLogout,
}: {
  userName: string;
  initials: string;
  signingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(9, 9, 14, 0.85)',
        borderBottom: '1px solid #1E1E2E',
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400"
            style={{ boxShadow: '0 0 24px rgba(124,58,237,0.55)' }}
          >
            <ActivityIcon className="h-4 w-4 text-white" />
          </span>
          <span
            className="text-lg font-bold tracking-tight text-white"
            style={{ textShadow: '0 0 14px rgba(124,58,237,0.5)' }}
          >
            MedZ
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/student/analytics"
            className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs text-text-muted transition hover:text-white sm:inline-flex"
            style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
          >
            Analytics
            <ArrowRight className="h-3 w-3" />
          </Link>
          <div
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-4"
            style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-xs font-semibold text-white"
              style={{ boxShadow: '0 0 14px rgba(124,58,237,0.45)' }}
            >
              {initials || 'ME'}
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-xs font-medium text-white">{userName}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Student
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={signingOut}
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium text-text-muted transition hover:text-white disabled:opacity-50"
            style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
          >
            {signingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function MetricTile({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
        style={{ background: `${accent}26`, filter: 'blur(32px)' }}
      />
      <div className="relative">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
        <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-text-muted">
          {label}
        </p>
        <p className="mt-2 text-xs text-text-muted">{hint}</p>
      </div>
    </div>
  );
}

function RecentChallenges({
  challenges,
}: {
  challenges: StudentStats['recentChallenges'];
}) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E' }}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Last sessions
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white">
            Recent challenges
          </h2>
        </div>
        <span className="text-xs text-text-muted">
          {challenges.length} shown
        </span>
      </div>

      {challenges.length === 0 ? (
        <div
          className="mt-5 flex flex-col items-center gap-3 rounded-xl p-8 text-center"
          style={{ border: '1px dashed #1E1E2E' }}
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{ backgroundColor: 'rgba(124,58,237,0.12)' }}
          >
            <Sparkles className="h-4 w-4 text-violet-300" />
          </span>
          <p className="max-w-xs text-sm text-text-muted">
            No sessions yet. Start the Histology challenge to see your first result land here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y" style={{ borderColor: '#1E1E2E' }}>
          {challenges.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center gap-4 py-3"
              style={{ borderTop: i === 0 ? '1px solid transparent' : undefined }}
            >
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-semibold',
                  c.accuracy >= 70
                    ? 'text-emerald-300'
                    : c.accuracy >= 50
                      ? 'text-violet-200'
                      : 'text-rose-300'
                )}
                style={{
                  backgroundColor:
                    c.accuracy >= 70
                      ? 'rgba(16,185,129,0.15)'
                      : c.accuracy >= 50
                        ? 'rgba(124,58,237,0.15)'
                        : 'rgba(239,68,68,0.15)',
                }}
              >
                {Math.round(c.accuracy)}%
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {c.subjectName}
                </p>
                <p className="text-[11px] text-text-muted">
                  {c.score} / {c.total} correct
                </p>
              </div>
              <span className="text-xs text-text-muted">
                {formatRelative(c.completedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SubjectsSidebar({
  subjects,
  onStartHistology,
}: {
  subjects: Subject[];
  onStartHistology: () => void;
}) {
  const featured = subjects.find((s) => s.available);
  const locked = subjects.filter((s) => !s.available);

  return (
    <aside
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E' }}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Subjects
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white">
            Your library
          </h2>
        </div>
        <span className="text-xs text-text-muted">
          {subjects.length} blocks
        </span>
      </div>

      {featured && (
        <button
          type="button"
          onClick={onStartHistology}
          className="group relative mt-5 flex w-full overflow-hidden rounded-xl p-4 text-left"
          style={{
            background: 'linear-gradient(160deg, #1A0A2E 0%, #0F0F1A 100%)',
            border: '1px solid rgba(159, 103, 255, 0.35)',
            boxShadow: '0 0 24px rgba(124,58,237,0.25)',
          }}
        >
          <AnimatePresence>
            <motion.span
              key="glow"
              aria-hidden
              animate={{
                boxShadow: [
                  '0 0 0 1px rgba(159,103,255,0.35)',
                  '0 0 0 1px rgba(159,103,255,0.7)',
                  '0 0 0 1px rgba(159,103,255,0.35)',
                ],
              }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 rounded-xl"
            />
          </AnimatePresence>

          <div className="relative flex flex-1 items-start gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, #9F67FF 0%, #7C3AED 60%, #4C1D95 100%)',
                boxShadow: '0 0 18px rgba(124,58,237,0.55)',
              }}
            >
              {featured.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {featured.name}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200"
                  style={{
                    backgroundColor: 'rgba(124,58,237,0.18)',
                    border: '1px solid rgba(159,103,255,0.4)',
                  }}
                >
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Dr. Ahmed Zahra · {featured.questionsAnswered}/
                {featured.questionsAnswered + (11 - featured.questionsAnswered)} questions
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${featured.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #7C3AED 0%, #9F67FF 100%)',
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>{featured.progress}% complete</span>
                <span className="inline-flex items-center gap-1 text-violet-200 transition group-hover:translate-x-0.5">
                  Continue
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </button>
      )}

      <ul className="mt-5 space-y-2">
        {locked.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{
              backgroundColor: '#0A0A12',
              border: '1px solid #1E1E2E',
              filter: 'grayscale(0.7)',
            }}
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              {s.icon}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted">{s.name}</p>
              <p className="text-[11px] text-text-muted/70">Coming soon</p>
            </div>
            <Lock className="h-3.5 w-3.5 text-text-muted/70" />
          </li>
        ))}
      </ul>

      <Link
        href="/student/analytics#bookmarks"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-text-muted transition hover:text-white"
        style={{ border: '1px solid #1E1E2E', backgroundColor: '#0A0A12' }}
      >
        <Bookmark className="h-3.5 w-3.5" />
        View bookmarks
      </Link>
    </aside>
  );
}

function EmptyChartCard() {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E' }}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300">
          Accuracy
        </p>
        <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white">
          Accuracy over time
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Your chart populates as you complete sessions.
        </p>
      </div>
      <div
        className="mt-6 grid h-56 place-items-center rounded-xl"
        style={{ border: '1px dashed #1E1E2E' }}
      >
        <p className="text-sm text-text-muted">
          No history yet — finish a challenge to seed the chart.
        </p>
      </div>
    </section>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
