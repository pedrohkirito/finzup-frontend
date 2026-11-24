'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import type { BudgetSummary, MonthSummary } from '@/types';
import { budgetTerms, useBusinessView } from '@/hooks/use-finance-scope';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Heart, Target, ChevronRight } from 'lucide-react';
import {
  BalanceDetailDialog,
  BudgetDetailDialog,
  SummaryDetailDialog,
} from '@/components/dashboard/summary-detail-dialog';

function budgetTone(progress: number, overBudget: boolean) {
  if (overBudget) {
    return {
      bar: '[&>div]:bg-red-500',
      percent: 'text-red-500 dark:text-red-400',
      chip: 'bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400',
      remaining: 'text-red-500 dark:text-red-400',
    };
  }
  if (progress >= 85) {
    return {
      bar: '[&>div]:bg-amber-400',
      percent: 'text-amber-600 dark:text-amber-400',
      chip: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      remaining: 'text-amber-600 dark:text-amber-400',
    };
  }
  return {
    bar: '[&>div]:bg-emerald-500',
    percent: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    remaining: 'text-emerald-600 dark:text-emerald-400',
  };
}

function BudgetSection({
  budgets,
  onOpen,
}: {
  budgets: BudgetSummary[];
  onOpen: (budget: BudgetSummary) => void;
}) {
  const sorted = [...budgets].sort((a, b) => {
    if (a.overBudget !== b.overBudget) return a.overBudget ? -1 : 1;
    return b.progress - a.progress;
  });
  const business = useBusinessView();
  const totalLimit = sorted.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = sorted.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalLimit - totalSpent;
  const overCount = sorted.filter((budget) => budget.overBudget).length;
  const budgetsTitle = budgetTerms(business).title;

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{budgetsTitle}</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(totalSpent)}</span>
            {' de '}
            {formatCurrency(totalLimit)}
            {' · '}
            <span className={totalRemaining < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
              {formatCurrency(Math.abs(totalRemaining))} {totalRemaining < 0 ? 'acima' : 'restantes'}
            </span>
            {overCount > 0 && (
              <>
                {' · '}
                <span className="text-red-500 dark:text-red-400">
                  {overCount} {overCount === 1 ? 'estourado' : 'estourados'}
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/orcamentos"
          className="mt-0.5 flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Ver todos
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((budget) => {
          const tone = budgetTone(budget.progress, budget.overBudget);
          const entryCount = budget.entries?.length ?? 0;

          return (
            <Card
              key={budget.id}
              className={cn(
                'cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06]',
                sorted.length === 1 && 'sm:col-span-2',
              )}
              onClick={() => onOpen(budget)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={cn('icon-chip', tone.chip)}>
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{budget.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {entryCount === 0
                        ? 'Nenhum gasto'
                        : `${entryCount} ${entryCount === 1 ? 'gasto' : 'gastos'}`}
                    </p>
                  </div>
                </div>
                <span className={cn('shrink-0 text-sm font-bold tabular-nums', tone.percent)}>
                  {budget.progress.toFixed(0)}%
                </span>
              </div>

              <Progress value={Math.min(budget.progress, 100)} className={cn('mt-4 h-2', tone.bar)} />

              <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="min-w-0 truncate text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                  {formatCurrency(budget.spent)}
                  <span className="text-xs font-normal text-slate-400"> / {formatCurrency(budget.limit)}</span>
                </p>
                <p className={cn('shrink-0 text-xs font-medium', tone.remaining)}>
                  {budget.remaining >= 0
                    ? `${formatCurrency(budget.remaining)} restantes`
                    : `${formatCurrency(Math.abs(budget.remaining))} acima`}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

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
          <BudgetSection budgets={summary.budgets!} onOpen={setOpenBudget} />
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
