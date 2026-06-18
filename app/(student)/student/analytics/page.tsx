'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  Bookmark,
  Flame,
  LayoutDashboard,
  Library,
  ListChecks,
  Lock,
  LogOut,
  Medal,
  NotebookPen,
  Settings,
  Target,
  Trophy,
} from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { histologyQuestions, histologySubject } from '@/data/histology-questions';
import { clearDemoProfile, createBrowserClient, isDemoMode } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';

// Heavy components loaded only when needed:
// Recharts ships d3-* deps; deferring this import keeps the
// analytics page's initial JS lean. ssr:false because charts
// don't need to render server-side (they animate in on mount).
const AnalyticsDashboard = dynamic(
  () => import('@/components/dashboard/Analytics'),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Subjects', href: '/student/subjects', icon: <Library className="h-4 w-4" /> },
  { label: 'My Progress', href: '#progress', icon: <ListChecks className="h-4 w-4" />, disabled: true },
  { label: 'Bookmarks', href: '#bookmarks', icon: <BookmarkCheck className="h-4 w-4" /> },
  { label: 'Notes', href: '#notes', icon: <NotebookPen className="h-4 w-4" />, disabled: true },
  { label: 'Performance', href: '/student/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Leaderboard', href: '#leaderboard', icon: <Medal className="h-4 w-4" />, disabled: true },
  { label: 'Settings', href: '#settings', icon: <Settings className="h-4 w-4" />, disabled: true },
];

