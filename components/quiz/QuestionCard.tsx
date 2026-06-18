'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, letterFor } from '@/lib/utils';
import type { HistologyQuestion } from '@/data/histology-questions';

type QuestionCardProps = {
  question: HistologyQuestion;
  selectedChoice?: string;
  isBookmarked: boolean;
  onSelect: (choiceId: string) => void;
  onToggleBookmark: () => void;
  index: number;
  total: number;
};

export function QuestionCard({
  question,
  selectedChoice,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  index,
  total,
}: QuestionCardProps) {
  const answered = Boolean(selectedChoice);
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass relative rounded-3xl p-7 md:p-9"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            Q{index + 1} of {total}
          </Badge>
          <Badge>{question.topic}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleBookmark}
          className={cn(
            'gap-2',
            isBookmarked && 'text-accent-glow'
          )}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
      </div>

      <h2 className="mt-6 text-lg leading-relaxed text-text-primary md:text-xl">
        {question.question}
      </h2>

      <div className="mt-7 grid gap-3">
        {question.choices.map((choice, i) => {
          const isSelected = selectedChoice === choice.id;
          const isCorrect = question.correctAnswer === choice.id;
          const showFeedback = answered;
          const stateClasses = !showFeedback
            ? isSelected
              ? 'border-accent/60 bg-accent/10 text-text-primary'
              : 'border-white/10 bg-white/[0.03] hover:border-accent/40 hover:bg-accent/5'
            : isCorrect
              ? 'border-success/60 bg-success/10 text-text-primary'
              : isSelected
                ? 'border-error/60 bg-error/10 text-text-primary'
                : 'border-white/5 bg-white/[0.02] text-text-muted';

          return (
            <motion.button
              key={choice.id}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => !answered && onSelect(choice.id)}
              className={cn(
                'flex items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition',
                stateClasses,
                answered && 'cursor-default'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-semibold',
                  !showFeedback && isSelected && 'bg-accent text-white',
                  !showFeedback && !isSelected && 'bg-white/5 text-text-muted',
                  showFeedback && isCorrect && 'bg-success text-white',
                  showFeedback && !isCorrect && isSelected && 'bg-error text-white',
                  showFeedback && !isCorrect && !isSelected && 'bg-white/5 text-text-muted'
                )}
              >
                {showFeedback && isCorrect ? (
                  <Check className="h-4 w-4" />
                ) : showFeedback && isSelected ? (
                  <X className="h-4 w-4" />
                ) : (
                  letterFor(i)
                )}
              </span>
              <span className="text-sm leading-relaxed md:text-[15px]">{choice.text}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-7 rounded-2xl border border-accent/20 bg-accent/[0.06] p-5"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent-glow">
              <Check className="h-3.5 w-3.5" /> Explanation
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-primary">
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
