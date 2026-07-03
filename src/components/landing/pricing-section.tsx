'use client';

import { PlanPicker } from '@/components/billing/plan-picker';
import { type BillingPlanId } from '@/constants/billing-plans';

interface PricingSectionProps {
  id?: string;
  onCta?: (planId: BillingPlanId) => void;
  compact?: boolean;
}

export function PricingSection({ id = 'pricing-section', onCta, compact = false }: PricingSectionProps) {
  return (
    <section
      id={id}
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
