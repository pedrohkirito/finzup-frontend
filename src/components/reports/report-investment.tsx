'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { ReportIncomeCompositionChart } from './report-income-composition-chart';
import { CHART_COLORS } from './chart-utils';

export function ReportInvestment({
  investment,
  items,
  className,
}: {
  investment: MonthReport['investment'];
  items: MonthReport['items']['investments'];
  className?: string;
}) {
  const { totalInvested, targetAmount, progress } = investment;
  const progressPct = Math.min(progress, 100);

  const chartItems = useMemo(
    () =>
      items.map((item, index) => ({
        label: item.name,
        value: item.amount,
        pct: totalInvested > 0 ? (item.amount / totalInvested) * 100 : 0,
        color: CHART_COLORS[(index + 1) % CHART_COLORS.length],
      })),
    [items, totalInvested],
  );

  const description =
    targetAmount > 0
      ? `Meta de ${formatCurrency(targetAmount)} · ${progressPct.toFixed(0)}% atingida`
      : 'Aportes realizados neste mês';

  return (
    <ReportSection className={className} title="Investimentos" description={description}>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhum investimento registrado neste mês.</p>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/20">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-semibold text-emerald-600">Aportes do mês</h4>
            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
              {formatCurrency(totalInvested)}
            </span>
          </div>
          <ReportIncomeCompositionChart items={chartItems} />
        </div>
      )}
    </ReportSection>
  );
}
