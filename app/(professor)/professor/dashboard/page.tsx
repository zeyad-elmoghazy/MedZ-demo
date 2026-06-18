'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Activity as ActivityIcon,
  AlertCircle,
  BarChart2,
  BookOpen,
  ChevronDown,
  Flame,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  Settings,
  Upload,
  Users,
  CheckSquare,
  X,
  Zap,
} from 'lucide-react';
import {
  clearDemoProfile,
  createBrowserClient,
  isDemoMode,
  readDemoProfile,
} from '@/lib/supabase';
import {
  getMockProfessorStudents,
  type StudentRecord,
  type SubjectBreakdown,
} from '@/lib/professor-types';
import { cn } from '@/lib/utils';

type SortBy = 'name' | 'accuracy' | 'lastActive';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, href: '/professor/dashboard', active: true },
  { label: 'Students', icon: <Users className="h-4 w-4" />, href: '/professor/dashboard#students' },
  { label: 'Questions', icon: <BookOpen className="h-4 w-4" />, href: '/professor/dashboard#questions' },
  { label: 'Upload Content', icon: <Upload className="h-4 w-4" />, href: '/professor/dashboard#upload' },
  { label: 'Review & Approve', icon: <CheckSquare className="h-4 w-4" />, href: '/professor/dashboard#review' },
  { label: 'Analytics', icon: <BarChart2 className="h-4 w-4" />, href: '/professor/dashboard#analytics' },
  { label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/professor/dashboard#settings' },
];

