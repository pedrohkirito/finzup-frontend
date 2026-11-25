'use client';

import { formatCurrency, cn } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { useBusinessView } from '@/hooks/use-finance-scope';
import { ReportSection } from './report-section';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function ReportBudgetChart({
  budgetByCategory,
  className,
}: {
  budgetByCategory: MonthReport['budgetByCategory'];
  className?: string;
}) {
  const withData = budgetByCategory.filter((b) => b.spent > 0 || b.limit > 0);
  const business = useBusinessView();

  return (
    <ReportSection
      className={className}
      title={business ? 'Despesas por limite de gasto' : 'Despesas por orçamento'}
      description="Gasto realizado vs limite por categoria"
    >
      {withData.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{business ? 'Nenhum limite de gasto' : 'Nenhum orçamento'} com movimentação neste mês.</p>
      ) : (
        <div className="space-y-4">
          {withData.map((budget) => {
            const progress = Math.min(budget.progress, 100);
            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {budget.name}
                    </span>
                    {budget.overBudget && (
                      <Badge variant="destructive" className="shrink-0 text-[10px]">
                        Estourado
                      </Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    <span className={cn('font-semibold', budget.overBudget ? 'text-red-600' : 'text-slate-700 dark:text-slate-200')}>
                      {formatCurrency(budget.spent)}
                    </span>
                    {' / '}
                    {formatCurrency(budget.limit)}
                  </span>
                </div>
                <Progress
                  value={progress}
                  className={cn(budget.overBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500')}
                />
                <p className="text-right text-xs text-slate-400">{progress.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      )}
    </ReportSection>
  );
}
