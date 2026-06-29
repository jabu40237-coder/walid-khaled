'use client';

import { useEffect } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { WhyUsSection } from '@/components/home/WhyUsSection';
import { ProjectPreview } from '@/components/home/ProjectPreview';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CTASection } from '@/components/home/CTASection';
import { TrustSection } from '@/components/home/TrustSection';
import { seedDefaultData } from '@/lib/data';

export default function HomePage() {
  useEffect(() => {
    seedDefaultData();
  }, []);

  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <WhyUsSection />
      <ProjectPreview />
      <ReviewsSection />
      <CTASection />
      <TrustSection />
    </>
  );
}
