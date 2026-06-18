# MedZ — Adaptive medical learning

Next.js 14 (App Router) demo for an adaptive medical question bank, with student,
professor, and program-admin surfaces. Tailwind, shadcn-style components,
Framer Motion, Zustand state, Supabase auth scaffolding, and a Dr.&nbsp;Zahra–
authored Histology MCQ bank.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

Open <http://localhost:3000>.

## Surfaces

- `/` — marketing landing
- `/login`, `/signup` — Supabase-backed auth screens
- `/dashboard` — student home (stats, weekly chart, subjects)
- `/quiz/[subjectId]` — split/focus MCQ runner with handwritten reference notes
- `/professor/dashboard` — cohort analytics, flagged questions, activity feed
- `/admin/dashboard` — program-level operations, MRR, partner status

## State

Quiz progress lives in `lib/store.ts` (Zustand with `localStorage` persistence):
`currentQuestionIndex`, `answers`, `bookmarks`, `notes`, `quizMode`,
`sessionComplete`, plus actions `answerQuestion`, `toggleBookmark`, `setNote`,
`nextQuestion`, `prevQuestion`, `jumpToQuestion`, `setQuizMode`,
`completeSession`, `resetSession`.

## Question bank

`data/histology-questions.ts` contains 11 medically accurate MCQs covering the
blood–brain barrier, epithelium classification, cell junctions, connective
tissue, pemphigus/desmosome pathology, goblet cells, hyaline cartilage,
osteoclasts, sarcomere mechanics, eosinophil identification, and germinal
centers — each with four choices, a 3–4 sentence explanation, and a
handwritten-style reference note attributed to Dr. Zahra.
