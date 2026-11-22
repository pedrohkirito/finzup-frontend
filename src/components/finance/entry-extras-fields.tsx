'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { ChevronDown, Plus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { BANK_ACCOUNTS_QUERY_KEY, useBankAccounts } from '@/hooks/use-bank-accounts';
import { useBusinessEnabled } from '@/hooks/use-finance-scope';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SegmentedControl } from '@/components/finance/segmented-control';
import type { BankAccount, EntryExtras, FinanceScope } from '@/types';

/** Campos opcionais para juntar ao schema zod dos formulários de lançamento. */
export const entryExtrasFormShape = {
  day: z.number().int().min(1).max(31).nullable().optional(),
  scope: z.enum(['personal', 'business']).optional(),
  bankAccountId: z.string().nullable().optional(),
};

export type EntryExtrasFormValues = {
  day?: number | null;
  scope?: FinanceScope;
  bankAccountId?: string | null;
};

/** Valores dos extras de um lançamento existente, para o `reset` do formulário de edição. */
export function extrasFormValues(entry: EntryExtras): EntryExtrasFormValues {
  return {
    day: entry.day ?? null,
    scope: entry.scope ?? 'personal',
    bankAccountId: entry.bankAccountId ?? null,
  };
}

/** Qualquer formulário do react-hook-form cujo schema inclua `entryExtrasFormShape`. */
type FormWithExtras = { control: unknown; setValue: unknown };

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const NEW_ACCOUNT = '__new__';

/**
 * "Mais detalhes" recolhido dos lançamentos: dia do mês, conta bancária e PF/PJ.
 * Tudo é opcional; quem não abrir continua cadastrando como antes.
 */
export function EntryExtrasFields({
  form,
  recurring = false,
  showScope,
}: {
  form: FormWithExtras;
  /** Itens que repetem todo mês: o dia vira "dia do mês em que vence/entra". */
  recurring?: boolean;
  /** Força mostrar ou esconder PF/PJ. Padrão: mostra com o fluxo PJ ligado. */
  showScope?: boolean;
}) {
  const f = form as unknown as UseFormReturn<EntryExtrasFormValues>;
  const [watchedDay, watchedScope, watchedAccount] = useWatch({
    control: f.control,
    name: ['day', 'scope', 'bankAccountId'],
  });
  const day = watchedDay ?? null;
  const scope = watchedScope ?? 'personal';
  const bankAccountId = watchedAccount ?? null;
  const businessEnabled = useBusinessEnabled();
  const scopeVisible = showScope ?? (businessEnabled || scope === 'business');
  const { data: accounts } = useBankAccounts();
  const account = accounts?.find((a) => a.id === bankAccountId);
  const [expanded, setExpanded] = useState(() => !!day || !!bankAccountId || scope === 'business');
  const [creating, setCreating] = useState(false);

  const setDay = (value: number | null) => f.setValue('day', value, { shouldDirty: true });
  const setScope = (value: FinanceScope) => f.setValue('scope', value, { shouldDirty: true });
  const setAccount = (value: string | null) => f.setValue('bankAccountId', value, { shouldDirty: true });

  const summary = [
    day ? (recurring ? `todo dia ${day}` : `dia ${day}`) : null,
    account?.name ?? null,
    scopeVisible ? (scope === 'business' ? 'PJ' : 'PF') : null,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]"
      >
        <span className="min-w-0">
          <span className="font-medium text-slate-700 dark:text-slate-200">Mais detalhes</span>
          <span className="ml-1.5 truncate text-xs text-slate-400">
            {summary.length ? summary.join(' · ') : scopeVisible ? 'data, conta e PF/PJ (opcional)' : 'data e conta (opcional)'}
          </span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-200 px-3 pb-3 pt-3 dark:border-white/[0.08]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{recurring ? 'Dia do mês' : 'Dia'}</Label>
              <Select value={day ? String(day) : 'none'} onValueChange={(v) => setDay(v === 'none' ? null : Number(v))}>
                <SelectTrigger aria-label={recurring ? 'Dia do mês' : 'Dia'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">Sem data</SelectItem>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {recurring ? `Todo dia ${d}` : `Dia ${d}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Conta</Label>
                <Link
                  href="/dashboard/configuracoes#contas"
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Gerenciar
                </Link>
              </div>
              {creating ? (
                <NewAccountInline
                  onCancel={() => setCreating(false)}
                  onCreated={(created) => {
                    setAccount(created.id);
                    setCreating(false);
                  }}
                />
              ) : (
                <Select
                  value={bankAccountId ?? 'none'}
                  onValueChange={(v) => {
                    if (v === NEW_ACCOUNT) {
                      setCreating(true);
                      return;
                    }
                    setAccount(v === 'none' ? null : v);
                  }}
                >
                  <SelectTrigger aria-label="Conta">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem conta</SelectItem>
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_ACCOUNT}>+ Nova conta</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {scopeVisible && (
            <div className="space-y-2">
              <Label>Finanças</Label>
              <SegmentedControl
                ariaLabel="PF ou PJ"
                className="w-full"
                options={[
                  { value: 'personal', label: 'Pessoal (PF)' },
                  { value: 'business', label: 'Empresa (PJ)' },
                ]}
                value={scope}
                onChange={(v) => setScope(v)}
              />
            </div>
          )}

          <p className="text-xs text-slate-400">
            {day
              ? recurring
                ? 'O dia é usado no fluxo de caixa de todos os meses.'
                : 'O dia é usado no fluxo de caixa diário.'
              : 'Sem data, o valor conta no início do mês no fluxo de caixa.'}
          </p>
        </div>
      )}
    </div>
  );
}

function NewAccountInline({
  onCreated,
  onCancel,
}: {
  onCreated: (account: BankAccount) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      setError('Informe o nome da conta.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.post<BankAccount>('/bank-accounts', { name: name.trim() });
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="Ex: Nubank, Itaú PJ"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void save();
            }
            if (e.key === 'Escape') onCancel();
          }}
        />
        <Button type="button" size="icon" onClick={save} disabled={saving} aria-label="Criar conta">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <button type="button" className="text-xs text-slate-400 hover:underline" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </div>
  );
}
