'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import type { BudgetSummary, MonthSummary } from '@/types';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Heart, Target, ChevronRight } from 'lucide-react';
import {
  BalanceDetailDialog,
  BudgetDetailDialog,
  SummaryDetailDialog,
} from '@/components/dashboard/summary-detail-dialog';

type DialogKey =
  | 'receitas'
  | 'despesas'
  | 'doacoes'
  | 'saldo'
  | 'fatura'
  | 'investimentos'
  | null;

export function SummaryCards({ summary }: { summary: MonthSummary }) {
  const [openDialog, setOpenDialog] = useState<DialogKey>(null);
  const [openBudget, setOpenBudget] = useState<BudgetSummary | null>(null);

  const items = summary.items ?? { incomes: [], expenses: [], donations: [], investments: [] };
  const creditCardItems = summary.creditCardBill.items ?? [];
  const hasBudgets = (summary.budgets?.length ?? 0) > 0;
  const investmentProgress = Math.min(summary.investment.progress, 100);

  const cards = [
    {
      key: 'receitas' as const,
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      itemCount: items.incomes.length,
    },
    {
      key: 'despesas' as const,
      title: 'Despesas',
      value: summary.totalExpenses,
      icon: TrendingDown,
      accent: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      itemCount: items.expenses.length,
    },
    {
      key: 'doacoes' as const,
      title: 'Doações',
      value: summary.totalDonations,
      icon: Heart,
      accent: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      itemCount: items.donations.length,
    },
    {
      key: 'saldo' as const,
      title: 'Saldo',
      value: summary.balance,
      icon: Wallet,
      accent: summary.balance >= 0 ? 'text-emerald-600' : 'text-red-500',
      bg: summary.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-red-50 dark:bg-red-950/60',
      itemCount: null,
    },
    {
      key: 'fatura' as const,
      title: 'Fatura Cartão',
      value: summary.creditCardBill.total,
      icon: CreditCard,
      accent: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/60',
      itemCount: creditCardItems.length,
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, title, value, icon: Icon, accent, bg, itemCount }) => (
          <Card
            key={key}
            className="cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 dark:hover:border-slate-700"
            onClick={() => setOpenDialog(key)}
          >
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
              <div className={cn('rounded-lg p-2', bg)}>
                <Icon className={cn('h-4 w-4', accent)} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={cn('text-2xl font-bold tracking-tight', accent)}>{formatCurrency(value)}</p>
              {itemCount !== null && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  {itemCount === 0 ? 'Nenhum item' : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
              {key === 'saldo' && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  Ver composição
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        <Card
          className="cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 dark:hover:border-slate-700 sm:col-span-2 xl:col-span-5"
          onClick={() => setOpenDialog('investimentos')}
        >
          <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/60">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium">Meta de Investimento</CardTitle>
              <p className="text-xs text-slate-400">
                {items.investments.length > 0
                  ? `${items.investments.length} ${items.investments.length === 1 ? 'aporte' : 'aportes'} este mês`
                  : 'Nenhum aporte registrado'}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              {investmentProgress.toFixed(0)}%
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                  {formatCurrency(summary.investment.totalInvested)}
                </p>
                <p className="text-xs text-slate-400">investidos</p>
              </div>
              <p className="text-sm text-slate-500">
                Meta:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(summary.investment.targetAmount)}
                </span>
              </p>
            </div>
            <Progress value={investmentProgress} />
          </CardContent>
        </Card>

        {hasBudgets && (
          <Card className="sm:col-span-2 xl:col-span-5">
            <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
              <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/60">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {summary.budgets!.map((budget) => (
                <div
                  key={budget.id}
                  className="cursor-pointer rounded-lg bg-slate-50/80 p-3 transition-all hover:bg-slate-100/80 hover:shadow-sm dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
                  onClick={() => setOpenBudget(budget)}
                >
                  <div className="mb-2.5 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                      {budget.name}
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {budget.overBudget && <Badge variant="destructive">Estourado</Badge>}
                      <span className="text-slate-500">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(budget.spent)}</span>
                        {' / '}
                        {formatCurrency(budget.limit)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={budget.progress}
                    className={cn(
                      budget.overBudget
                        ? '[&>div]:bg-red-500'
                        : '[&>div]:bg-amber-500',
                    )}
                  />
                  {(budget.entries?.length ?? 0) > 0 && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {budget.entries!.length} {budget.entries!.length === 1 ? 'gasto' : 'gastos'}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <SummaryDetailDialog
        open={openDialog === 'receitas'}
        onOpenChange={(open) => setOpenDialog(open ? 'receitas' : null)}
        title="Receitas do mês"
        items={items.incomes}
        total={summary.totalIncome}
        valueColor="text-emerald-600"
        href="/dashboard/receitas"
      />

      <SummaryDetailDialog
        open={openDialog === 'despesas'}
        onOpenChange={(open) => setOpenDialog(open ? 'despesas' : null)}
        title="Despesas do mês"
        items={items.expenses}
        total={summary.totalExpenses}
        valueColor="text-orange-600"
        href="/dashboard/despesas"
        groupByCategory
      />

      <SummaryDetailDialog
        open={openDialog === 'doacoes'}
        onOpenChange={(open) => setOpenDialog(open ? 'doacoes' : null)}
        title="Doações do mês"
        items={items.donations}
        total={summary.totalDonations}
        valueColor="text-sky-600"
        href="/dashboard/doacoes"
      />

      <BalanceDetailDialog
        open={openDialog === 'saldo'}
        onOpenChange={(open) => setOpenDialog(open ? 'saldo' : null)}
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        totalDonations={summary.totalDonations}
        balance={summary.balance}
      />

      <SummaryDetailDialog
        open={openDialog === 'fatura'}
        onOpenChange={(open) => setOpenDialog(open ? 'fatura' : null)}
        title="Fatura do cartão"
        items={creditCardItems}
        total={summary.creditCardBill.total}
        valueColor="text-violet-600"
        href="/dashboard/despesas"
        emptyMessage="Nenhum lançamento pendente no cartão"
      />

      <SummaryDetailDialog
        open={openDialog === 'investimentos'}
        onOpenChange={(open) => setOpenDialog(open ? 'investimentos' : null)}
        title="Aportes do mês"
        items={items.investments}
        total={summary.investment.totalInvested}
        valueColor="text-emerald-600"
        href="/dashboard/investimentos"
        emptyMessage="Nenhum aporte registrado"
      />

      {openBudget && (
        <BudgetDetailDialog
          open={!!openBudget}
          onOpenChange={(open) => !open && setOpenBudget(null)}
          budget={openBudget}
        />
      )}
    </>
  );
}
