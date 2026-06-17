'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import type { MonthReport, MonthSummary } from '@/types';
import { TrendingUp, TrendingDown, Heart, PiggyBank, CreditCard, type LucideIcon } from 'lucide-react';
import { ReportIncomeCompositionChart } from './report-income-composition-chart';

type Props = {
  overview: MonthReport['overview'];
  investment: MonthReport['investment'];
  creditCardBill: MonthSummary['creditCardBill'];
};

type SummaryItem = {
  title: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  fillColor: string;
  bg: string;
};

export function ReportOverview({ overview, investment, creditCardBill }: Props) {
  const { totalIncome, totalExpenses, totalDonations } = overview;
  const hasIncome = totalIncome > 0;

  const summaryItems: SummaryItem[] = [
    {
      title: 'Receitas',
      value: totalIncome,
      icon: TrendingUp,
      accent: 'text-emerald-600',
      fillColor: '#059669',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      accent: 'text-orange-600',
      fillColor: '#ea580c',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
    },
    {
      title: 'Doações',
      value: totalDonations,
      icon: Heart,
      accent: 'text-sky-600',
      fillColor: '#0284c7',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
    },
    {
      title: 'Fatura',
      value: creditCardBill.total,
      icon: CreditCard,
      accent: 'text-violet-600',
      fillColor: '#7c3aed',
      bg: 'bg-violet-50 dark:bg-violet-950/60',
    },
    {
      title: 'Investimentos',
      value: investment.totalInvested,
      icon: PiggyBank,
      accent: 'text-emerald-600',
      fillColor: '#059669',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  const distributionItems = summaryItems
    .filter((item) => item.title !== 'Receitas')
    .map((item) => ({
      label: item.title,
      value: item.value,
      pct: hasIncome ? (item.value / totalIncome) * 100 : 0,
      color: item.accent,
      fillColor: item.fillColor,
    }));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryItems.map(({ title, value, icon: Icon, accent, bg }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
              <div className={cn('rounded-lg p-2', bg)}>
                <Icon className={cn('h-4 w-4', accent)} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={cn('text-2xl font-bold tracking-tight', accent)}>{formatCurrency(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasIncome && (
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Distribuição da receita
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {distributionItems.map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className={cn('mt-1 text-2xl font-bold tabular-nums leading-none', item.color)}>
                      {item.pct.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
              <ReportIncomeCompositionChart
                items={distributionItems.map((item) => ({
                  label: item.label,
                  pct: item.pct,
                  value: item.value,
                  color: item.fillColor,
                }))}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
