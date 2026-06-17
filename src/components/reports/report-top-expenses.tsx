'use client';

import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { EXPENSE_CATEGORY_LABELS } from './chart-utils';
import { Badge } from '@/components/ui/badge';

export function ReportTopExpenses({
  topExpenses,
  className,
}: {
  topExpenses: MonthReport['topExpenses'];
  className?: string;
}) {
  return (
    <ReportSection className={className} title="Maiores gastos" description="Top 5 despesas do mês por valor">
      {topExpenses.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</p>
      ) : (
        <ol className="space-y-2">
          {topExpenses.map((expense, index) => (
            <li
              key={expense.id}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{expense.name}</p>
                {expense.category && (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
                  </Badge>
                )}
              </div>
              <span className="shrink-0 text-sm font-semibold text-orange-600">{formatCurrency(expense.amount)}</span>
            </li>
          ))}
        </ol>
      )}
    </ReportSection>
  );
}