export default function ProfessorDashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [professorName, setProfessorName] = useState('Professor');
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Name lookup — demo profile first, then real session.
      if (isDemoMode()) {
        const demo = readDemoProfile();
        if (!cancelled && demo?.full_name) setProfessorName(demo.full_name);
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
            if (!cancelled && profile?.full_name) {
              setProfessorName(profile.full_name);
            }
          }
        } catch {
          // best-effort
        }
      }

      // Roster — demo gets mock data, real gets the API.
      if (isDemoMode()) {
        if (!cancelled) {
          setStudents(getMockProfessorStudents());
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/professor/students', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { students: StudentRecord[] };
        if (cancelled) return;
        setStudents(body.students ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load students.'
        );
        setStudents([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

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

  // Derived stats — recompute when students change.
  const stats = useMemo(() => {
    const total = students.length;
    const withSessions = students.filter((s) => s.totalAnswered > 0);
    const avgAccuracy =
      withSessions.length === 0
        ? 0
        : Math.round(
            (withSessions.reduce((sum, s) => sum + s.overallAccuracy, 0) /
              withSessions.length) *
              10
          ) / 10;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeToday = students.filter(
      (s) => s.lastActive && new Date(s.lastActive) >= todayStart
    ).length;

    return { total, avgAccuracy, activeToday };
  }, [students]);

  // Filter + sort.
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? students.filter((s) => s.fullName.toLowerCase().includes(term))
      : students;

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'accuracy') return b.overallAccuracy - a.overallAccuracy;
      // lastActive — most recent first; nulls go to the end.
      const aT = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const bT = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return bT - aT;
    });

    return sorted;
  }, [students, search, sortBy]);

  const firstName = professorName.split(' ')[0] ?? 'Professor';

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#09090E' }}>
      <TopNav signingOut={signingOut} onLogout={handleLogout} />

      <div className="mx-auto flex w-full max-w-[1400px]">
        <SideNav items={NAV_ITEMS} />

        <div className="flex-1 px-6 py-10 lg:px-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">
              Welcome, Dr. {firstName} 👋
            </h1>
            <p className="text-sm text-slate-400">
              Monitor your students&apos; progress below.
            </p>
          </header>

          {/* Top stats row */}
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Total Students"
              value={isLoading ? '—' : stats.total.toString()}
              accent="#9F67FF"
            />
            <StatCard
              icon={<Activity className="h-4 w-4" />}
              label="Average Accuracy"
              value={
                isLoading
                  ? '—'
                  : stats.total === 0
                    ? '0%'
                    : `${stats.avgAccuracy}%`
              }
              accent="#10B981"
            />
            <StatCard
              icon={<Zap className="h-4 w-4" />}
              label="Active Today"
              value={isLoading ? '—' : stats.activeToday.toString()}
              accent="#F97316"
            />
          </section>

          {/* Students table */}
          <section
            className="mt-6 rounded-2xl p-6"
            style={{
              backgroundColor: '#161B26',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-white">Students</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-64 rounded-xl pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    style={{
                      backgroundColor: '#0F0F1A',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        'rgba(255,255,255,0.07)')
                    }
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-10 appearance-none rounded-xl pl-3 pr-9 text-sm text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0F0F1A',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'><path d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z'/></svg>\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="accuracy">Sort by Accuracy</option>
                  <option value="lastActive">Sort by Last Active</option>
                </select>
              </div>
            </div>

            {/* Column headers */}
            <div
              className="grid items-center px-4 py-2 text-xs uppercase tracking-wider text-slate-500"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px',
              }}
            >
              <span>Student</span>
              <span className="text-center">Challenges</span>
              <span className="text-center">Accuracy</span>
              <span className="text-center">Correct</span>
              <span className="text-center">Streak</span>
              <span className="text-center">Last Active</span>
              <span className="text-center">Details</span>
            </div>

            {/* Rows */}
            <div className="mt-1">
              {isLoading ? (
                <LoadingRows />
              ) : students.length === 0 ? (
                <EmptyRoster error={error} />
              ) : visibleStudents.length === 0 ? (
                <NoMatches term={search} onClear={() => setSearch('')} />
              ) : (
                visibleStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    isExpanded={expandedStudent === student.id}
                    onToggle={() =>
                      setExpandedStudent(
                        expandedStudent === student.id ? null : student.id
                      )
                    }
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// ============== Top nav ==============
function TopNav({
  signingOut,
  onLogout,
}: {
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
        <Link href="/professor/dashboard" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400"
            style={{ boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}
          >
            <ActivityIcon className="h-4 w-4 text-white" />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-base font-bold tracking-tight text-white"
              style={{ textShadow: '0 0 14px rgba(124,58,237,0.5)' }}
            >
              MedZ
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Professor
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={signingOut}
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs text-text-muted transition hover:text-white disabled:opacity-50"
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
          const isActive = item.active && pathname?.endsWith('/professor/dashboard');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'text-white'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(124, 58, 237, 0.18)',
                      boxShadow: 'inset 0 0 0 1px rgba(159,103,255,0.35)',
                    }
                  : undefined
              }
            >
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md',
                  isActive
                    ? 'bg-violet-500 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]'
                    : 'bg-white/5 text-text-muted group-hover:text-white'
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto rounded-xl p-4"
        style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
          Workspace
        </p>
        <p className="mt-1.5 text-sm font-semibold text-white">
          Faculty of Medicine
        </p>
        <p className="mt-1 text-xs text-text-muted">Histology · Block 1</p>
      </div>
    </aside>
  );
}

// ============== Stats card ==============
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        backgroundColor: '#161B26',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
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
      </div>
    </div>
  );
}

