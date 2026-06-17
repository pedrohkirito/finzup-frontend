'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

export function ReportParetoChart({
  paretoExpenses,
  className,
}: {
  paretoExpenses: MonthReport['paretoExpenses'];
  className?: string;
}) {
  const data = paretoExpenses.map((item) => ({
    ...item,
    shortName: item.name.length > 14 ? `${item.name.slice(0, 14)}…` : item.name,
  }));

  return (
    <ReportSection
      className={className}
      title="Pareto dos gastos"
      description="Quais despesas concentram o maior volume do mês"
    >
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</p>
      ) : (
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 48 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                yAxisId="amount"
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="pct"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={40}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const name = String(payload[0]?.payload?.name ?? '');
                  const amount = payload.find((p) => p.dataKey === 'amount');
                  const pct = payload.find((p) => p.dataKey === 'cumulativePercentage');
                  return (
                    <ReportChartTooltip
                      active
                      label={name}
                      items={[
                        {
                          label: 'Valor',
                          value: formatCurrency(Number(amount?.value ?? 0)),
                          color: CHART_COLORS[1],
                        },
                        {
                          label: 'Acumulado',
                          value: `${Number(pct?.value ?? 0).toFixed(1)}%`,
                          color: CHART_COLORS[2],
                        },
                      ]}
                    />
                  );
                }}
                cursor={CHART_TOOLTIP_STYLE.cursor}
              />
              <ReferenceLine yAxisId="pct" y={80} stroke="#94a3b8" strokeDasharray="4 4" />
              <Bar yAxisId="amount" dataKey="amount" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="cumulativePercentage"
                stroke={CHART_COLORS[2]}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS[2] }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportSection>
  );
}
