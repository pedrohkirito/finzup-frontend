'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { ReportIncomeCompositionChart } from './report-income-composition-chart';
import { CHART_COLORS } from './chart-utils';

function ReportPaymentMethodsContent({
  paymentMethods,
  embedded = false,
}: {
  paymentMethods: MonthReport['paymentMethods'];
  embedded?: boolean;
}) {
  const total = paymentMethods.reduce((sum, item) => sum + item.amount, 0);

  const chartItems = useMemo(
    () =>
      paymentMethods.map((item, index) => ({
        label: item.name,
        value: item.amount,
        pct: item.percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [paymentMethods],
  );

  if (paymentMethods.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">Nenhum gasto registrado neste mês.</p>;
  }

  const chart = <ReportIncomeCompositionChart items={chartItems} />;

  if (embedded) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/20">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-violet-600">Forma de pagamento</h4>
          <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
            {formatCurrency(total)}
          </span>
        </div>
        {chart}
      </div>
    );
  }

  return chart;
}

export function ReportPaymentMethods({
  paymentMethods,
  className,
  embedded = false,
}: {
  paymentMethods: MonthReport['paymentMethods'];
  className?: string;
  embedded?: boolean;
}) {
  if (embedded) {
    return <ReportPaymentMethodsContent paymentMethods={paymentMethods} embedded />;
  }

  return (
    <ReportSection
      className={className}
      title="Forma de pagamento"
      description="Quanto foi gasto em cada meio de pagamento"
    >
      <ReportPaymentMethodsContent paymentMethods={paymentMethods} />
    </ReportSection>
  );
}
