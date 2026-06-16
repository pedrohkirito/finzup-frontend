'use client';

import { PlanPicker } from '@/components/billing/plan-picker';

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PlanPicker mode="landing" />
      </div>
    </section>
  );
}
