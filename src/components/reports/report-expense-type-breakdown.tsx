'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport, SummaryItem } from '@/types';
import { ReportIncomeCompositionChart } from './report-income-composition-chart';
import { CHART_COLORS, EXPENSE_BREAKDOWN_TYPES, EXPENSE_CATEGORY_LABELS } from './chart-utils';

type ExpenseByType = MonthReport['expenseByType'];

function groupExpensesByType(expenses: SummaryItem[]) {
  const groups = new Map<string, SummaryItem[]>();

  for (const expense of expenses) {
    const category = expense.category ?? 'outros';
    const group = groups.get(category) ?? [];
    group.push(expense);
    groups.set(category, group);
  }

  const orderedKeys = EXPENSE_BREAKDOWN_TYPES.filter((key) => groups.has(key));

  return orderedKeys.map((key) => {
    const items = [...(groups.get(key) ?? [])].sort((a, b) => b.amount - a.amount);
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return { key, label: EXPENSE_CATEGORY_LABELS[key] ?? key, items, total };
  });
}

export function ReportExpenseTypeBreakdown({
  expenses,
  expenseByType,
}: {
  expenses: SummaryItem[];
  expenseByType: ExpenseByType;
}) {
  const colorByType = useMemo(
    () =>
      Object.fromEntries(
        expenseByType.map((item, index) => [item.key, CHART_COLORS[index % CHART_COLORS.length]]),
      ),
    [expenseByType],
  );

  const groups = useMemo(() => groupExpensesByType(expenses), [expenses]);

  if (groups.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-100 pt-6 dark:border-white/[0.06]">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Detalhamento por tipo
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const chartItems = group.items.map((item, index) => ({
            label: item.name,
            value: item.amount,
            pct: group.total > 0 ? (item.amount / group.total) * 100 : 0,
            color: CHART_COLORS[(index + 1) % CHART_COLORS.length],
          }));

          return (
            <div
              key={group.key}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: colorByType[group.key] ?? '#ea580c' }}
                >
                  {group.label}
                </h4>
                <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
                  {formatCurrency(group.total)}
                </span>
              </div>
              <ReportIncomeCompositionChart items={chartItems} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
