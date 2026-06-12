'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import type { SummaryItem } from '@/types';
import { ExternalLink } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  avulsa: 'Avulsa',
  fixa: 'Fixa',
  parcelamento: 'Parcelamento',
  assinatura: 'Assinatura',
  financiamento: 'Financiamento',
  despesa: 'Despesa',
  doação: 'Doação',
};

export function SummaryDetailDialog({
  open,
  onOpenChange,
  title,
  items,
  total,
  valueColor,
  href,
  emptyMessage = 'Nenhum item registrado',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: SummaryItem[];
  total: number;
  valueColor?: string;
  href?: string;
  emptyMessage?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between border-b pb-3 text-sm">
          <span className="text-slate-500">Total</span>
          <span className={cn('text-lg font-bold', valueColor)}>{formatCurrency(total)}</span>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  {item.category && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {categoryLabels[item.category] ?? item.category}
                    </Badge>
                  )}
                </div>
                <span className={cn('shrink-0 text-sm font-semibold', valueColor)}>{formatCurrency(item.amount)}</span>
              </div>
            ))
          )}
        </div>
        {href && (
          <Button variant="outline" className="w-full" asChild>
            <Link href={href}>
              Ver página completa
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BalanceDetailDialog({
  open,
  onOpenChange,
  totalIncome,
  totalExpenses,
  totalDonations,
  balance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  balance: number;
}) {
  const rows = [
    { label: 'Receitas', value: totalIncome, color: 'text-emerald-600' },
    { label: 'Despesas', value: -totalExpenses, color: 'text-red-500' },
    { label: 'Doações', value: -totalDonations, color: 'text-rose-600' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Composição do saldo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className={cn('font-semibold', row.color)}>
                {row.value >= 0 ? formatCurrency(row.value) : `− ${formatCurrency(Math.abs(row.value))}`}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium">Saldo</span>
            <span className={cn('text-lg font-bold', balance >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BudgetDetailDialog({
  open,
  onOpenChange,
  budget,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: { name: string; spent: number; limit: number; entries?: { id: string; name: string; amount: number }[] };
}) {
  const entries = budget.entries ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budget.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between border-b pb-3 text-sm">
          <span className="text-slate-500">Gasto / Limite</span>
          <span className="font-semibold">
            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
          </span>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum gasto vinculado a este orçamento</p>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</p>
                <span className="shrink-0 text-sm font-semibold text-amber-600">{formatCurrency(item.amount)}</span>
              </div>
            ))
          )}
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/orcamentos">
            Ver página completa
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
