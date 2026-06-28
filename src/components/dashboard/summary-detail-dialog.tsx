'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, cn } from '@/lib/utils';
import type { SummaryItem } from '@/types';
import { ExternalLink } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  avulsa: 'Avulsas',
  fixa: 'Fixas',
  parcelamento: 'Parceladas',
  assinatura: 'Assinaturas',
  financiamento: 'Financiamentos',
  despesa: 'Despesa',
  doação: 'Doação',
};

const expenseCategoryOrder = ['avulsa', 'fixa', 'parcelamento', 'assinatura', 'financiamento'] as const;

const summaryScrollClass = '-mr-5 max-h-[50vh] sm:-mr-6';
const summaryScrollContentClass = 'space-y-2 pt-3 pr-2';
const summaryTotalRowClass =
  'flex items-center justify-between border-b border-slate-200/25 pb-3 text-sm dark:border-slate-700/40';
const summaryItemClass =
  'flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50';
const summaryItemWithMetaClass =
  'flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50';

function groupItemsByCategory(items: SummaryItem[]) {
  const groups = new Map<string, SummaryItem[]>();

  for (const item of items) {
    const category = item.category ?? 'outros';
    const group = groups.get(category) ?? [];
    group.push(item);
    groups.set(category, group);
  }

  const orderedCategories = [
    ...expenseCategoryOrder.filter((category) => groups.has(category)),
    ...[...groups.keys()].filter((category) => !expenseCategoryOrder.includes(category as (typeof expenseCategoryOrder)[number])),
  ];

  return orderedCategories.map((category) => {
    const groupItems = groups.get(category) ?? [];
    return {
      category,
      items: groupItems,
      total: groupItems.reduce((sum, item) => sum + item.amount, 0),
    };
  });
}

export function SummaryDetailDialog({
  open,
  onOpenChange,
  title,
  items,
  total,
  valueColor,
  href,
  emptyMessage = 'Nenhum item registrado',
  groupByCategory = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: SummaryItem[];
  total: number;
  valueColor?: string;
  href?: string;
  emptyMessage?: string;
  groupByCategory?: boolean;
}) {
  const groupedItems = groupByCategory ? groupItemsByCategory(items) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex max-h-[80vh] !flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={summaryTotalRowClass}>
          <span className="text-slate-500">Total</span>
          <span className={cn('text-lg font-bold', valueColor)}>{formatCurrency(total)}</span>
        </div>
        <ScrollArea className={summaryScrollClass}>
          <div className={summaryScrollContentClass}>
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
            ) : groupedItems ? (
              <div className="space-y-4">
                {groupedItems.map((group) => (
                  <div key={group.category} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 px-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {categoryLabels[group.category] ?? group.category}
                      </p>
                      <span className={cn('text-xs font-semibold', valueColor)}>{formatCurrency(group.total)}</span>
                    </div>
                    {group.items.map((item) => (
                      <div key={item.id} className={summaryItemClass}>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</p>
                        <span className={cn('shrink-0 text-sm font-semibold', valueColor)}>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={summaryItemWithMetaClass}>
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
        </ScrollArea>
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
    { label: 'Receitas', value: totalIncome, color: 'text-emerald-600', prefix: '+' },
    { label: 'Despesas', value: totalExpenses, color: 'text-orange-600', prefix: '−' },
    { label: 'Doações', value: totalDonations, color: 'text-sky-600', prefix: '−' },
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
                {row.prefix} {formatCurrency(row.value)}
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
      <DialogContent className="!flex max-h-[80vh] !flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budget.name}</DialogTitle>
        </DialogHeader>
        <div className={summaryTotalRowClass}>
          <span className="text-slate-500">Gasto / Limite</span>
          <span className="font-semibold">
            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
          </span>
        </div>
        <ScrollArea className={summaryScrollClass}>
          <div className={summaryScrollContentClass}>
            {entries.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nenhum gasto vinculado a este orçamento</p>
            ) : (
              entries.map((item) => (
                <div key={item.id} className={summaryItemClass}>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</p>
                  <span className="shrink-0 text-sm font-semibold text-amber-600">{formatCurrency(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
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
