'use client';

import { CalendarDays, Landmark } from 'lucide-react';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useBusinessEnabled } from '@/hooks/use-finance-scope';
import type { EntryExtras } from '@/types';

/** Texto curto "dia 5 · Itaú · PJ" para mostrar nos cards de lançamento. Não mostra nada quando não há extras. */
export function EntryExtrasMeta({ entry, recurring = false }: { entry: EntryExtras; recurring?: boolean }) {
  const { data: accounts } = useBankAccounts();
  const businessEnabled = useBusinessEnabled();
  const account = entry.bankAccountId ? accounts?.find((a) => a.id === entry.bankAccountId) : undefined;
  const showScope = businessEnabled || entry.scope === 'business';
  if (!entry.day && !account && !showScope) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-400">
      {entry.day ? (
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {recurring ? `todo dia ${entry.day}` : `dia ${entry.day}`}
        </span>
      ) : null}
      {account ? (
        <span className="inline-flex items-center gap-1">
          <Landmark className="h-3 w-3" />
          {account.name}
        </span>
      ) : null}
      {showScope ? <ScopeTag scope={entry.scope ?? 'personal'} /> : null}
    </span>
  );
}

export function ScopeTag({ scope }: { scope: 'personal' | 'business' | 'mixed' }) {
  if (scope === 'mixed') {
    return (
      <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        PF+PJ
      </span>
    );
  }
  return scope === 'business' ? (
    <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
      PJ
    </span>
  ) : (
    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
      PF
    </span>
  );
}
