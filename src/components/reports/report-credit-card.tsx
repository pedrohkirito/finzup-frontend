'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CreditCard } from 'lucide-react';
import { CHART_COLORS } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

const breakdownLabels: Record<string, string> = {
  expenses: 'Despesas',
  installments: 'Parcelamentos',
  subscriptions: 'Assinaturas',
  financings: 'Financiamentos',
  donations: 'Doações',
};

export function ReportCreditCard({
  creditCardBill,
  className,
}: {
  creditCardBill: MonthReport['creditCardBill'];
  className?: string;
}) {
  const chartData = Object.entries(creditCardBill.breakdown)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount], index) => ({
      key,
      label: breakdownLabels[key] ?? key,
      amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ReportSection className={className} title="Fatura do cartão" description="Lançamentos pendentes no crédito">
      <div className="flex items-center gap-3 rounded-lg bg-violet-50 p-4 dark:bg-violet-950/40">
        <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/60">
          <CreditCard className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total pendente</p>
          <p className="text-2xl font-bold text-violet-600">{formatCurrency(creditCardBill.total)}</p>
        </div>
      </div>

      {creditCardBill.total === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-500">Nenhum lançamento pendente no cartão.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ReportChartTooltip {...props} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.key} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="min-w-0 flex-1 text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="shrink-0 text-sm font-semibold text-violet-600">{formatCurrency(item.amount)}</span>
                <span className="w-10 shrink-0 text-right text-xs text-slate-400">
                  {total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ReportSection>
  );
}
