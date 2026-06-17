'use client';

import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { Progress } from '@/components/ui/progress';
import { PiggyBank } from 'lucide-react';

export function ReportInvestment({
  investment,
  items,
  className,
}: {
  investment: MonthReport['investment'];
  items: MonthReport['items']['investments'];
  className?: string;
}) {
  const progress = Math.min(investment.progress, 100);

  return (
    <ReportSection className={className} title="Investimentos" description="Aportes do mês em relação à meta">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/60">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(investment.totalInvested)}</p>
                <p className="text-xs text-slate-500">investidos este mês</p>
              </div>
              <p className="text-sm text-slate-500">
                Meta: <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(investment.targetAmount)}</span>
              </p>
            </div>
            <Progress value={progress} className="mt-3" />
            <p className="mt-1 text-xs text-slate-400">{progress.toFixed(0)}% da meta atingida</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <span className="truncate text-sm font-medium">{item.name}</span>
                <span className="shrink-0 text-sm font-semibold text-emerald-600">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReportSection>
  );
}
