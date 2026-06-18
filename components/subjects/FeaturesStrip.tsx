'use client';

import { motion } from 'framer-motion';
import { Brain, GraduationCap, Image as ImageIcon, Trophy } from 'lucide-react';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: <GraduationCap className="h-6 w-6" style={{ color: '#A855F7' }} />,
    title: 'Doctor-Curated Content',
    description: 'Trusted by top medical educators',
  },
  {
    icon: <Brain className="h-6 w-6" style={{ color: '#A855F7' }} />,
    title: 'AI-Powered Explanations',
    description: 'Understand every concept deeply',
  },
  {
    icon: <ImageIcon className="h-6 w-6" style={{ color: '#A855F7' }} />,
    title: 'Visual References',
    description: 'See it. Understand it. Remember it.',
  },
  {
    icon: <Trophy className="h-6 w-6" style={{ color: '#A855F7' }} />,
    title: 'Track & Improve',
    description: 'Monitor your progress and rank up',
  },
];

export function FeaturesStrip() {
  return (
    <section
      style={{
        padding: '60px 0',
        background: '#030617',
        borderTop: '1px solid rgba(139,92,246,0.1)',
      }}
    >
      <div
        className="mx-auto grid max-w-7xl gap-8 px-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {FEATURES.map((feature, idx) => (
          <FeatureItem key={feature.title} feature={feature} index={idx} />
        ))}
      </div>
    </section>
  );
}

function FeatureItem({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center text-center"
      style={{
        padding: '32px 20px',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 300ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(139,92,246,0.05)';
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        const iconWrap = e.currentTarget.querySelector(
          '[data-icon-wrap]'
        ) as HTMLElement | null;
        if (iconWrap) {
          iconWrap.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
        const iconWrap = e.currentTarget.querySelector(
          '[data-icon-wrap]'
        ) as HTMLElement | null;
        if (iconWrap) {
          iconWrap.style.boxShadow = 'none';
        }
      }}
    >
      <span
        data-icon-wrap
        className="mb-5 grid h-14 w-14 place-items-center rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))',
          border: '1px solid rgba(139,92,246,0.2)',
          transition: 'box-shadow 300ms ease',
        }}
      >
        {feature.icon}
      </span>

      <h3
        className="mb-2 text-white"
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '-0.3px',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: '#6B7280',
          lineHeight: 1.6,
          maxWidth: 200,
        }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}
