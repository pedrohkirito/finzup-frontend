'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ReportSection } from './report-section';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

const SERIES = [
  { key: 'receitas' as const, label: 'Entradas', color: CHART_COLORS[0] },
  { key: 'despesas' as const, label: 'Despesas', color: CHART_COLORS[1] },
  { key: 'doacoes' as const, label: 'Doações', color: CHART_COLORS[3] },
  { key: 'investimentos' as const, label: 'Investimentos', color: CHART_COLORS[2] },
];

const COLOR_BY_LABEL = Object.fromEntries(SERIES.map((item) => [item.label, item.color]));
const SERIES_ORDER = SERIES.map((item) => item.label);

export function ReportIncomeExpenseChart({
  totalIncome,
  totalExpenses,
  totalDonations,
  totalInvested,
  className,
}: {
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  totalInvested: number;
  className?: string;
}) {
  const data = [
    {
      name: 'Entradas',
      receitas: totalIncome,
      despesas: 0,
      doacoes: 0,
      investimentos: 0,
    },
    {
      name: 'Saídas',
      receitas: 0,
      despesas: totalExpenses,
      doacoes: totalDonations,
      investimentos: totalInvested,
    },
  ];

  return (
    <ReportSection
      className={className}
      title="Entradas vs Saídas"
      description="Comparativo de entradas e saídas do mês"
    >
      <div className="space-y-2">
        <div className="mx-auto h-52 w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
              barCategoryGap={16}
              barSize={64}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 12, fill: '#64748b', textAnchor: 'middle' }}
              />
              <YAxis hide />
              <Tooltip
                content={(props) => (
                  <ReportChartTooltip
                    {...props}
                    payload={props.payload?.filter((entry) => Number(entry.value) > 0)}
                    seriesOrder={SERIES_ORDER}
                    colorByLabel={COLOR_BY_LABEL}
                  />
                )}
                cursor={CHART_TOOLTIP_STYLE.cursor}
              />
              <Bar
                dataKey="receitas"
                name="Entradas"
                stackId="total"
                fill={SERIES[0].color}
                radius={[8, 8, 4, 4]}
              />
              <Bar
                dataKey="despesas"
                name="Despesas"
                stackId="total"
                fill={SERIES[1].color}
              />
              <Bar
                dataKey="doacoes"
                name="Doações"
                stackId="total"
                fill={SERIES[2].color}
              />
              <Bar
                dataKey="investimentos"
                name="Investimentos"
                stackId="total"
                fill={SERIES[3].color}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {SERIES.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </ReportSection>
  );
}
