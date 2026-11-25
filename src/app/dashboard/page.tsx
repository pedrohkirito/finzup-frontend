'use client';

import { ExportButton } from '@/components/export/export-button';
import { useMonthStore } from '@/hooks/use-month';
import { useMonthSummary } from '@/hooks/use-month-summary';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CloseMonthBanner } from '@/components/dashboard/close-month-banner';
import { OnboardingTour } from '@/components/onboarding/tour';
import { BabyStepCompass } from '@/components/baby-steps/baby-step-compass';
import { AiSuggestionsPanel } from '@/components/assistant/ai-suggestions-panel';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';
import { ScopeBreakdownCard } from '@/components/dashboard/scope-breakdown-card';
import { useBusinessEnabled, useScopeFilter, useScopeLabel } from '@/hooks/use-finance-scope';

export default function DashboardPage() {
  const { selectedMonthId } = useMonthStore();
  const [scope] = useScopeFilter();
  const scopeLabel = useScopeLabel();
  const businessEnabled = useBusinessEnabled();
  const { data: summary, isLoading } = useMonthSummary(selectedMonthId, scope);

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-7 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Resumo do mês</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {scopeLabel ? `Visão geral das suas finanças · ${scopeLabel}` : 'Visão geral das suas finanças'}
          </p>
        </div>
        <ExportButton />
      </div>
      <OnboardingTour />
      {BABY_STEPS_ENABLED && <BabyStepCompass />}
      <AiSuggestionsPanel />
      <CloseMonthBanner month={summary.month} />
      {businessEnabled && scope === 'all' && summary.scopeBreakdown && (
        <ScopeBreakdownCard breakdown={summary.scopeBreakdown} spaces={summary.spaceBreakdown} />
      )}
      <SummaryCards summary={summary} />
    </div>
  );
}
