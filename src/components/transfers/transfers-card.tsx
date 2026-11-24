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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SegmentedControl } from '@/components/finance/segmented-control';
import { ItemActions } from '@/components/despesas/item-actions';
import type { FinanceScope, TransferEntry, TransferKind } from '@/types';

/**
 * Transferências do mês (pró-labore, lucros, aporte, entre contas).
 * Mínimo de propósito: os lados ainda são PF/PJ + conta e vão virar "espaços" na próxima etapa.
 */

type Direction = 'business_to_personal' | 'personal_to_business' | 'same';

const DIRECTION_SCOPES: Record<Exclude<Direction, 'same'>, { from: FinanceScope; to: FinanceScope }> = {
  business_to_personal: { from: 'business', to: 'personal' },
  personal_to_business: { from: 'personal', to: 'business' },
};

const KIND_OPTIONS: { value: TransferKind; label: string }[] = [
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'profit_distribution', label: 'Distribuição de lucros' },
  { value: 'capital_contribution', label: 'Aporte na empresa' },
  { value: 'between_accounts', label: 'Entre contas' },
  { value: 'other', label: 'Outra' },
];
const KIND_LABEL = Object.fromEntries(KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<TransferKind, string>;
const SCOPE_SHORT: Record<FinanceScope, string> = { personal: 'PF', business: 'PJ' };
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const schema = z
  .object({
    kind: z.enum(['pro_labore', 'profit_distribution', 'capital_contribution', 'between_accounts', 'other']),
    name: z.string().max(200),
    amount: z.number().positive('Valor deve ser positivo'),
    direction: z.enum(['business_to_personal', 'personal_to_business', 'same']),
    sameScope: z.enum(['personal', 'business']),
    fromBankAccountId: z.string().nullable(),
    toBankAccountId: z.string().nullable(),
    day: z.number().int().min(1).max(31).nullable(),
    carryForward: z.boolean(),
  })
  .refine((v) => v.direction !== 'same' || (v.fromBankAccountId && v.toBankAccountId && v.fromBankAccountId !== v.toBankAccountId), {
    message: 'Entre contas: escolha duas contas diferentes.',
    path: ['toBankAccountId'],
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  kind: 'pro_labore',
  name: '',
  amount: 0,
  direction: 'business_to_personal',
  sameScope: 'personal',
  fromBankAccountId: null,
  toBankAccountId: null,
  day: null,
  carryForward: false,
};

function toForm(t: TransferEntry): FormValues {
  const same = t.fromScope === t.toScope;
  return {
    kind: t.kind,
    name: t.name,
    amount: Number(t.amount),
    direction: same ? 'same' : t.fromScope === 'business' ? 'business_to_personal' : 'personal_to_business',
    sameScope: t.fromScope,
    fromBankAccountId: t.fromBankAccountId,
    toBankAccountId: t.toBankAccountId,
    day: t.day,
    carryForward: t.carryForward,
  };
}

function toPayload(v: FormValues) {
  const scopes = v.direction === 'same' ? { from: v.sameScope, to: v.sameScope } : DIRECTION_SCOPES[v.direction];
  return {
    kind: v.kind,
    name: v.name.trim() || KIND_LABEL[v.kind],
    amount: v.amount,
    fromScope: scopes.from,
    toScope: scopes.to,
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

function TransferForm({ form, onSubmit }: { form: UseFormReturn<FormValues>; onSubmit: (v: FormValues) => Promise<void> }) {
  const [direction, carryForward, day, fromAcc, toAcc, sameScope, kind] = useWatch({
    control: form.control,
    name: ['direction', 'carryForward', 'day', 'fromBankAccountId', 'toBankAccountId', 'sameScope', 'kind'],
  });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    form.setValue(key, value as never, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  const fieldError = form.formState.errors.amount?.message ?? form.formState.errors.toBankAccountId?.message;

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
            set('kind', v as TransferKind);
            if (v === 'between_accounts') set('direction', 'same');
            if (v === 'capital_contribution') set('direction', 'personal_to_business');
            if (v === 'pro_labore' || v === 'profit_distribution') set('direction', 'business_to_personal');
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
      <div className="space-y-2">
        <Label>De → para</Label>
        <SegmentedControl
          ariaLabel="Direção da transferência"
          className="w-full"
          size="sm"
          options={[
            { value: 'business_to_personal', label: 'PJ → PF' },
            { value: 'personal_to_business', label: 'PF → PJ' },
            { value: 'same', label: 'Entre contas' },
          ]}
          value={direction}
          onChange={(v) => set('direction', v)}
        />
        {direction === 'same' && (
          <SegmentedControl
            ariaLabel="Lado das contas"
            className="w-full"
            size="sm"
            options={[
              { value: 'personal', label: 'Contas PF' },
              { value: 'business', label: 'Contas PJ' },
            ]}
            value={sameScope}
            onChange={(v) => set('sameScope', v)}
          />
        )}
      </div>
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
        Não conta como receita nem despesa: sai da origem e entra no destino no mesmo dia do fluxo de caixa.
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
  const [editing, setEditing] = useState<TransferEntry | 'new' | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['months'] });
  const openForm = (target: TransferEntry | 'new') => {
    form.reset(target === 'new' ? EMPTY : toForm(target));
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
                t.fromScope !== t.toScope ? `${SCOPE_SHORT[t.fromScope]} → ${SCOPE_SHORT[t.toScope]}` : `Contas ${SCOPE_SHORT[t.fromScope]}`,
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
