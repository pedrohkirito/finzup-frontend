'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthReport } from '@/types';
import { ReportSection } from './report-section';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

const SERIES = [
  { key: 'totalIncome' as const, label: 'Receitas', color: CHART_COLORS[0] },
  { key: 'totalExpenses' as const, label: 'Despesas', color: CHART_COLORS[1] },
  { key: 'totalDonations' as const, label: 'Doações', color: CHART_COLORS[3] },
  { key: 'totalInvested' as const, label: 'Investimentos', color: CHART_COLORS[2] },
];

const TREND_COLOR_BY_LABEL = Object.fromEntries(SERIES.map((s) => [s.label, s.color]));
const TREND_SERIES_ORDER = SERIES.map((s) => s.label);

export function ReportMonthlyTrendChart({
  monthlyTrend,
  className,
}: {
  monthlyTrend: MonthReport['monthlyTrend'];
  className?: string;
}) {
  return (
    <ReportSection
      className={className}
      title="Evolução mês a mês"
      description="Receitas, despesas, doações e investimentos nos últimos meses"
    >
      {monthlyTrend.length < 2 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          É necessário ter pelo menos 2 meses com dados para ver a evolução.
        </p>
      ) : (
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 8, bottom: 4 }} barCategoryGap="20%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={(props) => (
                  <ReportChartTooltip
                    {...props}
                    seriesOrder={TREND_SERIES_ORDER}
                    colorByLabel={TREND_COLOR_BY_LABEL}
                  />
                )}
                cursor={CHART_TOOLTIP_STYLE.cursor}
              />
              <Legend
                content={() => (
                  <ul className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-slate-600 dark:text-slate-400">
                    {SERIES.map((s) => (
                      <li key={s.key} className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                        {s.label}
                      </li>
                    ))}
                  </ul>
                )}
              />
              {SERIES.map(({ key, label, color }) => (
                <Bar key={key} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]} maxBarSize={22} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportSection>
  );
}
