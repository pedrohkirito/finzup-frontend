'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

export function ReportIncomeByItemChart({
  incomes,
  className,
}: {
  incomes: MonthReport['items']['incomes'];
  className?: string;
}) {
  const data = [...incomes]
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      shortName: item.name.length > 20 ? `${item.name.slice(0, 20)}…` : item.name,
    }));

  return (
    <ReportSection
      className={className}
      title="Receitas por item"
      description="De onde veio o dinheiro do mês"
    >
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhuma receita registrada neste mês.</p>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="shortName"
                width={100}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const name = String(payload[0]?.payload?.name ?? '');
                  return (
                    <ReportChartTooltip
                      active
                      label={name}
                      items={[
                        {
                          label: name,
                          value: formatCurrency(Number(payload[0]?.value ?? 0)),
                          color: CHART_COLORS[0],
                        },
                      ]}
                    />
                  );
                }}
                cursor={CHART_TOOLTIP_STYLE.cursor}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportSection>
  );
}
