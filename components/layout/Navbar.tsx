'use client';

import Link from 'next/link';
import { Activity, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type NavbarProps = {
  userName?: string;
  role?: 'student' | 'professor' | 'admin';
};

export function Navbar({ userName = 'Yusuf K.', role = 'student' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-glow shadow-glow">
            <Activity className="h-4 w-4 text-white" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">MedZ</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {role}
            </span>
          </div>
        </Link>

        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            type="search"
            placeholder="Search subjects, lectures, MCQs…"
            className="h-10 pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition hover:text-text-primary"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-glow shadow-glow" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-glow text-xs font-semibold text-white">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
            <span className="text-xs text-text-muted">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
