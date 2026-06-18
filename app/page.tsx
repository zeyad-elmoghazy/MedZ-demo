'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  drift: number;
  duration: number;
  delay: number;
  hue: 'violet' | 'white' | 'emerald';
};

const HUES: Record<Particle['hue'], string> = {
  violet: '#9F67FF',
  white: '#F8FAFC',
  emerald: '#10B981',
};

function buildParticles(count = 26): Particle[] {
  const palette: Particle['hue'][] = ['violet', 'violet', 'violet', 'white', 'emerald'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.round(((i * 97) % 100) + (i % 7) * 0.4),
    top: Math.round(((i * 131) % 100) + (i % 5) * 0.6),
    size: 4 + ((i * 3) % 9),
    opacity: 0.18 + ((i % 6) * 0.08),
    drift: 18 + ((i * 5) % 32),
    duration: 14 + ((i * 3) % 18),
    delay: -((i * 1.7) % 14),
    hue: palette[i % palette.length],
  }));
}

export default function MedZOpeningScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const particles = useMemo(() => buildParticles(28), []);

  function handleStart() {
    if (isExiting) return;
    setIsExiting(true);
    window.setTimeout(() => {
      router.push('/login');
    }, 620);
  }

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#09090E' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 56px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 56px)',
          maskImage:
            'radial-gradient(ellipse at center, black 60%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 60%, transparent 100%)',
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(124,58,237,0.08) 35%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, p.drift, -p.drift * 0.6, p.drift * 0.4, 0],
              y: [0, -p.drift * 0.8, p.drift * 0.5, -p.drift * 0.3, 0],
              opacity: [0, p.opacity, p.opacity * 1.4, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: HUES[p.hue],
              boxShadow: `0 0 ${p.size * 2}px ${HUES[p.hue]}`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.section
            key="hero"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-7xl font-bold tracking-tight text-white md:text-8xl lg:text-9xl"
              style={{
                textShadow:
                  '0 0 40px #7C3AED, 0 0 80px rgba(124,58,237,0.35)',
              }}
            >
              MedZ
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="mt-6 text-2xl font-medium tracking-tight text-white/85 md:text-3xl"
            >
              Master Medicine. Smarter.{' '}
              <span style={{ color: '#7C3AED' }}>Faster.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: 1,
                y: 0,
                boxShadow: [
                  '0 0 20px #7C3AED',
                  '0 0 40px #7C3AED',
                  '0 0 20px #7C3AED',
                ],
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.3, ease: 'easeOut' },
                y: { duration: 0.7, delay: 0.3, ease: 'easeOut' },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                },
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: '0 0 56px #7C3AED, 0 0 96px rgba(159,103,255,0.45)',
                transition: { duration: 0.25 },
              }}
              whileTap={{ scale: 0.97 }}
              className="mt-12 rounded-full"
            >
              <button
                type="button"
                onClick={handleStart}
                className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090E]"
              >
                Start Learning
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-10 text-xs uppercase tracking-[0.32em] text-white/35"
            >
              Histology · Pharmacology · OSCE
            </motion.p>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
