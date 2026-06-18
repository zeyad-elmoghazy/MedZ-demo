'use client';

import { FeaturesStrip } from '@/components/subjects/FeaturesStrip';
import { HeroSection } from '@/components/subjects/HeroSection';
import { SubjectsCarousel } from '@/components/subjects/SubjectsCarousel';
import { SubjectsNavbar } from '@/components/subjects/SubjectsNavbar';

/**
 * Subjects landing page — full-bleed, dark futuristic look. The
 * page owns its own navbar (SubjectsNavbar) instead of inheriting
 * any sidebar; there's no shared (student) layout to hide.
 */
export default function SubjectsPage() {
  return (
    <main className="min-h-screen" style={{ background: '#030617' }}>
      <SubjectsNavbar />
      {/* Space below fixed 72px navbar */}
      <div style={{ height: 72 }} aria-hidden />
      <HeroSection />
      <SubjectsCarousel />
      <FeaturesStrip />
    </main>
  );
}
