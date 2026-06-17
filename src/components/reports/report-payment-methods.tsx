'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CHART_COLORS, PAYMENT_METHOD_LABELS } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

export function ReportPaymentMethods({
  paymentMethods,
  className,
}: {
  paymentMethods: MonthReport['paymentMethods'];
  className?: string;
}) {
  const total = paymentMethods.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ReportSection
      className={className}
      title="Forma de pagamento"
      description="Quanto foi gasto em cada meio de pagamento"
    >
      {paymentMethods.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhum gasto registrado neste mês.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ReportChartTooltip {...props} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {paymentMethods.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-400">
                  {item.name}
                  <span className="ml-1 text-xs text-slate-400">
                    ({PAYMENT_METHOD_LABELS[item.type] ?? item.type})
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatCurrency(item.amount)}
                </span>
                <span className="w-10 shrink-0 text-right text-xs text-slate-400">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="text-sm font-bold text-violet-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </ReportSection>
  );
}
