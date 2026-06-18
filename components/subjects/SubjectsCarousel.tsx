'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useQuizStore } from '@/lib/store';

type SubjectCard = {
  id: string;
  name: string;
  instructor: string;
  questions: number;
  available: boolean;
  isVip: boolean;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  borderColor: string;
  description: string;
};

const SUBJECTS: SubjectCard[] = [
  {
    id: 'histology',
    name: 'Histology',
    instructor: 'Dr. Ahmed Zahra',
    questions: 450,
    available: true,
    isVip: true,
    emoji: '🔬',
    gradientFrom: 'rgba(139,92,246,0.2)',
    gradientTo: 'rgba(88,28,135,0.2)',
    glow: 'rgba(139,92,246,0.5)',
    borderColor: 'rgba(139,92,246,0.5)',
    description: 'Tissue & cellular structure',
  },
  {
    id: 'anatomy',
    name: 'Anatomy',
    instructor: 'Coming Soon',
    questions: 0,
    available: false,
    isVip: false,
    emoji: '🧠',
    gradientFrom: 'rgba(59,130,246,0.1)',
    gradientTo: 'rgba(30,58,138,0.1)',
    glow: 'rgba(59,130,246,0.2)',
    borderColor: 'rgba(59,130,246,0.2)',
    description: 'Structure of the body',
  },
  {
    id: 'physiology',
    name: 'Physiology',
    instructor: 'Coming Soon',
    questions: 0,
    available: false,
    isVip: false,
    emoji: '❤️',
    gradientFrom: 'rgba(239,68,68,0.1)',
    gradientTo: 'rgba(127,29,29,0.1)',
    glow: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.2)',
    description: 'Body functions & systems',
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    instructor: 'Coming Soon',
    questions: 0,
    available: false,
    isVip: false,
    emoji: '⚗️',
    gradientFrom: 'rgba(16,185,129,0.1)',
    gradientTo: 'rgba(6,78,59,0.1)',
    glow: 'rgba(16,185,129,0.2)',
    borderColor: 'rgba(16,185,129,0.2)',
    description: 'Molecular biology & metabolism',
  },
  {
    id: 'pathology',
    name: 'Pathology',
    instructor: 'Coming Soon',
    questions: 0,
    available: false,
    isVip: false,
    emoji: '🧫',
    gradientFrom: 'rgba(236,72,153,0.1)',
    gradientTo: 'rgba(131,24,67,0.1)',
    glow: 'rgba(236,72,153,0.2)',
    borderColor: 'rgba(236,72,153,0.2)',
    description: 'Disease mechanisms',
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    instructor: 'Coming Soon',
    questions: 0,
    available: false,
    isVip: false,
    emoji: '💊',
    gradientFrom: 'rgba(249,115,22,0.1)',
    gradientTo: 'rgba(124,45,18,0.1)',
    glow: 'rgba(249,115,22,0.2)',
    borderColor: 'rgba(249,115,22,0.2)',
    description: 'Drugs & mechanisms',
  },
];

export function SubjectsCarousel() {
  return (
    <section
      style={{
        padding: '80px 0',
        background: 'linear-gradient(180deg, #070B24 0%, #030617 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-6 text-center"
      >
        <span
          className="mb-4 inline-flex items-center gap-2"
          style={{
            padding: '8px 16px',
            borderRadius: 100,
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: 12,
            fontWeight: 600,
            color: '#C084FC',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          Medical Curriculum
        </span>

        <h2
          className="mb-3 text-white"
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-1px',
          }}
        >
          Explore All Subjects
        </h2>

        <p style={{ fontSize: 16, color: '#6B7280' }}>
          More subjects coming soon
        </p>
      </motion.div>

      <div
        className="scrollbar-none mx-auto mt-12 flex max-w-7xl gap-5 overflow-x-auto"
        style={{ padding: '20px 24px 30px' }}
      >
        {SUBJECTS.map((subject, idx) => (
          <SubjectCardComponent key={subject.id} subject={subject} index={idx} />
        ))}
      </div>
    </section>
  );
}

function SubjectCardComponent({
  subject,
  index,
}: {
  subject: SubjectCard;
  index: number;
}) {
  const router = useRouter();
  const startSession = useQuizStore((s) => s.startSession);

  function handleClick() {
    if (!subject.available) return;
    if (subject.id === 'histology') {
      startSession();
      router.push('/student/quiz/histology');
    }
  }

  const isActive = subject.id === 'histology';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onClick={handleClick}
      style={{
        width: 220,
        flexShrink: 0,
        height: 280,
        borderRadius: 20,
        background: 'linear-gradient(180deg, #12183D, #0B102B)',
        border: `1px solid ${subject.borderColor}`,
        cursor: subject.available ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 300ms ease',
        boxShadow: isActive
          ? '0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.15)'
          : 'none',
      }}
      onMouseEnter={(e) => {
        if (!subject.available) return;
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 20px 60px ${subject.glow}`;
        e.currentTarget.style.borderColor = subject.glow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isActive
          ? '0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.15)'
          : 'none';
        e.currentTarget.style.borderColor = subject.borderColor;
      }}
    >
      {/* Thumbnail area */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 150,
          background: `linear-gradient(135deg, ${subject.gradientFrom}, ${subject.gradientTo})`,
        }}
      >
        {/* Radial glow overlay */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${subject.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Emoji */}
        <span
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            fontSize: 64,
            filter: `drop-shadow(0 0 20px ${subject.glow})`,
            animation: subject.available
              ? 'float 3s ease-in-out infinite'
              : 'none',
          }}
        >
          {subject.emoji}
        </span>

        {/* VIP badge or lock */}
        {subject.isVip ? (
          <span
            className="absolute"
            style={{
              top: 12,
              right: 12,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
              fontSize: 10,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.5px',
            }}
          >
            VIP
          </span>
        ) : (
          <span
            className="absolute grid place-items-center"
            style={{
              top: 12,
              right: 12,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Lock className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: 16 }}>
        <p
          className="mb-1 text-white"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          {subject.name}
        </p>
        <p
          className="mb-3"
          style={{
            fontSize: 12,
            color: subject.available ? '#6B7280' : 'rgba(192,132,252,0.6)',
          }}
        >
          {subject.instructor}
        </p>

        <div
          aria-hidden
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.05)',
            marginBottom: 12,
          }}
        />

        {subject.available ? (
          <div
            className="flex items-center gap-3"
            style={{ fontSize: 10, color: '#6B7280' }}
          >
            <span className="flex items-center gap-1">
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{ background: '#A8B0D3' }}
              />
              Questions
            </span>
            <span className="flex items-center gap-1">
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{ background: '#A8B0D3' }}
              />
              Explanations
            </span>
            <span>References</span>
          </div>
        ) : (
          <p
            className="text-center"
            style={{
              fontSize: 11,
              color: 'rgba(139,92,246,0.5)',
            }}
          >
            Coming Soon
          </p>
        )}
      </div>
    </motion.div>
  );
}
