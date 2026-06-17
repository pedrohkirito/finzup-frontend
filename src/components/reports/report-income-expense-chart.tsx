'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ReportSection } from './report-section';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-utils';
import { ReportChartTooltip } from './report-chart-tooltip';

const BAR_COLORS = [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[3]];

const INCOME_EXPENSE_COLORS: Record<string, string> = {
  Receitas: BAR_COLORS[0],
  Despesas: BAR_COLORS[1],
  Doações: BAR_COLORS[2],
};

export function ReportIncomeExpenseChart({
  totalIncome,
  totalExpenses,
  totalDonations,
  className,
}: {
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  className?: string;
}) {
  const data = [
    { name: 'Receitas', value: totalIncome },
    { name: 'Despesas', value: totalExpenses },
    { name: 'Doações', value: totalDonations },
  ];

  return (
    <ReportSection
      className={className}
      title="Receitas vs Despesas"
      description="Comparativo de entradas e saídas do mês"
    >
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 28, right: 8, left: 8, bottom: 4 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const category = String(label ?? '');
                return (
                  <ReportChartTooltip
                    active
                    label={category}
                    items={[
                      {
                        label: category,
                        value: formatCurrency(Number(payload[0]?.value ?? 0)),
                        color: INCOME_EXPENSE_COLORS[category] ?? '#ffffff',
                      },
                    ]}
                  />
                );
              }}
              cursor={CHART_TOOLTIP_STYLE.cursor}
            />
            <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={72}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v: unknown) => formatCurrency(Number(v))}
                style={{ fontSize: 13, fill: '#334155', fontWeight: 700 }}
              />
              {data.map((_, index) => (
                <Cell key={index} fill={BAR_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportSection>
  );
}
