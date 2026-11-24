'use client';

import Link from 'next/link';
import { Briefcase, ChevronRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { FinanceScope, ScopeBreakdown, ScopeTotals, SpaceTotals } from '@/types';

type Row = { key: string; kind: FinanceScope; label: string; totals: ScopeTotals };

/** No consolidado, mostra o saldo de cada espaço (pessoal e cada empresa) lado a lado. */
export function ScopeBreakdownCard({ breakdown, spaces }: { breakdown: ScopeBreakdown; spaces?: SpaceTotals[] | null }) {
  const rows: Row[] =
    spaces && spaces.length > 1
      ? spaces.map((sp) => ({ key: sp.spaceId, kind: sp.kind, label: sp.name, totals: sp }))
      : [
          { key: 'personal', kind: 'personal', label: 'Pessoa física', totals: breakdown.personal },
          { key: 'business', kind: 'business', label: 'Empresa (PJ)', totals: breakdown.business },
        ];
  return (
    <Card>
      <CardContent className={cn('grid gap-3 p-4 sm:grid-cols-2', rows.length > 2 && 'lg:grid-cols-3')}>
        {rows.map(({ key, kind, label, totals }) => {
          const Icon = kind === 'business' ? Briefcase : User;
          return (
          <div key={key} className="flex items-center gap-3">
            <div
              className={cn(
                'icon-chip h-10 w-10',
                kind === 'business' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              <p className={cn('text-lg font-bold tabular-nums', totals.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
                {formatCurrency(totals.balance)}
              </p>
              <p className="truncate text-xs text-slate-400">
                Entradas {formatCurrency(totals.totalIncome)} · Saídas {formatCurrency(totals.totalExpenses + totals.totalDonations + totals.totalInvested)}
              </p>
              {(totals.transfersIn || totals.transfersOut) ? (
                <p className="truncate text-xs text-slate-400">
                  Transferências {totals.transfersIn ? `+${formatCurrency(totals.transfersIn)}` : ''}
                  {totals.transfersIn && totals.transfersOut ? ' / ' : ''}
                  {totals.transfersOut ? `−${formatCurrency(totals.transfersOut)}` : ''}
                </p>
              ) : null}
            </div>
          </div>
          );
        })}
        <Link
          href="/dashboard/fluxo"
          className="flex items-center justify-end gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 col-span-full dark:text-slate-400 dark:hover:text-slate-200"
        >
          Ver fluxo de caixa dia a dia
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
