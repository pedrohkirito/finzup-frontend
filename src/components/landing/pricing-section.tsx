'use client';

import { useEffect, useRef } from 'react';
import { PlanPicker } from '@/components/billing/plan-picker';
import { type BillingPlanId } from '@/constants/billing-plans';
import { type LandingCtaClick } from '@/lib/funnel-analytics';

interface PricingSectionProps {
  id?: string;
  onCta?: (planId: BillingPlanId, cta?: LandingCtaClick) => void;
  onViewed?: () => void;
  compact?: boolean;
}

export function PricingSection({
  id = 'pricing-section',
  onCta,
  onViewed,
  compact = false,
}: PricingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !onViewed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        onViewed();
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [onViewed]);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-landing-section="pricing"
      className={`relative overflow-hidden py-16 sm:py-24 ${
        compact ? 'bg-slate-50 dark:bg-slate-900' : ''
      }`}
    >
      {!compact && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
          <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PlanPicker mode="landing" onSelectPlan={onCta} compactHeader={compact} />
      </div>
    </section>
  );
}
