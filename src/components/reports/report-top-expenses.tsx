'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { SummaryItem } from '@/types';
import { ReportSection } from './report-section';
import { EXPENSE_CATEGORY_LABELS } from './chart-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const INITIAL_VISIBLE = 3;

function TopExpenseItem({ expense, rank }: { expense: SummaryItem; rank: number }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.name}</p>
        {expense.category && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
          </Badge>
        )}
      </div>
      <span className="shrink-0 text-sm font-semibold text-orange-600">{formatCurrency(expense.amount)}</span>
    </li>
  );
}

function ReportTopExpensesContent({ expenses }: { expenses: SummaryItem[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.amount - a.amount),
    [expenses],
  );

  if (sortedExpenses.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</p>;
  }

  const visibleExpenses = sortedExpenses.slice(0, INITIAL_VISIBLE);
  const hasMore = sortedExpenses.length > INITIAL_VISIBLE;
  const total = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <>
      <div className="space-y-2">
        <ol className="space-y-2">
          {visibleExpenses.map((expense, index) => (
            <TopExpenseItem key={expense.id} expense={expense} rank={index + 1} />
          ))}
        </ol>
        {hasMore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-slate-500"
            onClick={() => setDialogOpen(true)}
          >
            Ver mais ({sortedExpenses.length - INITIAL_VISIBLE})
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Maiores gastos</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between border-b pb-3 text-sm">
            <span className="text-slate-500">Total</span>
            <span className="text-lg font-bold text-orange-600">{formatCurrency(total)}</span>
          </div>
          <ScrollArea className="max-h-[50vh]">
            <ol className="space-y-2">
            {sortedExpenses.map((expense, index) => (
              <TopExpenseItem key={expense.id} expense={expense} rank={index + 1} />
            ))}
            </ol>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ReportTopExpenses({
  expenses,
  className,
  embedded = false,
}: {
  expenses: SummaryItem[];
  className?: string;
  embedded?: boolean;
}) {
  if (embedded) {
    return (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Maiores gastos
        </p>
        <ReportTopExpensesContent expenses={expenses} />
      </div>
    );
  }

  return (
    <ReportSection className={className} title="Maiores gastos" description="Despesas do mês por valor">
      <ReportTopExpensesContent expenses={expenses} />
    </ReportSection>
  );
}
