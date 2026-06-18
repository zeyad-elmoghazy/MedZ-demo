'use client';

import { motion } from 'framer-motion';
import { NotebookPen, Save, StickyNote } from 'lucide-react';
import { useState, useEffect } from 'react';

type NoteEditorProps = {
  reference: string;
  initialNote: string;
  onSave: (note: string) => void;
};

export function NoteEditor({ reference, initialNote, onSave }: NoteEditorProps) {
  const [draft, setDraft] = useState(initialNote);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(initialNote);
  }, [initialNote]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass flex h-full flex-col rounded-3xl p-7"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-text-muted">
        <StickyNote className="h-3.5 w-3.5 text-accent-glow" />
        Reference note
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#FDF8E3]/[0.07] p-5">
        <p className="font-handwritten text-xl leading-snug text-[#E6D9A8]">
          {reference}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-text-muted">
          <NotebookPen className="h-3.5 w-3.5 text-accent-glow" />
          Your note
        </div>
        <button
          type="button"
          onClick={() => {
            onSave(draft);
            setSaved(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-text-muted transition hover:border-accent/40 hover:text-text-primary"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Jot down mnemonics, slide cues, or links to lecture slides…"
        className="mt-3 h-48 w-full flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/70 focus:border-accent/50 focus:outline-none scrollbar-thin"
      />
    </motion.div>
  );
}
