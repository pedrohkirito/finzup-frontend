'use client';

import Link from 'next/link';
import { Footprints } from 'lucide-react';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { getBabyStepPageGuidance } from '@/lib/baby-step-page-guidance';
import type { PageKey } from '@/lib/assistant-page-context';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

type BabyStepPageHintProps = {
  pageKey: PageKey;
};

/** Linha de contexto do método no topo de páginas do dashboard. */
export function BabyStepPageHint({ pageKey }: BabyStepPageHintProps) {
  const { data } = useBabySteps();
  if (!BABY_STEPS_ENABLED || !data) return null;

  const guidance = getBabyStepPageGuidance(pageKey, data.currentStep);
  if (!guidance) return null;

  return (
    <div className="flex flex-wrap items-start gap-2 rounded-xl border border-brand-200/70 bg-brand-50/50 px-3 py-2.5 text-sm dark:border-brand-500/20 dark:bg-brand-500/[0.07]">
      <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
      <p className="min-w-0 flex-1 text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-brand-700 dark:text-brand-300">
          Baby Step {data.currentStep}:
        </span>{' '}
        {guidance}{' '}
        <Link href="/dashboard/metodo" className="font-medium text-brand-600 underline dark:text-brand-400">
          Ver método
        </Link>
      </p>
    </div>
  );
}
