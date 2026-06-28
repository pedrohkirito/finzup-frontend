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
    <section id={id} className="scroll-mt-20 bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PlanPicker mode="landing" onSelectPlan={onCta} compactHeader={compact} />
      </div>
    </section>
  );
}