// ============== Student row ==============
function StudentRow({
  student,
  isExpanded,
  onToggle,
}: {
  student: StudentRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full cursor-pointer items-center rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* 1. Student */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-xs font-bold text-white"
            style={{ boxShadow: '0 0 14px rgba(124,58,237,0.35)' }}
          >
            {initialsFor(student.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {student.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{student.email}</p>
          </div>
        </div>

        {/* 2. Challenges */}
        <p className="text-center font-mono text-sm text-slate-300">
          {student.challengesCompleted}
        </p>

        {/* 3. Accuracy */}
        <p
          className={cn(
            'text-center text-sm font-semibold',
            accuracyColor(student.overallAccuracy)
          )}
        >
          {student.totalAnswered === 0
            ? '—'
            : `${student.overallAccuracy}%`}
        </p>

        {/* 4. Correct */}
        <p className="text-center font-mono text-sm text-slate-300">
          {student.totalAnswered === 0
            ? '—'
            : `${student.totalCorrect} / ${student.totalAnswered}`}
        </p>

        {/* 5. Streak */}
        <div className="flex items-center justify-center gap-1">
          {student.streakDays > 0 ? (
            <>
              <Flame className="h-3 w-3 text-orange-400" />
              <span className="text-sm text-slate-300">{student.streakDays}</span>
            </>
          ) : (
            <span className="text-sm text-slate-500">—</span>
          )}
        </div>

        {/* 6. Last active */}
        <p className="text-center text-xs text-slate-500">
          {student.lastActive
            ? formatRelativeDate(student.lastActive)
            : 'Never'}
        </p>

        {/* 7. Details chevron */}
        <div className="flex justify-center">
          <span
            className={cn(
              'grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:text-white',
              isExpanded && 'text-white'
            )}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ExpandedPanel student={student} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandedPanel({ student }: { student: StudentRecord }) {
  const recent = useMemo(() => {
    return student.subjects
      .filter((s) => s.sessionsCompleted > 0)
      .slice(0, 3);
  }, [student.subjects]);

  return (
    <div
      className="mx-2 mb-2 rounded-xl p-4"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      <p className="text-xs text-slate-400">Subject Breakdown</p>
      <ul className="mt-3 space-y-2.5">
        {student.subjects.map((s) => (
          <SubjectRow key={s.subjectId} subject={s} />
        ))}
      </ul>

      <p className="mt-5 text-xs text-slate-400">Recent Challenge History</p>
      {recent.length === 0 ? (
        <p className="mt-2 text-xs text-slate-600">No challenges yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {recent.map((r) => (
            <span
              key={r.subjectId}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs',
                accuracyColor(r.avgAccuracy)
              )}
            >
              <span className="text-slate-300">{r.subjectName}</span>
              <span>·</span>
              <span>{Math.round(r.avgAccuracy)}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectRow({ subject }: { subject: SubjectBreakdown }) {
  const noAttempts = subject.sessionsCompleted === 0;

  return (
    <li className="flex items-center gap-3 text-xs">
      <span className="w-32 shrink-0 text-slate-300">{subject.subjectName}</span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {!noAttempts && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, subject.avgAccuracy)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background:
                subject.avgAccuracy >= 80
                  ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                  : subject.avgAccuracy >= 60
                    ? 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)'
                    : 'linear-gradient(90deg, #EF4444 0%, #FCA5A5 100%)',
            }}
          />
        )}
      </div>
      {noAttempts ? (
        <span className="w-16 text-right text-slate-600">No attempts</span>
      ) : (
        <span
          className={cn(
            'w-16 text-right font-medium',
            accuracyColor(subject.avgAccuracy)
          )}
        >
          {Math.round(subject.avgAccuracy)}%
        </span>
      )}
    </li>
  );
}

// ============== Empty / loading helpers ==============
function LoadingRows() {
  return (
    <div className="space-y-2 py-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid items-center gap-3 rounded-xl px-4 py-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-44 rounded bg-slate-800/50 animate-pulse" />
            </div>
          </div>
          {[0, 1, 2, 3, 4].map((j) => (
            <div
              key={j}
              className="mx-auto h-4 w-16 rounded bg-slate-800/50 animate-pulse"
            />
          ))}
          <div className="mx-auto h-6 w-6 rounded bg-slate-800/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyRoster({ error }: { error: string | null }) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <span
        className="mb-3 grid h-12 w-12 place-items-center rounded-full"
        style={{
          backgroundColor: 'rgba(124,58,237,0.12)',
          color: '#C4B5FD',
        }}
      >
        {error ? <AlertCircle className="h-5 w-5" /> : <Users className="h-5 w-5" />}
      </span>
      <p className="text-sm text-slate-500">
        {error ? `Couldn't load students — ${error}` : 'No students enrolled yet.'}
      </p>
    </div>
  );
}

function NoMatches({
  term,
  onClear,
}: {
  term: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <p className="text-sm text-slate-500">
        No students match &ldquo;<span className="text-slate-300">{term}</span>
        &rdquo;
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs text-text-muted transition hover:text-white"
        style={{ border: '1px solid #1E1E2E', backgroundColor: '#0F0F1A' }}
      >
        <X className="h-3 w-3" />
        Clear search
      </button>
    </div>
  );
}

// ============== Helpers ==============
function initialsFor(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

function accuracyColor(accuracy: number): string {
  if (accuracy === 0) return 'text-slate-500';
  if (accuracy >= 80) return 'text-emerald-400';
  if (accuracy >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
