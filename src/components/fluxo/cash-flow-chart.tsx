'use client';

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { BRAND_GREEN, CHART_AXIS_TICK_FILL } from '@/components/reports/chart-utils';
import { ReportChartTooltip } from '@/components/reports/report-chart-tooltip';
import type { CashFlow } from '@/types';

function compactCurrency(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) return `${value < 0 ? '-' : ''}${(abs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

/** Linha do saldo previsto no fim de cada dia, com o início do mês (lançamentos sem data) como ponto zero. */
export function CashFlowChart({ flow, today }: { flow: CashFlow; today: number | null }) {
  const data = [
    { label: 'Início', day: 0, balance: flow.openingBalance + flow.undated.net },
    ...flow.days.map((d) => ({ label: String(d.day), day: d.day, balance: d.balance })),
  ];
  const hasNegative = data.some((d) => d.balance < 0);

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_AXIS_TICK_FILL, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tickFormatter={compactCurrency}
            tick={{ fill: CHART_AXIS_TICK_FILL, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            content={(props) => (
              <ReportChartTooltip
                {...props}
                label={props.label === 'Início' ? 'Início do mês' : `Dia ${props.label}`}
                valueFormatter={(v) => formatCurrency(v)}
              />
            )}
          />
          {hasNegative && <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />}
          {today && <ReferenceLine x={String(today)} stroke="#94a3b8" strokeDasharray="2 4" label={{ value: 'Hoje', fill: CHART_AXIS_TICK_FILL, fontSize: 11, position: 'insideTopRight' }} />}
          <Area
            type="stepAfter"
            dataKey="balance"
            name="Saldo"
            stroke={BRAND_GREEN}
            strokeWidth={2}
            fill="url(#cashFlowFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
