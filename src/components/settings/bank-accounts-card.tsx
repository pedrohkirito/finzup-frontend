'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Landmark, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { BANK_ACCOUNTS_QUERY_KEY, useBankAccounts } from '@/hooks/use-bank-accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BankAccount } from '@/types';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

/** Contas bancárias do usuário (só o nome). Ligar lançamentos a uma conta é opcional. */
export function BankAccountsCard() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useBankAccounts();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });

  const add = async () => {
    if (!newName.trim()) {
      setAddError('Informe o nome da conta.');
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await api.post('/bank-accounts', { name: newName.trim() });
      setNewName('');
      await refresh();
    } catch (err) {
      setAddError(errorMessage(err, 'Não foi possível criar a conta.'));
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) {
      setEditError('Informe o nome da conta.');
      return;
    }
    try {
      await api.patch(`/bank-accounts/${id}`, { name: editName.trim() });
      setEditingId(null);
      setEditError(null);
      await refresh();
    } catch (err) {
      setEditError(errorMessage(err, 'Não foi possível renomear a conta.'));
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
          Contas bancárias
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Opcional. Ligue receitas e despesas a uma conta para ver o fluxo de caixa de cada uma.
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
            placeholder="Ex: Nubank, Itaú, Inter PJ"
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
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
            {accounts.map((account) => (
              <li key={account.id} className="flex min-h-[56px] items-center gap-3 px-3 py-2">
                {editingId === account.id ? (
                  <form
                    className="flex flex-1 flex-col gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveEdit(account.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={editName}
                        maxLength={60}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                        aria-label="Novo nome da conta"
                      />
                      <Button type="submit" size="icon" variant="ghost" aria-label="Salvar nome">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Cancelar"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {editError && <p className="text-xs text-red-500">{editError}</p>}
                  </form>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900 dark:text-white">{account.name}</p>
                      <p className="text-xs text-slate-400">
                        {account.linkedCount === 0
                          ? 'Nenhum lançamento ligado'
                          : account.linkedCount === 1
                            ? '1 lançamento ligado'
                            : `${account.linkedCount} lançamentos ligados`}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Renomear ${account.name}`}
                      onClick={() => {
                        setEditingId(account.id);
                        setEditName(account.name);
                        setEditError(null);
                      }}
                    >
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
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={cn('rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:text-slate-400')}>
            Nenhuma conta ainda. Você também pode criar uma direto no formulário de um lançamento.
          </p>
        )}
      </CardContent>

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
