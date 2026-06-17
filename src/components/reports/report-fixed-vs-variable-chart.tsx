'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CHART_COLORS } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

const SLICES = [
  { key: 'fixed' as const, label: 'Fixo', color: CHART_COLORS[1] },
  { key: 'variable' as const, label: 'Variável', color: CHART_COLORS[0] },
];

const FIXED_VS_VARIABLE_COLORS = Object.fromEntries(SLICES.map((s) => [s.label, s.color]));

export function ReportFixedVsVariableChart({
  fixedVsVariable,
  className,
}: {
  fixedVsVariable: MonthReport['fixedVsVariable'];
  className?: string;
}) {
  const data = SLICES.map(({ key, label }) => ({
    key,
    label,
    amount: fixedVsVariable[key].amount,
    percentage: fixedVsVariable[key].percentage,
  })).filter((item) => item.amount > 0);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ReportSection
      className={className}
      title="Fixo vs variável"
      description="Obrigações fixas comparadas a gastos avulsos"
    >
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((item) => (
                    <Cell key={item.key} fill={SLICES.find((s) => s.key === item.key)!.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <ReportChartTooltip {...props} colorByLabel={FIXED_VS_VARIABLE_COLORS} />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.key} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: SLICES.find((s) => s.key === item.key)!.color }}
                />
                <span className="min-w-0 flex-1 text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatCurrency(item.amount)}
                </span>
                <span className="w-10 shrink-0 text-right text-xs text-slate-400">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ReportSection>
  );
}
