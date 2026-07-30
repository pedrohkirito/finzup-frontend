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
import {
  BRAND_CYAN,
  BRAND_GREEN,
  CHART_AXIS_TICK_FILL,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from './chart-utils';
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
              <defs>
                <linearGradient id="ieGradReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_CYAN} />
                  <stop offset="100%" stopColor={BRAND_GREEN} />
                </linearGradient>
                <linearGradient id="ieGradDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="ieGradDoacoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="ieGradInvestimentos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 12, fill: CHART_AXIS_TICK_FILL, textAnchor: 'middle' }}
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
                fill="url(#ieGradReceitas)"
                radius={[8, 8, 4, 4]}
              />
              <Bar
                dataKey="despesas"
                name="Despesas"
                stackId="total"
                fill="url(#ieGradDespesas)"
              />
              <Bar
                dataKey="doacoes"
                name="Doações"
                stackId="total"
                fill="url(#ieGradDoacoes)"
              />
              <Bar
                dataKey="investimentos"
                name="Investimentos"
                stackId="total"
                fill="url(#ieGradInvestimentos)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-300">
          {SERIES.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-white/[0.06]"
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </ReportSection>
  );
}
