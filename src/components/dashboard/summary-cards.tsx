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

  const balancePositive = summary.balance >= 0;

  const cards = [
    {
      key: 'receitas' as const,
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      accent: 'text-emerald-600 dark:text-emerald-400',
      chip: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      itemCount: items.incomes.length,
    },
    {
      key: 'despesas' as const,
      title: 'Despesas',
      value: summary.totalExpenses,
      icon: TrendingDown,
      accent: 'text-orange-600 dark:text-orange-400',
      chip: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
      itemCount: items.expenses.length,
    },
    {
      key: 'fatura' as const,
      title: 'Fatura Cartão',
      value: summary.creditCardBill.total,
      icon: CreditCard,
      accent: 'text-violet-600 dark:text-violet-400',
      chip: 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
      itemCount: creditCardItems.length,
    },
    {
      key: 'doacoes' as const,
      title: 'Doações',
      value: summary.totalDonations,
      icon: Heart,
      accent: 'text-sky-600 dark:text-sky-400',
      chip: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
      itemCount: items.donations.length,
    },
  ];

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <div
          className="brand-gradient-border cursor-pointer rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] sm:p-6 dark:shadow-[0_8px_24px_rgba(2,6,23,0.35)]"
          onClick={() => setOpenDialog('saldo')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo</p>
              <p
                className={cn(
                  'mt-2 truncate text-3xl font-bold tracking-tight sm:text-4xl',
                  balancePositive ? 'brand-gradient-text' : 'text-red-500 dark:text-red-400',
                )}
              >
                {formatCurrency(summary.balance)}
              </p>
              <p className="mt-2.5 flex items-center gap-1 text-xs text-slate-400">
                Ver composição
                <ChevronRight className="h-3 w-3" />
              </p>
            </div>
            <div
              className={cn(
                'icon-chip',
                balancePositive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-red-500/15 text-red-500 dark:bg-red-500/15 dark:text-red-400',
              )}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {cards.map(({ key, title, value, icon: Icon, accent, chip, itemCount }) => (
            <Card
              key={key}
              className="cursor-pointer p-4 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06]"
              onClick={() => setOpenDialog(key)}
            >
              <div className={cn('icon-chip', chip)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
              <p className={cn('mt-1 truncate text-lg font-bold tracking-tight sm:text-xl', accent)}>
                {formatCurrency(value)}
              </p>
              {itemCount !== null && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  {itemCount === 0 ? 'Nenhum item' : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
            </Card>
          ))}
        </div>

        <Card
          className="cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06]"
          onClick={() => setOpenDialog('investimentos')}
        >
          <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
            <div className="icon-chip bg-violet-500/15 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <PiggyBank className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium">Meta de Investimento</CardTitle>
              <p className="text-xs text-slate-400">
                {items.investments.length > 0
                  ? `${items.investments.length} ${items.investments.length === 1 ? 'aporte' : 'aportes'} este mês`
                  : 'Nenhum aporte registrado'}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
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
            <Progress value={investmentProgress} className="[&>div]:bg-violet-500" />
          </CardContent>
        </Card>

        {hasBudgets && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
              <div className="icon-chip bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {summary.budgets!.map((budget) => (
                <div
                  key={budget.id}
                  className="cursor-pointer rounded-xl bg-slate-50/80 p-3 transition-all hover:bg-slate-100/80 hover:shadow-sm dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
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
        valueColor="text-emerald-600 dark:text-emerald-400"
        href="/dashboard/receitas"
      />

      <SummaryDetailDialog
        open={openDialog === 'despesas'}
        onOpenChange={(open) => setOpenDialog(open ? 'despesas' : null)}
        title="Despesas do mês"
        items={items.expenses}
        total={summary.totalExpenses}
        valueColor="text-orange-600 dark:text-orange-400"
        href="/dashboard/despesas"
        groupByCategory
      />

      <SummaryDetailDialog
        open={openDialog === 'doacoes'}
        onOpenChange={(open) => setOpenDialog(open ? 'doacoes' : null)}
        title="Doações do mês"
        items={items.donations}
        total={summary.totalDonations}
        valueColor="text-sky-600 dark:text-sky-400"
        href="/dashboard/doacoes"
      />

      <BalanceDetailDialog
        open={openDialog === 'saldo'}
        onOpenChange={(open) => setOpenDialog(open ? 'saldo' : null)}
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        totalDonations={summary.totalDonations}
        totalInvested={summary.investment.totalInvested}
        balance={summary.balance}
      />

      <SummaryDetailDialog
        open={openDialog === 'fatura'}
        onOpenChange={(open) => setOpenDialog(open ? 'fatura' : null)}
        title="Fatura do cartão"
        items={creditCardItems}
        total={summary.creditCardBill.total}
        valueColor="text-violet-600 dark:text-violet-400"
        href="/dashboard/despesas"
        emptyMessage="Nenhum lançamento pendente no cartão"
      />

      <SummaryDetailDialog
        open={openDialog === 'investimentos'}
        onOpenChange={(open) => setOpenDialog(open ? 'investimentos' : null)}
        title="Aportes do mês"
        items={items.investments}
        total={summary.investment.totalInvested}
        valueColor="text-emerald-600 dark:text-emerald-400"
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
