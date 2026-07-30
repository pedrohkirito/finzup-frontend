'use client';

import Link from 'next/link';
import { Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { BabyStepState } from '@/types';

type SnowballDebtsCardProps = {
  state: BabyStepState;
  /** Quando true, esconde o empty state (útil em Despesas — só mostra se houver dívidas). */
  hideWhenEmpty?: boolean;
  /** Link do CTA de gestão; em Despesas aponta para a tab parceladas. */
  manageHref?: string;
};

export function SnowballDebtsCard({
  state,
  hideWhenEmpty = false,
  manageHref = '/dashboard/despesas?tab=parceladas',
}: SnowballDebtsCardProps) {
  const debts = state.metrics.snowballDebts;
  const targetId = state.metrics.targetDebt?.id;

  if (hideWhenEmpty && debts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="icon-chip bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Snowflake className="h-5 w-5" />
          </span>
          <CardTitle>Bola de neve de dívidas</CardTitle>
        </div>
        <CardDescription>
          Dívidas de consumo ordenadas da menor para a maior. Pague o mínimo em todas e ataque a
          primeira da lista.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {debts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-white/[0.1] dark:text-slate-400">
            Nenhuma dívida de consumo detectada. Cadastre parcelamentos e acompanhe a fatura do
            cartão.
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total em dívidas de consumo:{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(state.metrics.totalConsumerDebt)}
              </span>
            </p>
            <ul className="space-y-2">
              {debts.map((debt, index) => {
                const isTarget = debt.id === targetId;
                return (
                  <li
                    key={debt.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
                      isTarget
                        ? 'border-brand-300 bg-brand-50/80 dark:border-brand-500/30 dark:bg-brand-500/[0.08]'
                        : 'border-slate-200 dark:border-white/[0.08]',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-white/[0.06]">
                          {index + 1}
                        </span>
                        <p className="truncate font-medium text-slate-900 dark:text-white">
                          {debt.name}
                        </p>
                        {isTarget && (
                          <span className="brand-gradient-bg rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                            Atacar
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 pl-8 text-xs text-slate-500">
                        {debt.remainingInstallments} parcela
                        {debt.remainingInstallments === 1 ? '' : 's'} ·{' '}
                        {formatCurrency(debt.installmentAmount)}/mês
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatCurrency(debt.remainingBalance)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <Button asChild variant="outline" size="sm">
              <Link href={manageHref}>Gerenciar parcelamentos</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
