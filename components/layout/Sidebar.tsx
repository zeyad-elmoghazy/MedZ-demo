'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  Microscope,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const itemsByRole: Record<'student' | 'professor' | 'admin', NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Question Bank', href: '/student/quiz/histology', icon: <BookOpenCheck className="h-4 w-4" /> },
    { label: 'Schedule', href: '/student/dashboard#schedule', icon: <CalendarClock className="h-4 w-4" /> },
    { label: 'Lectures', href: '/student/dashboard#lectures', icon: <Microscope className="h-4 w-4" /> },
    { label: 'Settings', href: '/student/dashboard#settings', icon: <Settings className="h-4 w-4" /> },
  ],
  professor: [
    { label: 'Overview', href: '/professor/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Cohorts', href: '/professor/dashboard#cohorts', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Question Bank', href: '/professor/dashboard#bank', icon: <BookOpenCheck className="h-4 w-4" /> },
    { label: 'Analytics', href: '/professor/dashboard#analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Settings', href: '/professor/dashboard#settings', icon: <Settings className="h-4 w-4" /> },
  ],
  admin: [
    { label: 'Operations', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Programs', href: '/admin/dashboard#programs', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Faculty', href: '/admin/dashboard#faculty', icon: <Microscope className="h-4 w-4" /> },
    { label: 'Analytics', href: '/admin/dashboard#analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Settings', href: '/admin/dashboard#settings', icon: <Settings className="h-4 w-4" /> },
  ],
};

export function Sidebar({ role = 'student' }: { role?: 'student' | 'professor' | 'admin' }) {
  const pathname = usePathname();
  const items = itemsByRole[role];

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-white/5 bg-background/40 px-3 py-6 lg:flex lg:flex-col">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href.split('#')[0];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-accent/15 text-text-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md',
                  active
                    ? 'bg-accent text-white shadow-glow'
                    : 'bg-white/5 text-text-muted group-hover:text-text-primary'
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">streak</p>
        <p className="mt-2 text-2xl font-semibold gradient-text">17 days</p>
        <p className="mt-1 text-xs text-text-muted">
          Keep it going — finish 5 MCQs to extend.
        </p>
      </div>
    </aside>
  );
}
