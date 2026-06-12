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

  const cards = [
    {
      key: 'receitas' as const,
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      itemCount: items.incomes.length,
    },
    {
      key: 'despesas' as const,
      title: 'Despesas',
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950',
      itemCount: items.expenses.length,
    },
    {
      key: 'doacoes' as const,
      title: 'Doações',
      value: summary.totalDonations,
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950',
      itemCount: items.donations.length,
    },
    {
      key: 'saldo' as const,
      title: 'Saldo',
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? 'text-emerald-600' : 'text-red-500',
      bg: 'bg-slate-50 dark:bg-slate-900',
      itemCount: null,
    },
    {
      key: 'fatura' as const,
      title: 'Fatura Cartão',
      value: summary.creditCardBill.total,
      icon: CreditCard,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950',
      itemCount: creditCardItems.length,
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, title, value, icon: Icon, color, bg, itemCount }) => (
          <Card
            key={key}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setOpenDialog(key)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
              <div className={`rounded-lg p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</p>
              {itemCount !== null && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  {itemCount === 0 ? 'Nenhum item' : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
              {key === 'saldo' && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  Ver composição
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md sm:col-span-2 xl:col-span-5"
          onClick={() => setOpenDialog('investimentos')}
        >
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <PiggyBank className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-medium">Meta de Investimento</CardTitle>
            <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span>{formatCurrency(summary.investment.totalInvested)} investidos</span>
              <span className="text-slate-500">Meta: {formatCurrency(summary.investment.targetAmount)}</span>
            </div>
            <Progress value={summary.investment.progress} />
            {items.investments.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                {items.investments.length} {items.investments.length === 1 ? 'aporte' : 'aportes'} — clique para ver
              </p>
            )}
          </CardContent>
        </Card>

        {summary.budgets?.length > 0 && (
          <Card className="sm:col-span-2 xl:col-span-5">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Target className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="cursor-pointer rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => setOpenBudget(budget)}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      {budget.name}
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </span>
                    <div className="flex items-center gap-2">
                      {budget.overBudget && <Badge variant="destructive">Estourado</Badge>}
                      <span className={cn(budget.remaining < 0 ? 'text-red-500' : 'text-slate-500')}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={budget.progress}
                    className={cn(budget.overBudget && '[&>div]:bg-red-500')}
                  />
                  {(budget.entries?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-slate-400">
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
        valueColor="text-red-500"
        href="/dashboard/despesas"
      />

      <SummaryDetailDialog
        open={openDialog === 'doacoes'}
        onOpenChange={(open) => setOpenDialog(open ? 'doacoes' : null)}
        title="Doações do mês"
        items={items.donations}
        total={summary.totalDonations}
        valueColor="text-rose-600"
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
