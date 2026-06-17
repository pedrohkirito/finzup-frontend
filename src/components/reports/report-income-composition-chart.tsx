'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ReportChartTooltip } from './report-chart-tooltip';

type CompositionItem = {
  label: string;
  pct: number;
  value: number;
  color: string;
};

export function ReportIncomeCompositionChart({ items }: { items: CompositionItem[] }) {
  const chartSlices = items.filter((item) => item.value > 0);
  const colorByLabel = useMemo(
    () => Object.fromEntries(items.map((item) => [item.label, item.color])),
    [items],
  );

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <div className="h-44 w-44 shrink-0 sm:h-48 sm:w-48">
        {chartSlices.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartSlices}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={72}
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartSlices.map((item) => (
                  <Cell key={item.label} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={(props) => <ReportChartTooltip {...props} colorByLabel={colorByLabel} />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Sem dados</div>
        )}
      </div>

      <ul className="w-full min-w-0 space-y-2.5 sm:max-w-xs">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: item.color }}>
                  {item.pct.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500">{formatCurrency(item.value)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
