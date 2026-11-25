'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMonthStore } from '@/hooks/use-month';
import { PlanSelector } from '@/components/planejamento/plan-selector';
import { PlanEditor } from '@/components/planejamento/plan-editor';
import { PlanDonutChart, type DonutSegment } from '@/components/planejamento/plan-donut-chart';
import { PlanComparison } from '@/components/planejamento/plan-comparison';
import {
  DONATION_CHART_COLOR,
  EXPENSE_TYPE_CONFIG,
  EXPENSE_TYPE_ORDER,
  INVESTMENT_CHART_COLOR,
} from '@/components/planejamento/plan-expense-config';
import { CalendarRange } from 'lucide-react';
import { NewFeatureBadge } from '@/components/ui/new-feature-badge';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import {
  clearPendingPlanningPlanId,
  getPendingPlanningPlanId,
  subscribePendingPlanningPlan,
} from '@/lib/planning-page-bridge';
import type {
  FinancialPlan,
  PlanDonationItem,
  PlanExpenseItem,
  PlanIncomeItem,
  PlanInvestmentItem,
  PlanSummary,
} from '@/types';

function buildSegments(
  expenses: PlanExpenseItem[] | undefined,
  donations: PlanDonationItem[] | undefined,
  investments: PlanInvestmentItem[] | undefined,
): DonutSegment[] {
  const totalDonations = donations?.reduce((s, d) => s + Number(d.amount), 0) ?? 0;
  const totalInvestments = investments?.reduce((s, i) => s + Number(i.amount), 0) ?? 0;

  const expenseSegments = EXPENSE_TYPE_ORDER.map((type) => {
    const total = expenses?.filter((e) => e.type === type).reduce((s, e) => s + Number(e.amount), 0) ?? 0;
    return {
      id: `__expense_${type}__`,
      name: EXPENSE_TYPE_CONFIG[type].label,
      value: total,
      color: EXPENSE_TYPE_CONFIG[type].chartColor,
    };
  }).filter((s) => s.value > 0);

  return [
    ...expenseSegments,
    ...(totalDonations > 0
      ? [{ id: '__donations__', name: 'Doações', value: totalDonations, color: DONATION_CHART_COLOR }]
      : []),
    ...(totalInvestments > 0
      ? [{ id: '__investments__', name: 'Investimentos', value: totalInvestments, color: INVESTMENT_CHART_COLOR }]
      : []),
  ];
}

export default function PlanejamentoPage() {
  const { selectedMonthId } = useMonthStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const pendingPlanId = useSyncExternalStore(subscribePendingPlanningPlan, getPendingPlanningPlanId, () => null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<FinancialPlan[]>('/plans'),
  });

  useEffect(() => {
    if (!plans?.length) {
      setSelectedPlanId(null);
      return;
    }
    if (pendingPlanId && plans.some((plan) => plan.id === pendingPlanId)) {
      setSelectedPlanId(pendingPlanId);
      clearPendingPlanningPlanId();
      return;
    }
    if (pendingPlanId && selectedPlanId && plans.some((plan) => plan.id === selectedPlanId)) return;
    if (!selectedPlanId || !plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId, pendingPlanId]);

  const enabled = !!selectedPlanId;

  const { data: summary } = useQuery({
    queryKey: ['plans', selectedPlanId, 'summary'],
    queryFn: () => api.get<PlanSummary>(`/plans/${selectedPlanId}/summary`),
    enabled,
  });

  const { data: incomes } = useQuery({
    queryKey: ['plans', selectedPlanId, 'incomes'],
    queryFn: () => api.get<PlanIncomeItem[]>(`/plans/${selectedPlanId}/incomes`),
    enabled,
  });

  const { data: expenses } = useQuery({
    queryKey: ['plans', selectedPlanId, 'expenses'],
    queryFn: () => api.get<PlanExpenseItem[]>(`/plans/${selectedPlanId}/expenses`),
    enabled,
  });

  const { data: donations } = useQuery({
    queryKey: ['plans', selectedPlanId, 'donations'],
    queryFn: () => api.get<PlanDonationItem[]>(`/plans/${selectedPlanId}/donations`),
    enabled,
  });

  const { data: investments } = useQuery({
    queryKey: ['plans', selectedPlanId, 'investments'],
    queryFn: () => api.get<PlanInvestmentItem[]>(`/plans/${selectedPlanId}/investments`),
    enabled,
  });

  const totalIncome = summary?.totalIncome ?? incomes?.reduce((s, i) => s + Number(i.amount), 0) ?? 0;
  const donutSegments = buildSegments(expenses, donations, investments);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Planejamento</h1>
          <NewFeatureBadge />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simule como distribuir sua renda antes de aplicar no mês</p>
      </div>

      <BabyStepPageHint pageKey="planejamento" />

      <PlanSelector
        plans={plans ?? []}
        selectedPlanId={selectedPlanId}
        onSelect={setSelectedPlanId}
        monthId={selectedMonthId}
      />

      {!selectedPlanId ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-white/[0.08]">
          <span className="icon-chip h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <CalendarRange className="h-7 w-7" />
          </span>
          <div>
            <p className="font-medium text-slate-600 dark:text-slate-300">Nenhum cenário criado</p>
            <p className="mt-0.5 text-sm text-slate-400">
              Clique em <strong>Novo</strong> para criar o primeiro
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_580px] xl:grid-cols-[1fr_680px]">
          <div className="order-2 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:order-1 dark:border-white/[0.1] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(2,6,23,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] dark:backdrop-blur-xl">
            <PlanEditor
              planId={selectedPlanId}
              summary={summary}
              incomes={incomes}
              expenses={expenses}
              donations={donations}
              investments={investments}
            />
          </div>

          <div className="order-1 lg:sticky lg:top-4 lg:order-2 lg:self-start">
            <PlanDonutChart totalIncome={totalIncome} segments={donutSegments} />
          </div>
        </div>
      )}

      {plans && plans.length >= 2 && <PlanComparison plans={plans} />}
    </div>
  );
}
