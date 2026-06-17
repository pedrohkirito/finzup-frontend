'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import type { MonthReport, MonthSummary } from '@/types';
import { TrendingUp, TrendingDown, Heart, PiggyBank, CreditCard, type LucideIcon } from 'lucide-react';
import { ReportIncomeCompositionChart } from './report-income-composition-chart';
import { ReportExpenseTypeBreakdown } from './report-expense-type-breakdown';
import { ReportPaymentMethods } from './report-payment-methods';
import { ReportTopExpenses } from './report-top-expenses';
import { CHART_COLORS } from './chart-utils';

type Props = {
  overview: MonthReport['overview'];
  investment: MonthReport['investment'];
  creditCardBill: MonthSummary['creditCardBill'];
  expenseByType: MonthReport['expenseByType'];
  expenses: MonthReport['items']['expenses'];
  paymentMethods: MonthReport['paymentMethods'];
  children?: React.ReactNode;
};

type OverviewCardItem = {
  title: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  bg: string;
};

export function ReportOverview({
  overview,
  investment,
  creditCardBill,
  expenseByType,
  expenses,
  paymentMethods,
  children,
}: Props) {
  const { totalIncome, totalExpenses, totalDonations } = overview;
  const hasIncome = totalIncome > 0;
  const hasExpenses = totalExpenses > 0;

  const summaryItems: OverviewCardItem[] = [
    {
      title: 'Receitas',
      value: totalIncome,
      icon: TrendingUp,
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      accent: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
    },
    {
      title: 'Doações',
      value: totalDonations,
      icon: Heart,
      accent: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
    },
    {
      title: 'Fatura',
      value: creditCardBill.total,
      icon: CreditCard,
      accent: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/60',
    },
    {
      title: 'Investimentos',
      value: investment.totalInvested,
      icon: PiggyBank,
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  const expenseDistributionItems = expenseByType.map((item, index) => ({
    label: item.label,
    value: item.amount,
    pct: item.percentage,
    fillColor: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const fixedExpenses = expenseByType.find((item) => item.key === 'fixa')?.amount ?? 0;
  const financingExpenses = expenseByType.find((item) => item.key === 'financiamento')?.amount ?? 0;
  const otherExpenses = expenseByType
    .filter((item) => item.key !== 'fixa' && item.key !== 'financiamento')
    .reduce((sum, item) => sum + item.amount, 0);
  const investedAmount = investment.totalInvested;
  const remainingBalance =
    totalIncome - fixedExpenses - financingExpenses - otherExpenses - totalDonations - investedAmount;

  const incomeAllocationItems = [
    {
      label: 'Despesas fixas',
      value: fixedExpenses,
      fillColor: '#ea580c',
    },
    {
      label: 'Financiamentos',
      value: financingExpenses,
      fillColor: '#7c3aed',
    },
    {
      label: 'Outras despesas',
      value: otherExpenses,
      fillColor: '#f97316',
    },
    {
      label: 'Doações',
      value: totalDonations,
      fillColor: '#0284c7',
    },
    {
      label: 'Investimentos',
      value: investedAmount,
      fillColor: '#059669',
    },
    {
      label: 'Saldo',
      value: remainingBalance,
      fillColor: '#64748b',
    },
  ].map((item) => ({
    ...item,
    pct: hasIncome ? (item.value / totalIncome) * 100 : 0,
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
              Alocação da receita
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {incomeAllocationItems.map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p
                      className="mt-1 text-2xl font-bold tabular-nums leading-none"
                      style={{ color: item.value < 0 ? '#ef4444' : item.fillColor }}
                    >
                      {item.pct.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
              <ReportIncomeCompositionChart
                items={incomeAllocationItems.map((item) => ({
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

      {hasExpenses && expenseDistributionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Distribuição das despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {expenseDistributionItems.map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p
                      className="mt-1 text-2xl font-bold tabular-nums leading-none"
                      style={{ color: item.fillColor }}
                    >
                      {item.pct.toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
              <ReportIncomeCompositionChart
                items={expenseDistributionItems.map((item) => ({
                  label: item.label,
                  pct: item.pct,
                  value: item.value,
                  color: item.fillColor,
                }))}
              />
            </div>
            <ReportExpenseTypeBreakdown expenses={expenses} expenseByType={expenseByType} />
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <ReportPaymentMethods paymentMethods={paymentMethods} embedded />
                <ReportTopExpenses expenses={expenses} embedded />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {children}
    </div>
  );
}
