'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsCardProps = {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: 'violet' | 'emerald' | 'crimson';
};

const accentStyles: Record<NonNullable<StatsCardProps['accent']>, string> = {
  violet: 'from-accent/30 via-accent/10 to-transparent text-accent-glow',
  emerald: 'from-success/25 via-success/10 to-transparent text-success',
  crimson: 'from-error/25 via-error/10 to-transparent text-error',
};

export function StatsCard({
  label,
  value,
  delta,
  hint,
  icon,
  accent = 'violet',
}: StatsCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70',
          accentStyles[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs text-text-muted">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-text-primary">
            {icon}
          </span>
        ) : null}
      </div>
      {typeof delta === 'number' && (
        <div className="relative mt-4 flex items-center gap-1 text-xs">
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-error" />
          )}
          <span className={cn(positive ? 'text-success' : 'text-error')}>
            {positive ? '+' : ''}
            {delta}%
          </span>
          <span className="text-text-muted">vs. last week</span>
        </div>
      )}
    </motion.div>
  );
}
