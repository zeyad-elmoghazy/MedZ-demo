'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

type SubjectCardProps = {
  id: string;
  title: string;
  professor: string;
  questionCount: number;
  estimatedMinutes: number;
  completion: number;
  accuracy: number;
  isLive?: boolean;
};

export function SubjectCard({
  id,
  title,
  professor,
  questionCount,
  estimatedMinutes,
  completion,
  accuracy,
  isLive,
}: SubjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass relative overflow-hidden rounded-2xl p-6"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{professor}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        {isLive ? (
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            live
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-text-muted">
            <Sparkles className="h-3 w-3" />
            updated
          </span>
        )}
      </div>

      <div className="relative mt-6 flex items-center gap-4 text-xs text-text-muted">
        <span>{questionCount} MCQs</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> ~{estimatedMinutes} min
        </span>
        <span>Accuracy {accuracy}%</span>
      </div>

      <div className="relative mt-4 space-y-2">
        <Progress value={completion} />
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{completion}% complete</span>
          <Link
            href={`/student/quiz/${id}`}
            className="group inline-flex items-center gap-1 text-accent-glow"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
