'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportChartTooltip } from '@/components/reports/report-chart-tooltip';
import { CHART_TOOLTIP_STYLE } from '@/components/reports/chart-utils';
import {
  buildChartSeries,
  formatChartMonthLabel,
} from '@/lib/investment-simulation-engine';
import { formatCurrency } from '@/lib/utils';
import type { SimulationMonthProjection } from '@/types';

export function SimulationProjectionChart({
  monthly,
  monthsToGoal,
  goalReachedLabel,
}: {
  monthly: SimulationMonthProjection[];
  monthsToGoal: number | null;
  goalReachedLabel: string | null;
}) {
  const data = useMemo(() => buildChartSeries(monthly, monthsToGoal), [monthly, monthsToGoal]);
  const goalPoint = data.find((point) => point.isGoal);

  const xTicks = useMemo(
    () => data.map((point) => point.label),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Projeção em 30 anos</CardTitle>
        {goalPoint && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Meta atingida em {goalReachedLabel ?? formatChartMonthLabel(goalPoint.month)} —{' '}
            {formatCurrency(goalPoint.balance)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0292b8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0292b8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis
                dataKey="label"
                ticks={xTicks}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={88}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as {
                    balance: number;
                    monthlyInterest: number;
                  };
                  return (
                    <ReportChartTooltip
                      active={active}
                      label={label}
                      items={[
                        {
                          label: 'Patrimônio',
                          value: formatCurrency(point.balance),
                          color: '#38c4eb',
                        },
                        {
                          label: 'Rentabilidade mensal',
                          value: formatCurrency(point.monthlyInterest),
                          color: '#a78bfa',
                        },
                      ]}
                    />
                  );
                }}
                cursor={CHART_TOOLTIP_STYLE.cursor}
              />
              {goalPoint && (
                <>
                  <ReferenceLine
                    x={goalPoint.label}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Meta atingida',
                      position: 'insideTopLeft',
                      fill: '#10b981',
                      fontSize: 11,
                    }}
                  />
                  <ReferenceDot
                    x={goalPoint.label}
                    y={goalPoint.balance}
                    r={6}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="balance"
                name="Patrimônio"
                stroke="#0292b8"
                fill="url(#balanceGradient)"
                strokeWidth={2}
                dot={goalPoint ? { r: 0 } : false}
                activeDot={{ r: 4, fill: '#0292b8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
