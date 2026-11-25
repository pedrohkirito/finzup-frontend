'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftRight, Plus, RefreshCw } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useTransfers } from '@/hooks/use-transfers';
import { useSelectedSpace, useSpaces } from '@/hooks/use-spaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemActions } from '@/components/despesas/item-actions';
import type { FinanceScope, TransferEntry, TransferKind } from '@/types';

/**
 * Transferências do mês (pró-labore, lucros, aporte, entre contas e entre empresas).
 * Origem e destino são espaços (pessoal ou uma empresa) e, opcionalmente, contas.
 */

const KIND_OPTIONS: { value: TransferKind; label: string }[] = [
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'profit_distribution', label: 'Distribuição de lucros' },
  { value: 'withdrawal', label: 'Retirada' },
  { value: 'capital_contribution', label: 'Aporte na empresa' },
  { value: 'between_accounts', label: 'Entre contas' },
  { value: 'other', label: 'Outra' },
];
const KIND_LABEL = Object.fromEntries(KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<TransferKind, string>;
const SCOPE_SHORT: Record<FinanceScope, string> = { personal: 'PF', business: 'PJ' };
const SAME_ACCOUNTS_MESSAGE = 'No mesmo espaço, escolha duas contas diferentes.';
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const schema = z
  .object({
    kind: z.enum(['pro_labore', 'profit_distribution', 'capital_contribution', 'between_accounts', 'withdrawal', 'other']),
    name: z.string().max(200),
    amount: z.number().positive('Valor deve ser positivo'),
    fromSpaceId: z.string().min(1, 'Escolha a origem.'),
    toSpaceId: z.string().min(1, 'Escolha o destino.'),
    fromBankAccountId: z.string().nullable(),
    toBankAccountId: z.string().nullable(),
    day: z.number().int().min(1).max(31).nullable(),
    carryForward: z.boolean(),
  })
  .refine((v) => v.fromSpaceId !== v.toSpaceId || (v.fromBankAccountId && v.toBankAccountId && v.fromBankAccountId !== v.toBankAccountId), {
    message: SAME_ACCOUNTS_MESSAGE,
    path: ['toBankAccountId'],
  });

type FormValues = z.infer<typeof schema>;

type SpaceOption = { id: string; name: string; kind: FinanceScope; locked: boolean };

/** Origem/destino padrão de cada tipo: pró-labore e lucros saem da empresa para o pessoal; aporte, o contrário. */
function defaultEnds(kind: TransferKind, spaces: SpaceOption[], preferredBusinessId?: string) {
  const personal = spaces.find((s) => s.kind === 'personal');
  const business = spaces.find((s) => s.id === preferredBusinessId && s.kind === 'business') ?? spaces.find((s) => s.kind === 'business');
  const p = personal?.id ?? '';
  const b = business?.id ?? p;
  if (kind === 'capital_contribution') return { fromSpaceId: p, toSpaceId: b };
  if (kind === 'between_accounts') return { fromSpaceId: preferredBusinessId ?? p, toSpaceId: preferredBusinessId ?? p };
  return { fromSpaceId: b, toSpaceId: p };
}

const EMPTY: FormValues = {
  kind: 'pro_labore',
  name: '',
  amount: 0,
  fromSpaceId: '',
  toSpaceId: '',
  fromBankAccountId: null,
  toBankAccountId: null,
  day: null,
  carryForward: false,
};

function toForm(t: TransferEntry, spaces: SpaceOption[]): FormValues {
  const fallback = (scope: FinanceScope) => spaces.find((s) => s.kind === scope)?.id ?? '';
  return {
    kind: t.kind,
    name: t.name,
    amount: Number(t.amount),
    fromSpaceId: t.fromSpaceId ?? fallback(t.fromScope),
    toSpaceId: t.toSpaceId ?? fallback(t.toScope),
    fromBankAccountId: t.fromBankAccountId,
    toBankAccountId: t.toBankAccountId,
    day: t.day,
    carryForward: t.carryForward,
  };
}

function toPayload(v: FormValues) {
  return {
    kind: v.kind,
    name: v.name.trim() || KIND_LABEL[v.kind],
    amount: v.amount,
    fromSpaceId: v.fromSpaceId,
    toSpaceId: v.toSpaceId,
    fromBankAccountId: v.fromBankAccountId,
    toBankAccountId: v.toBankAccountId,
    day: v.day,
    carryForward: v.carryForward,
  };
}

function AccountSelect({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const { data: accounts } = useBankAccounts();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value ?? 'none'} onValueChange={(v) => onChange(v === 'none' ? null : v)}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem conta</SelectItem>
          {accounts?.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SpaceSelect({
  label,
  value,
  spaces,
  onChange,
}: {
  label: string;
  value: string;
  spaces: SpaceOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder="Escolha" />
        </SelectTrigger>
        <SelectContent>
          {spaces.map((s) => (
            <SelectItem key={s.id} value={s.id} disabled={s.locked && s.id !== value}>
              {s.kind === 'personal' ? `${s.name} (PF)` : s.name}
              {s.locked ? ' · só leitura' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TransferForm({
  form,
  spaces,
  onSubmit,
}: {
  form: UseFormReturn<FormValues>;
  spaces: SpaceOption[];
  onSubmit: (v: FormValues) => Promise<void>;
}) {
  const [carryForward, day, fromAcc, toAcc, fromSpaceId, toSpaceId, kind] = useWatch({
    control: form.control,
    name: ['carryForward', 'day', 'fromBankAccountId', 'toBankAccountId', 'fromSpaceId', 'toSpaceId', 'kind'],
  });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    form.setValue(key, value as never, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  const fieldError =
    form.formState.errors.amount?.message ??
    form.formState.errors.fromSpaceId?.message ??
    form.formState.errors.toSpaceId?.message ??
    form.formState.errors.toBankAccountId?.message;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (v) => {
        setError(null);
        try {
          await onSubmit(v);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a transferência.');
        }
      })}
    >
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={kind}
          onValueChange={(v) => {
            const next = v as TransferKind;
            set('kind', next);
            if (next === 'other') return;
            const fromSpace = spaces.find((s) => s.id === fromSpaceId);
            const toSpace = spaces.find((s) => s.id === toSpaceId);
            const preferred = [fromSpace, toSpace].find((s) => s?.kind === 'business')?.id;
            const ends = defaultEnds(next, spaces, next === 'between_accounts' ? fromSpaceId : preferred);
            set('fromSpaceId', ends.fromSpaceId);
            set('toSpaceId', ends.toSpaceId);
          }}
        >
          <SelectTrigger aria-label="Tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <FormCurrencyInput control={form.control} name="amount" placeholder="0,00" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SpaceSelect label="De (origem)" value={fromSpaceId} spaces={spaces} onChange={(v) => set('fromSpaceId', v)} />
        <SpaceSelect label="Para (destino)" value={toSpaceId} spaces={spaces} onChange={(v) => set('toSpaceId', v)} />
      </div>
      {fromSpaceId && fromSpaceId === toSpaceId && (
        <p className="-mt-2 text-xs text-slate-400">Mesmo espaço: é uma transferência entre contas (escolha as duas abaixo).</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <AccountSelect label="Conta de origem" value={fromAcc} onChange={(v) => set('fromBankAccountId', v)} />
        <AccountSelect label="Conta de destino" value={toAcc} onChange={(v) => set('toBankAccountId', v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{carryForward ? 'Dia do mês' : 'Dia'}</Label>
          <Select value={day ? String(day) : 'none'} onValueChange={(v) => set('day', v === 'none' ? null : Number(v))}>
            <SelectTrigger aria-label="Dia">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="none">Sem data</SelectItem>
              {DAYS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {carryForward ? `Todo dia ${d}` : `Dia ${d}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nome (opcional)</Label>
          <Input placeholder={KIND_LABEL[kind]} {...form.register('name')} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="transferCarryForward" checked={carryForward} onCheckedChange={(v) => set('carryForward', !!v)} />
        <Label htmlFor="transferCarryForward">Repetir todo mês</Label>
      </div>
      <p className="text-xs text-slate-400">
        Não conta como receita nem despesa: sai da origem e entra no destino no mesmo dia do fluxo de caixa. Aqui é o
        controle gerencial; a formalização do pró-labore e das retiradas é com o seu contador.
      </p>
      {(fieldError || error) && <p className="text-sm text-red-500">{fieldError ?? error}</p>}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Salvar
      </Button>
    </form>
  );
}

export function TransfersCard({ monthId, isMonthOpen }: { monthId: string; isMonthOpen: boolean }) {
  const queryClient = useQueryClient();
  const { data: transfers } = useTransfers(monthId);
  const { data: accounts } = useBankAccounts();
  const accountName = (id: string | null) => (id ? accounts?.find((a) => a.id === id)?.name : undefined);
  const { data: spacesData } = useSpaces();
  const spaces: SpaceOption[] = (spacesData?.spaces ?? []).filter((s) => !s.archived);
  const selected = useSelectedSpace();
  const spaceName = (id: string | undefined, scope: FinanceScope) =>
    (id && spacesData?.spaces.find((s) => s.id === id)?.name) || SCOPE_SHORT[scope];
  const [editing, setEditing] = useState<TransferEntry | 'new' | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['months'] });
  const openForm = (target: TransferEntry | 'new') => {
    form.reset(
      target === 'new'
        ? { ...EMPTY, ...defaultEnds('pro_labore', spaces, selected?.kind === 'business' ? selected.id : undefined) }
        : toForm(target, spaces),
    );
    setEditing(target);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-base">Transferências</CardTitle>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pró-labore, lucros, aportes e entre contas.</p>
        </div>
        {isMonthOpen && (
          <Button variant="outline" size="sm" onClick={() => openForm('new')}>
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!transfers?.length ? (
          <p className="py-2 text-sm text-slate-500 dark:text-slate-400">Nenhuma transferência neste mês.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {transfers.map((t) => {
              const from = accountName(t.fromBankAccountId);
              const to = accountName(t.toBankAccountId);
              const meta = [
                (t.fromSpaceId ? t.fromSpaceId !== t.toSpaceId : t.fromScope !== t.toScope)
                  ? `${spaceName(t.fromSpaceId, t.fromScope)} → ${spaceName(t.toSpaceId, t.toScope)}`
                  : `Contas ${spaceName(t.fromSpaceId, t.fromScope)}`,
                from || to ? `${from ?? 'sem conta'} → ${to ?? 'sem conta'}` : null,
                t.day ? (t.carryForward ? `todo dia ${t.day}` : `dia ${t.day}`) : 'sem data',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <div className="icon-chip bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <ArrowLeftRight className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.name}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                      <span>{meta}</span>
                      {t.carryForward && (
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          todo mês
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                    {formatCurrency(Number(t.amount))}
                  </span>
                  <ItemActions
                    readOnly={!isMonthOpen}
                    itemName={t.name}
                    onEdit={() => openForm(t)}
                    onDelete={async () => {
                      await api.delete(`/months/${monthId}/transfers/${t.id}`);
                      await invalidate();
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Nova transferência' : 'Editar transferência'}</DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <TransferForm
              spaces={spaces}
              form={form}
              onSubmit={async (v) => {
                const payload = toPayload(v);
                if (editing === 'new') await api.post(`/months/${monthId}/transfers`, payload);
                else await api.patch(`/months/${monthId}/transfers/${editing.id}`, payload);
                await invalidate();
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
