'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, Landmark, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { BANK_ACCOUNTS_QUERY_KEY, useBankAccounts } from '@/hooks/use-bank-accounts';
import { useActiveSpaces } from '@/hooks/use-spaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AccountKind, BankAccount } from '@/types';

export const ACCOUNT_KIND_OPTIONS: { value: AccountKind; label: string; icon: typeof Landmark }[] = [
  { value: 'bank', label: 'Banco', icon: Landmark },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'card', label: 'Cartão pré-pago / benefício', icon: CreditCard },
  { value: 'other', label: 'Outra carteira', icon: Wallet },
];
const KIND_META = Object.fromEntries(ACCOUNT_KIND_OPTIONS.map((o) => [o.value, o])) as Record<
  AccountKind,
  (typeof ACCOUNT_KIND_OPTIONS)[number]
>;
const NO_SPACE = 'none';
const SHORT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

type FormState = {
  name: string;
  kind: AccountKind;
  spaceId: string;
  amount: number;
  negative: boolean;
  month: string;
};

function toForm(account: BankAccount): FormState {
  return {
    name: account.name,
    kind: account.kind ?? 'bank',
    spaceId: account.spaceId ?? NO_SPACE,
    amount: Math.abs(account.initialBalance ?? 0),
    negative: (account.initialBalance ?? 0) < 0,
    month: (account.initialBalanceDate ?? `${currentMonth()}-01`).slice(0, 7),
  };
}

/** Contas e carteiras: tipo, espaço, saldo inicial e saldo atual calculado pelos lançamentos ligados. */
export function BankAccountsCard() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useBankAccounts({ fresh: true });
  const { spaces, businesses } = useActiveSpaces();
  const showSpaces = businesses.length > 0;
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
  const spaceName = (id: string | null) => (id ? spaces.find((s) => s.id === id)?.name : undefined);
  const total = (accounts ?? []).reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);

  const add = async () => {
    if (!newName.trim()) {
      setAddError('Informe o nome da conta.');
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const created = await api.post<BankAccount>('/bank-accounts', { name: newName.trim() });
      setNewName('');
      await refresh();
      // Abre a edição para informar tipo e saldo inicial.
      openEdit(created);
    } catch (err) {
      setAddError(errorMessage(err, 'Não foi possível criar a conta.'));
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (account: BankAccount) => {
    setEditing(account);
    setForm(toForm(account));
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editing || !form) return;
    if (!form.name.trim()) {
      setEditError('Informe o nome da conta.');
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      setEditError('Informe o mês do saldo inicial.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/bank-accounts/${editing.id}`, {
        name: form.name.trim(),
        kind: form.kind,
        ...(showSpaces && { spaceId: form.spaceId === NO_SPACE ? null : form.spaceId }),
        initialBalance: form.negative ? -form.amount : form.amount,
        initialBalanceDate: form.month,
      });
      setEditing(null);
      await refresh();
    } catch (err) {
      setEditError(errorMessage(err, 'Não foi possível salvar a conta.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/bank-accounts/${deleteTarget.id}`);
      setDeleteTarget(null);
      // Lançamentos ligados ficam sem conta: atualiza listas e fluxo.
      await queryClient.invalidateQueries();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card id="contas" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="icon-chip bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
            <Landmark className="h-4 w-4" aria-hidden />
          </div>
          Contas e carteiras
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Informe o saldo inicial e ligue receitas e despesas a uma conta: o saldo atual é calculado sozinho.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <Input
            placeholder="Ex: Nubank, Itaú, Dinheiro, VR"
            value={newName}
            maxLength={60}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Nome da nova conta"
          />
          <Button type="submit" disabled={adding} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </form>
        {addError && <p className="text-xs text-red-500">{addError}</p>}

        {isLoading ? null : accounts && accounts.length > 0 ? (
          <>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
              {accounts.map((account) => {
                const meta = KIND_META[account.kind] ?? KIND_META.bank;
                const Icon = meta.icon;
                const space = showSpaces ? spaceName(account.spaceId) : undefined;
                const projectedDiffers = account.projectedBalance !== account.currentBalance;
                return (
                  <li key={account.id} className="flex min-h-[64px] items-center gap-3 px-3 py-2">
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900 dark:text-white">{account.name}</p>
                        <p className="truncate text-xs text-slate-400">
                          {meta.label}
                          {space ? ` · ${space}` : ''}
                          {' · '}
                          {account.linkedCount === 1 ? '1 lançamento' : `${account.linkedCount} lançamentos`}
                        </p>
                      </div>
                      <div className="sm:shrink-0 sm:text-right">
                        <p
                          className={cn(
                            'text-sm font-semibold tabular-nums',
                            (account.currentBalance ?? 0) < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white',
                          )}
                        >
                          {formatCurrency(account.currentBalance ?? 0)}
                        </p>
                        {projectedDiffers && account.projectedUntil && (
                          <p className="text-[11px] tabular-nums text-slate-400">
                            previsto {formatCurrency(account.projectedBalance)} em{' '}
                            {SHORT_MONTHS[account.projectedUntil.month - 1]}/{String(account.projectedUntil.year).slice(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" aria-label={`Editar ${account.name}`} onClick={() => openEdit(account)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remover ${account.name}`}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => setDeleteTarget(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
            {accounts.length > 1 && (
              <div className="flex items-center justify-between px-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Saldo somado hoje</span>
                <span className={cn('font-semibold tabular-nums', total < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white')}>
                  {formatCurrency(total)}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Saldo atual = saldo inicial + o que entrou − o que saiu na conta até hoje. Lançamentos sem conta não mexem em nenhum saldo.
            </p>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
            Nenhuma conta ainda. Você também pode criar uma direto no formulário de um lançamento.
          </p>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
            <DialogDescription>O saldo inicial vale a partir do começo do mês escolhido.</DialogDescription>
          </DialogHeader>
          {form && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void saveEdit();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="account-name">Nome</Label>
                <Input
                  id="account-name"
                  value={form.name}
                  maxLength={60}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className={cn('grid gap-3', showSpaces && 'sm:grid-cols-2')}>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as AccountKind })}>
                    <SelectTrigger aria-label="Tipo da conta">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_KIND_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showSpaces && (
                  <div className="space-y-1.5">
                    <Label>Espaço</Label>
                    <Select value={form.spaceId} onValueChange={(v) => setForm({ ...form, spaceId: v })}>
                      <SelectTrigger aria-label="Espaço da conta">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SPACE}>Sem espaço</SelectItem>
                        {spaces.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="account-initial">Saldo inicial</Label>
                  <CurrencyInput
                    id="account-initial"
                    value={form.amount}
                    onChange={(v) => setForm({ ...form, amount: v })}
                    placeholder="0,00"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Checkbox checked={form.negative} onCheckedChange={(v) => setForm({ ...form, negative: !!v })} />
                    Saldo negativo (cheque especial)
                  </label>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-month">A partir de</Label>
                  <Input
                    id="account-month"
                    type="month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                  />
                </div>
              </div>
              {editError && <p className="text-xs text-red-500">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover conta</DialogTitle>
            <DialogDescription>
              Remover <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteTarget?.name}</span>?
              {deleteTarget && deleteTarget.linkedCount > 0
                ? ` Os ${deleteTarget.linkedCount} lançamentos ligados continuam salvos, só ficam sem conta.`
                : ' Nenhum lançamento é apagado.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Removendo…' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
