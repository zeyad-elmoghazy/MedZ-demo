'use client';

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Crown } from 'lucide-react';
import { useQuizStore } from '@/lib/store';

const STATS = [
  { value: '450+', label: 'Questions' },
  { value: 'Detailed', label: 'Explanations' },
  { value: 'Visual', label: 'References' },
  { value: 'Exam', label: 'Focused' },
];

const FLOATING_BULLETS = [
  'Doctor of Medicine',
  'Cairo University',
  'Top-Rated Histology Expert',
  '10,000+ Students',
  'Trusted by Medical Students',
];

export function HeroSection() {
  const router = useRouter();
  const startSession = useQuizStore((s) => s.startSession);

  function handleStart() {
    startSession();
    router.push('/student/quiz/histology');
  }

  // Mouse-tracking 3D tilt.
  // tilt.x rotates around X axis (vertical tilt), tilt.y around Y
  // (horizontal tilt). Reset to 0/0 on leave so the card eases
  // back to flat over 0.6s; while moving, transitions run at
  // 0.1s so the card hugs the cursor.
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = (e.clientX - centerX) / 20;
    const rotateX = -(e.clientY - centerY) / 20;
    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const tiltActive = tilt.x !== 0 || tilt.y !== 0;

  return (
    <section
      className="relative grid items-center gap-12 overflow-hidden lg:grid-cols-[45fr_55fr] lg:gap-0"
      style={{
        minHeight: 550,
        background:
          'linear-gradient(135deg, #030617 0%, #070B24 50%, #0B102B 100%)',
        padding: '80px 0 40px 0',
      }}
    >
      {/* Background decorative — large violet orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          top: -100,
          left: -100,
        }}
      />

      {/* Background decorative — grid dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(139,92,246,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[45fr_55fr] lg:gap-0">
        {/* LEFT — doctor photo */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative flex h-full items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: '1000px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Layer 6 — floating histology "cell" decoration (behind everything) */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: -40,
              right: -60,
              width: 200,
              height: 200,
              opacity: 0.18,
              zIndex: 0,
            }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(139,92,246,0.3) 40%, transparent 70%)',
                boxShadow: '0 0 60px rgba(168,85,247,0.3)',
              }}
            >
              {/* "Organelles" — three smaller circles */}
              <span
                aria-hidden
                className="absolute"
                style={{
                  top: '24%',
                  left: '22%',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(192,132,252,0.3)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              />
              <span
                aria-hidden
                className="absolute"
                style={{
                  top: '52%',
                  left: '60%',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(192,132,252,0.3)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              />
              <span
                aria-hidden
                className="absolute"
                style={{
                  top: '64%',
                  left: '28%',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(192,132,252,0.3)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              />
            </div>
          </div>

          {/* Float wrapper — bobs the card + rings together.
              Tilt lives on a NESTED element so the float
              translateY and the tilt rotateX/Y compose instead
              of overwriting each other. */}
          <div
            className="relative"
            style={{
              animation: 'float 6s ease-in-out infinite',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Layer 1 — outermost holographic glow ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: 460,
                height: 460,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid rgba(139,92,246,0.2)',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}
            />

            {/* Layer 2 — second glow ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: 400,
                height: 400,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid rgba(168,85,247,0.35)',
                boxShadow:
                  '0 0 30px rgba(139,92,246,0.2), inset 0 0 30px rgba(139,92,246,0.05)',
                animation: 'glowPulse 3s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />

            {/* Tilt wrapper — 3D rotation from mouse position */}
            <div
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
                transition: tiltActive
                  ? 'transform 0.1s ease'
                  : 'transform 0.6s ease',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Layer 3 — gradient holographic frame */}
              <div
                className="relative"
                style={{
                  width: 380,
                  borderRadius: 24,
                  padding: 3,
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.6) 25%, rgba(59,130,246,0.8) 50%, rgba(6,182,212,0.4) 75%, rgba(139,92,246,0.9) 100%)',
                  boxShadow:
                    '0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.2), 0 0 120px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.05)',
                }}
              >
                {/* Layer 4 — photo inner card */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: 22,
                    background: '#0B102B',
                  }}
                >
                  <Image
                    src="/dr-zahra.jpg"
                    alt="Dr. Ahmed Zahra"
                    width={380}
                    height={460}
                    priority
                    style={{
                      width: 380,
                      height: 460,
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />

                  {/* A. Bottom fade — photo dissolves into dark */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={{
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 180,
                      background:
                        'linear-gradient(to top, #0B102B 0%, rgba(11,16,43,0.8) 40%, transparent 100%)',
                    }}
                  />

                  {/* B. Subtle purple tint overlay */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 50%, rgba(59,130,246,0.05) 100%)',
                      mixBlendMode: 'overlay',
                    }}
                  />

                  {/* C. Scan lines */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,92,246,0.015) 2px, rgba(139,92,246,0.015) 4px)',
                    }}
                  />
                </div>

                {/* Layer 5 — holographic corner accents */}
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    top: -1,
                    left: -1,
                    width: 24,
                    height: 24,
                    borderTop: '2px solid #A855F7',
                    borderLeft: '2px solid #A855F7',
                    borderRadius: '4px 0 0 0',
                    boxShadow: '-2px -2px 8px rgba(168,85,247,0.5)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    top: -1,
                    right: -1,
                    width: 24,
                    height: 24,
                    borderTop: '2px solid #A855F7',
                    borderRight: '2px solid #A855F7',
                    borderRadius: '0 4px 0 0',
                    boxShadow: '2px -2px 8px rgba(168,85,247,0.5)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    bottom: -1,
                    left: -1,
                    width: 24,
                    height: 24,
                    borderBottom: '2px solid #A855F7',
                    borderLeft: '2px solid #A855F7',
                    borderRadius: '0 0 0 4px',
                    boxShadow: '-2px 2px 8px rgba(168,85,247,0.5)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    bottom: -1,
                    right: -1,
                    width: 24,
                    height: 24,
                    borderBottom: '2px solid #A855F7',
                    borderRight: '2px solid #A855F7',
                    borderRadius: '0 0 4px 0',
                    boxShadow: '2px 2px 8px rgba(168,85,247,0.5)',
                  }}
                />

                {/* Layer 8 — bottom name badge */}
                <div
                  className="absolute flex items-center gap-3"
                  style={{
                    bottom: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    background: 'rgba(11,16,43,0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 100,
                    padding: '10px 24px',
                    boxShadow:
                      '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.2)',
                  }}
                >
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-white"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className="text-white"
                    style={{ fontSize: 14, fontWeight: 700 }}
                  >
                    Dr. Ahmed Zahra
                  </span>
                  <span
                    style={{
                      background: 'rgba(139,92,246,0.2)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: 100,
                      padding: '2px 8px',
                      fontSize: 10,
                      color: '#C084FC',
                      fontWeight: 600,
                    }}
                  >
                    Histology Expert
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 7 — floating glassmorphism info card (lg+) */}
          <div
            className="absolute hidden lg:block"
            style={{
              top: 20,
              left: -20,
              zIndex: 10,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '16px 20px',
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <p
              className="mb-1 text-white"
              style={{ fontSize: 13, fontWeight: 700 }}
            >
              Dr. Ahmed Zahra
            </p>
            <ul className="flex flex-col gap-1">
              {FLOATING_BULLETS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5"
                  style={{ fontSize: 11, color: '#A8B0D3' }}
                >
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full"
                    style={{ background: '#8B5CF6' }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* RIGHT — text content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-center lg:pl-[60px] lg:text-left"
        >
          {/* VIP badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2"
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              background:
                'linear-gradient(90deg, rgba(139,92,246,0.2), rgba(168,85,247,0.2))',
              border: '1px solid rgba(139,92,246,0.4)',
            }}
          >
            <Crown className="h-3.5 w-3.5" style={{ color: '#FBBF24' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#C084FC',
                letterSpacing: '1.5px',
              }}
            >
              VIP MODULE
            </span>
            <span
              aria-hidden
              className="block"
              style={{
                width: 1,
                height: 12,
                background: 'rgba(139,92,246,0.3)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#A8B0D3',
                letterSpacing: '1px',
              }}
            >
              EXCLUSIVE ON MEDZ
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white"
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            <span>Study </span>
            <span
              style={{
                background:
                  'linear-gradient(135deg, #A855F7, #D8B4FE, #C084FC)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                animation: 'subjects-shimmer 3s linear infinite',
              }}
            >
              Histology
            </span>
            <span> Now</span>
          </motion.h1>

          {/* Instructor */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#A8B0D3',
              margin: '16px 0 12px',
            }}
          >
            Dr. Ahmed Zahra&apos;s Exclusive Histology Module
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto lg:mx-0"
            style={{
              fontSize: 16,
              color: '#6B7280',
              maxWidth: 500,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            High-yield questions, detailed explanations, and visual references —
            all based on Dr. Zahra&apos;s trusted lecture notes.
          </motion.p>

          {/* Stats cards */}
          <div className="mb-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            {STATS.map((s, idx) => (
              <StatsCard key={s.label} value={s.value} label={s.label} index={idx} />
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            type="button"
            onClick={handleStart}
            className="group inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            style={{
              padding: '16px 32px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.3px',
              cursor: 'pointer',
              transition: 'all 300ms ease',
              boxShadow:
                '0 4px 20px rgba(139,92,246,0.4), 0 0 0 0 rgba(139,92,246,0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 20px rgba(139,92,246,0.4), 0 0 0 0 rgba(139,92,246,0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
          >
            Start Learning Histology
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

function StatsCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.08 }}
      className="flex flex-1 flex-col justify-center sm:flex-initial"
      style={{
        width: 130,
        minWidth: 110,
        minHeight: 80,
        padding: 16,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: 16,
        transition: 'all 300ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <p
        className="mb-1 text-white"
        style={{ fontSize: 22, fontWeight: 800 }}
      >
        {value}
      </p>
      <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
        {label}
      </p>
    </motion.div>
  );
}
