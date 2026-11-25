'use client';

import { CalendarDays, Landmark } from 'lucide-react';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useBusinessEnabled } from '@/hooks/use-finance-scope';
import { useActiveSpaces } from '@/hooks/use-spaces';
import type { EntryExtras } from '@/types';

/** Texto curto "dia 5 · Itaú · PJ" para mostrar nos cards de lançamento. Não mostra nada quando não há extras. */
export function EntryExtrasMeta({ entry, recurring = false }: { entry: EntryExtras; recurring?: boolean }) {
  const { data: accounts } = useBankAccounts();
  const businessEnabled = useBusinessEnabled();
  const { spaces, businesses } = useActiveSpaces();
  const space = entry.spaceId ? spaces.find((s) => s.id === entry.spaceId) : undefined;
  // Com mais de uma empresa, "PJ" não diz qual: mostra o nome da empresa.
  const spaceLabel = space?.kind === 'business' && businesses.length > 1 ? space.name : undefined;
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
      {showScope ? <ScopeTag scope={entry.scope ?? 'personal'} label={spaceLabel} /> : null}
    </span>
  );
}

export function ScopeTag({ scope, label }: { scope: 'personal' | 'business' | 'mixed'; label?: string }) {
  if (scope === 'mixed') {
    return (
      <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        PF+PJ
      </span>
    );
  }
  return scope === 'business' ? (
    <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
      {label ?? 'PJ'}
    </span>
  ) : (
    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
      PF
    </span>
  );
}
