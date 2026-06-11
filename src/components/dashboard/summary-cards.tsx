'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { MonthSummary } from '@/types';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Heart } from 'lucide-react';

export function SummaryCards({ summary }: { summary: MonthSummary }) {
  const cards = [
    {
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Despesas',
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Doações',
      value: summary.totalDonations,
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950',
    },
    {
      title: 'Saldo',
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? 'text-emerald-600' : 'text-red-500',
      bg: 'bg-slate-50 dark:bg-slate-900',
    },
    {
      title: 'Fatura Cartão',
      value: summary.creditCardBill.total,
      icon: CreditCard,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ title, value, icon: Icon, color, bg }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            <div className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="sm:col-span-2 xl:col-span-5">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <PiggyBank className="h-4 w-4 text-emerald-600" />
          <CardTitle className="text-sm font-medium">Meta de Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm">
            <span>{formatCurrency(summary.investment.totalInvested)} investidos</span>
            <span className="text-slate-500">Meta: {formatCurrency(summary.investment.targetAmount)}</span>
          </div>
          <Progress value={summary.investment.progress} />
        </CardContent>
      </Card>
    </div>
  );
}
