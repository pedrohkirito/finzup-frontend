'use client';

import { useMonthStore } from '@/hooks/use-month';
import { useMonthSummary } from '@/hooks/use-month-summary';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CloseMonthBanner } from '@/components/dashboard/close-month-banner';
import { OnboardingTour } from '@/components/onboarding/tour';

export default function DashboardPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: summary, isLoading } = useMonthSummary(selectedMonthId);

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Resumo do mês</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral das suas finanças</p>
      </div>
      <OnboardingTour />
      <CloseMonthBanner month={summary.month} />
      <SummaryCards summary={summary} />
    </div>
  );
}
