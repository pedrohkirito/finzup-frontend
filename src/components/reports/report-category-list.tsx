'use client';

import { formatCurrency } from '@/lib/utils';

export function ReportCategoryList({
  items,
  total,
  valueColor = 'text-slate-700 dark:text-slate-200',
}: {
  items: { label: string; amount: number; percentage?: number }[];
  total: number;
  valueColor?: string;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-500">Nenhum dado para exibir.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.label}</p>
            {item.percentage !== undefined && (
              <p className="text-xs text-slate-400">{item.percentage.toFixed(1)}% do total</p>
            )}
          </div>
          <span className={`shrink-0 text-sm font-semibold ${valueColor}`}>{formatCurrency(item.amount)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="font-medium text-slate-500">Total</span>
        <span className={`text-lg font-bold ${valueColor}`}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
