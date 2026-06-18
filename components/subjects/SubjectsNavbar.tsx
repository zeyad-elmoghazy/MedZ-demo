'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Menu, Moon, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Subjects', href: '/student/subjects', active: true },
  { label: 'Questions', href: '/student/quiz/histology' },
  { label: 'AI Tutor', href: '#tutor' },
  { label: 'Leaderboard', href: '#leaderboard' },
  { label: 'Pricing', href: '#pricing' },
];

export function SubjectsNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: 72,
          background: 'rgba(3,6,23,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                boxShadow: '0 0 20px rgba(139,92,246,0.5)',
              }}
            >
              <Activity className="h-4 w-4 text-white" />
            </span>
            <span
              className="text-2xl font-bold text-white"
              style={{ letterSpacing: '-0.5px' }}
            >
              MedZ
            </span>
          </Link>

          {/* Center nav (md+) */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A8B0D3',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A8B0D3')}
            >
              <Moon className="h-4 w-4" />
            </button>

            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm font-medium transition-colors duration-200 sm:inline-block"
              style={{ color: '#A8B0D3' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A8B0D3')}
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 sm:inline-block"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign Up
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-lg md:hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A8B0D3',
              }}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col p-6 md:hidden"
          style={{
            background: 'rgba(3,6,23,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-2xl font-bold text-white"
              style={{ letterSpacing: '-0.5px' }}
            >
              MedZ
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A8B0D3',
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-12 flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold transition-colors"
                style={{ color: link.active ? '#FFFFFF' : '#A8B0D3' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-5 py-3 text-center text-sm font-medium"
              style={{
                color: '#A8B0D3',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium transition-colors duration-200"
      style={{ color: active ? '#FFFFFF' : '#A8B0D3' }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = '#FFFFFF';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = '#A8B0D3';
      }}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute left-0 right-0"
          style={{
            bottom: '-22px',
            height: 2,
            background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
            borderRadius: 2,
          }}
        />
      )}
    </Link>
  );
}