const LOCKED_SUBJECTS = ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology'];

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const answers = useQuizStore((s) => s.answers);
  const bookmarks = useQuizStore((s) => s.bookmarks);
  const jumpToQuestion = useQuizStore((s) => s.jumpToQuestion);

  const total = histologyQuestions.length;
  const attempted = Object.keys(answers).length;
  const correctCount = histologyQuestions.reduce(
    (acc, q) => (answers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0
  );
  const accuracy = attempted === 0 ? 0 : Math.round((correctCount / attempted) * 100);
  const subjectAccuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const chartData = useMemo(() => buildHistoryChart(accuracy), [accuracy]);

  const bookmarkedQuestions = useMemo(
    () =>
      bookmarks
        .map((id) => histologyQuestions.find((q) => q.id === id))
        .filter((q): q is (typeof histologyQuestions)[number] => Boolean(q)),
    [bookmarks]
  );

  function handleReview(questionId: number) {
    const idx = histologyQuestions.findIndex((q) => q.id === questionId);
    if (idx < 0) return;
    useQuizStore.setState({ filterQuestionIds: null });
    jumpToQuestion(idx);
    router.push('/student/quiz/histology');
  }

  async function handleLogout() {
    clearDemoProfile();
    if (!isDemoMode()) {
      await supabase.auth.signOut().catch(() => {});
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: '#09090E' }}>
      <TopNav onLogout={handleLogout} />

      <div className="mx-auto flex w-full max-w-7xl">
        <SideNav items={NAV_ITEMS} />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          }}
          className="flex-1 px-6 py-10 lg:px-10"
        >
          <FadeUp>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-violet-300">
                  Performance · Histology
                </p>
                <h1
                  className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                  style={{ textShadow: '0 0 18px rgba(124,58,237,0.4)' }}
                >
                  Your analytics
                </h1>
                <p className="mt-2 text-sm text-text-muted">
                  Pulled live from your active session. Charts mock historical sessions
                  until your second attempt lands.
                </p>
              </div>
              <Link
                href="/student/dashboard"
                className="inline-flex h-10 items-center gap-2 self-start rounded-xl px-4 text-xs font-medium text-text-primary transition hover:text-white md:self-auto"
                style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
              >
                Back to subjects
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </FadeUp>

          <FadeUp className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<ListChecks className="h-4 w-4" />}
                label="Total Questions Answered"
                value={`${attempted}`}
                hint={`of ${total} in this block`}
              />
              <KpiCard
                icon={<Target className="h-4 w-4" />}
                label="Correct Answers"
                value={`${correctCount}`}
                hint={`${attempted - correctCount} to review`}
                accent="#10B981"
              />
              <KpiCard
                icon={<Trophy className="h-4 w-4" />}
                label="Accuracy"
                value={`${accuracy}%`}
                hint={attempted > 0 ? 'Across attempted items' : 'Answer one to start'}
              />
              <KpiCard
                icon={<Flame className="h-4 w-4" />}
                label="Study Streak"
                value="1 Day"
                hint="Come back tomorrow"
                accent="#EF4444"
              />
            </div>
          </FadeUp>

          <FadeUp className="mt-8">
            <AnalyticsDashboard data={chartData} currentAccuracy={accuracy} />
          </FadeUp>

          <FadeUp className="mt-6">
            <Panel>
              <PanelHeader
                title="Subject breakdown"
                subtitle="Accuracy by block."
              />
              <ul className="mt-5 space-y-3">
                <li
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#0A0A12', border: '1px solid #1E1E2E' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {histologySubject.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        Dr. {histologySubject.professor} · {correctCount} of {total} correct
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-violet-200">
                      {subjectAccuracy}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subjectAccuracy}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #7C3AED 0%, #9F67FF 100%)',
                        boxShadow: '0 0 14px rgba(124,58,237,0.45)',
                      }}
                    />
                  </div>
                </li>

                {LOCKED_SUBJECTS.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{
                      backgroundColor: '#0A0A12',
                      border: '1px solid #1E1E2E',
                      filter: 'grayscale(0.7)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-text-muted">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-muted">{name}</p>
                        <p className="text-xs text-text-muted/70">Coming Soon</p>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-text-muted/60">
                      Locked
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </FadeUp>

          <FadeUp className="mt-6">
            <Panel id="bookmarks">
              <PanelHeader
                title="Bookmarked questions"
                subtitle={
                  bookmarkedQuestions.length > 0
                    ? `${bookmarkedQuestions.length} flagged for review`
                    : 'Use the bookmark icon during a quiz to flag items.'
                }
                accessory={
                  bookmarkedQuestions.length > 0 && (
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-violet-200">
                      {bookmarkedQuestions.length}
                    </span>
                  )
                }
              />

              {bookmarkedQuestions.length === 0 ? (
                <div
                  className="mt-5 flex flex-col items-center gap-3 rounded-xl p-8 text-center"
                  style={{ border: '1px dashed #1E1E2E' }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full"
                    style={{ backgroundColor: 'rgba(124,58,237,0.12)' }}
                  >
                    <Bookmark className="h-5 w-5 text-violet-300" />
                  </span>
                  <p className="max-w-xs text-sm text-text-muted">
                    No bookmarks yet. Tap the bookmark icon next to a question to save it
                    here for review.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 space-y-2.5">
                  {bookmarkedQuestions.map((q) => {
                    const userAnswer = answers[q.id];
                    const state = !userAnswer
                      ? 'skipped'
                      : userAnswer === q.correctAnswer
                        ? 'correct'
                        : 'incorrect';
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => handleReview(q.id)}
                          className="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:border-violet-500/40"
                          style={{
                            backgroundColor: '#0A0A12',
                            border: '1px solid #1E1E2E',
                          }}
                        >
                          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-violet-500/15 text-violet-200">
                            <BookmarkCheck className="h-3.5 w-3.5" />
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-[0.18em] text-violet-300">
                                {q.topic}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] uppercase tracking-[0.18em]',
                                  state === 'correct' && 'text-emerald-300',
                                  state === 'incorrect' && 'text-rose-300',
                                  state === 'skipped' && 'text-text-muted'
                                )}
                              >
                                · {state}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-primary">
                              {q.question}
                            </p>
                          </div>
                          <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-white" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </FadeUp>
        </motion.div>
      </div>
    </main>
  );
}

function TopNav({ onLogout }: { onLogout: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(9, 9, 14, 0.85)',
        borderBottom: '1px solid #1E1E2E',
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400"
            style={{ boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}
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
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs text-text-muted transition hover:text-white"
          style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <aside
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col px-3 py-6 lg:flex"
      style={{ borderRight: '1px solid #1E1E2E', backgroundColor: 'rgba(9,9,14,0.6)' }}
    >
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive =
            !item.disabled &&
            !item.href.startsWith('#') &&
            (pathname === item.href ||
              (item.href === '/student/analytics' && pathname?.endsWith('/analytics')));
          return (
            <Link
              key={item.label}
              href={item.disabled ? '#' : item.href}
              aria-disabled={item.disabled}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'text-white'
                  : 'text-text-muted hover:bg-white/5 hover:text-white',
                item.disabled && 'opacity-60'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(124, 58, 237, 0.18)',
                      boxShadow: 'inset 0 0 0 1px rgba(159,103,255,0.35)',
                    }
                  : undefined
              }
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
              }}
            >
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md',
                  isActive ? 'bg-violet-500 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]' : 'bg-white/5 text-text-muted group-hover:text-white'
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.disabled && (
                <Lock className="h-3 w-3 text-text-muted/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto rounded-xl p-4"
        style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
          Streak
        </p>
        <p
          className="mt-1.5 text-2xl font-semibold text-white"
          style={{ textShadow: '0 0 12px rgba(124,58,237,0.45)' }}
        >
          1 Day
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Return tomorrow to extend.
        </p>
      </div>
    </aside>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent = '#9F67FF',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: string;
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

function Panel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E' }}
    >
      {children}
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  accessory,
}: {
  title: string;
  subtitle?: string;
  accessory?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
      </div>
      {accessory}
    </div>
  );
}

function FadeUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function buildHistoryChart(currentAccuracy: number) {
  const today = new Date();
  const baseline = [54, 58, 61, 66, 65, 70, 73, 76];
  const points = baseline.map((acc, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (baseline.length - i));
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      accuracy: acc,
    };
  });
  points.push({ date: 'Today', accuracy: currentAccuracy });
  return points;
}
