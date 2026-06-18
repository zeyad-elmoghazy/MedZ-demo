/*
================================================================================
  MedZ — Supabase schema
  Run this in the Supabase SQL editor before using auth flows.
================================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'professor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: a user may read & update their own profile row.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable by owner"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin role is NOT selectable in the signup form — promote manually:
--   UPDATE profiles SET role = 'admin' WHERE email = 'you@university.edu';

================================================================================
*/

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  createClientComponentClient,
  createMiddlewareClient,
} from '@supabase/auth-helpers-nextjs';
import type { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface the misconfiguration early so login/signup don't fail mysteriously.
  // The literal warning runs once per server boot.
  // eslint-disable-next-line no-console
  console.warn(
    '[MedZ] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — copy .env.local.example.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const createBrowserClient = () => createClientComponentClient<Database>();

export const createMiddlewareSupabase = (
  req: NextRequest,
  res: NextResponse
) => createMiddlewareClient<Database>({ req, res });

export type UserRole = 'student' | 'professor' | 'admin';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
};

type QuizSessionRow = {
  id: string;
  student_id: string;
  subject_id: string;
  answers: Record<string, unknown>;
  score: number;
  total_questions: number;
  accuracy: number;
  violations_count: number;
  completed_at: string;
};

type DailyStreakRow = {
  id: string;
  student_id: string;
  streak_date: string;
  challenges_completed: number;
};

type BookmarkRow = {
  id: string;
  student_id: string;
  question_id: number;
  subject_id: string;
  created_at: string;
};

type NoteRow = {
  id: string;
  student_id: string;
  question_id: number;
  subject_id: string;
  content: string;
  updated_at: string;
};

type JobRow = {
  id: string;
  professor_id: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result: unknown;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

type StudentSubjectStatsRow = {
  student_id: string;
  subject_id: string;
  total_sessions: number;
  total_correct: number;
  total_answered: number;
  avg_accuracy: number;
  best_accuracy: number;
  last_attempted: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: UserRole;
          created_at?: string;
        };
        Update: Partial<Profile>;
      };
      quiz_sessions: {
        Row: QuizSessionRow;
        Insert: Partial<QuizSessionRow> & {
          student_id: string;
          subject_id: string;
        };
        Update: Partial<QuizSessionRow>;
      };
      daily_streaks: {
        Row: DailyStreakRow;
        Insert: Partial<DailyStreakRow> & {
          student_id: string;
          streak_date: string;
        };
        Update: Partial<DailyStreakRow>;
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: Partial<BookmarkRow> & {
          student_id: string;
          question_id: number;
          subject_id: string;
        };
        Update: Partial<BookmarkRow>;
      };
      notes: {
        Row: NoteRow;
        Insert: Partial<NoteRow> & {
          student_id: string;
          question_id: number;
          subject_id: string;
        };
        Update: Partial<NoteRow>;
      };
      jobs: {
        Row: JobRow;
        Insert: Partial<JobRow> & {
          id: string;
          professor_id: string;
          type: string;
        };
        Update: Partial<JobRow>;
      };
      student_subject_stats: {
        Row: StudentSubjectStatsRow;
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      get_student_streak: {
        Args: { p_student_id: string };
        Returns: number;
      };
    };
  };
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  student: '/student/dashboard',
  professor: '/professor/dashboard',
  admin: '/admin/dashboard',
};

export function dashboardPathForRole(role: UserRole | null | undefined) {
  if (!role) return '/login';
  return ROLE_DASHBOARD[role] ?? '/login';
}

/**
 * Demo mode: when no real Supabase project is configured, the app stores
 * the "profile" in localStorage and the middleware lets everything through.
 * Lets reviewers click through the UI without provisioning a backend.
 */
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || !url.startsWith('https://')) return true;
  return /demo|placeholder|example|your-supabase/i.test(url);
}

export const DEMO_PROFILE_KEY = 'medz-demo-profile';

export type DemoProfile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
};

export function readDemoProfile(): DemoProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoProfile;
    if (!parsed || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDemoProfile(profile: DemoProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
}

export function clearDemoProfile() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_PROFILE_KEY);
}

export function inferRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase();
  if (/\b(admin|ops|director)\b/.test(lower)) return 'admin';
  if (/\b(prof|professor|faculty|dr|teach|instructor)\b/.test(lower)) return 'professor';
  return 'student';
}
