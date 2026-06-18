'use client';

import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistologyQuestion } from '@/data/histology-questions';

type QuizSidebarProps = {
  questions: HistologyQuestion[];
  currentIndex: number;
  answers: Record<number, string>;
  bookmarks: number[];
  onJump: (index: number) => void;
};

export function QuizSidebar({
  questions,
  currentIndex,
  answers,
  bookmarks,
  onJump,
}: QuizSidebarProps) {
  const answered = Object.keys(answers).length;
  const correctCount = questions.reduce((acc, q) => {
    return answers[q.id] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <aside className="glass sticky top-24 hidden h-fit w-72 shrink-0 rounded-2xl p-5 xl:block">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Session map</h3>
        <span className="text-xs text-text-muted">
          {answered}/{questions.length} answered
        </span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const choice = answers[q.id];
          const isCorrect = choice === q.correctAnswer;
          const isCurrent = i === currentIndex;
          const bookmarked = bookmarks.includes(q.id);
          return (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onJump(i)}
              className={cn(
                'relative grid h-10 w-10 place-items-center rounded-lg border text-xs font-semibold transition',
                isCurrent
                  ? 'border-accent bg-accent text-white shadow-glow'
                  : choice
                    ? isCorrect
                      ? 'border-success/40 bg-success/15 text-success'
                      : 'border-error/40 bg-error/15 text-error'
                    : 'border-white/10 bg-white/5 text-text-muted hover:border-accent/40'
              )}
            >
              {i + 1}
              {bookmarked && (
                <Bookmark className="absolute -right-1 -top-1 h-3 w-3 text-accent-glow" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-white/5 pt-5 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Correct
          </span>
          <span>{correctCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <Circle className="h-3.5 w-3.5 text-error" /> Incorrect
          </span>
          <span>{answered - correctCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <Bookmark className="h-3.5 w-3.5 text-accent-glow" /> Bookmarked
          </span>
          <span>{bookmarks.length}</span>
        </div>
      </div>
    </aside>
  );
}
