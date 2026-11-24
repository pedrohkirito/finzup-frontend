'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore, Building2, Check, Loader2, Lock, Pencil, Plus, Trash2, User, X } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatCnpj, useCreateSpace, useDeleteSpace, useSpaceSelection, useSpaces, useUpdateSpace } from '@/hooks/use-spaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import type { Space } from '@/types';

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente de novo.';
}

function SpaceRow({ space }: { space: Space }) {
  const update = useUpdateSpace();
  const remove = useDeleteSpace();
  const [selection, setSelection] = useSpaceSelection();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(space.name);
  const [cnpj, setCnpj] = useState(formatCnpj(space.cnpj));
  const [error, setError] = useState<string | null>(null);
  const isBusiness = space.kind === 'business';

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({ id: space.id, name: name.trim(), ...(isBusiness && { cnpj: cnpj.trim() || null }) });
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const toggleArchive = async () => {
    setError(null);
    try {
      await update.mutateAsync({ id: space.id, archived: !space.archived });
      if (!space.archived && selection === space.id) setSelection('all');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const destroy = async () => {
    if (!window.confirm(`Excluir a empresa "${space.name}"? Só dá para excluir empresas sem lançamentos.`)) return;
    setError(null);
    try {
      await remove.mutateAsync(space.id);
      if (selection === space.id) setSelection('all');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <li className={cn('py-3', space.archived && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'icon-chip h-9 w-9 shrink-0',
            isBusiness ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          )}
        >
          {isBusiness ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_12rem_auto]">
              <Input aria-label="Nome" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoFocus />
              {isBusiness && (
                <Input aria-label="CNPJ" placeholder="CNPJ (opcional)" value={cnpj} maxLength={18} onChange={(e) => setCnpj(e.target.value)} />
              )}
              <div className="flex gap-1">
                <Button size="icon" variant="outline" onClick={save} disabled={update.isPending || !name.trim()} aria-label="Salvar">
                  {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditing(false)} aria-label="Cancelar">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                {space.name}
                {space.locked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-300">
                    <Lock className="h-3 w-3" /> só leitura
                  </span>
                )}
                {space.archived && (
                  <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">arquivada</span>
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBusiness ? (space.cnpj ? `CNPJ ${formatCnpj(space.cnpj)}` : 'Empresa (PJ) · sem CNPJ') : 'Suas finanças pessoais (PF)'}
              </p>
            </>
          )}
          {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
        {!editing && (
          <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label={`Editar ${space.name}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            {isBusiness && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleArchive}
                  disabled={update.isPending}
                  aria-label={space.archived ? `Restaurar ${space.name}` : `Arquivar ${space.name}`}
                  title={space.archived ? 'Restaurar' : 'Arquivar (some do seletor, os dados ficam)'}
                >
                  {space.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={destroy} disabled={remove.isPending} aria-label={`Excluir ${space.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function NewCompany() {
  const create = useCreateSpace();
  const [, setSelection] = useSpaceSelection();
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      const created = await create.mutateAsync({ name: name.trim(), cnpj: cnpj.trim() || null });
      setName('');
      setCnpj('');
      setSelection(created.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Nome da empresa</Label>
          <Input id="companyName" placeholder="Ex: Padaria Silva" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="companyCnpj">CNPJ (opcional)</Label>
          <Input id="companyCnpj" placeholder="00.000.000/0000-00" value={cnpj} maxLength={18} onChange={(e) => setCnpj(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" disabled={create.isPending || !name.trim()}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Adicionar empresa
      </Button>
    </form>
  );
}

export default function EmpresasPage() {
  const { data, isPending } = useSpaces({ includeArchived: true });
  const spaces = data?.spaces ?? [];
  const activeCompanies = spaces.filter((s) => s.kind === 'business' && !s.archived && !s.grandfathered).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Building2 className="h-6 w-6 text-brand-500" aria-hidden /> Empresas
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Separe o dinheiro de cada empresa do seu. Cada empresa tem seus lançamentos, categorias e limites de gasto; troque de espaço no
          seletor do topo ou veja tudo junto na visão consolidada.
        </p>
      </div>

      {isPending ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Seus espaços</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {spaces.map((s) => (
                  <SpaceRow key={`${s.id}:${s.name}:${s.cnpj ?? ''}`} space={s} />
                ))}
              </ul>
            </CardContent>
          </Card>

          {data?.canCreateBusiness ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nova empresa</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeCompanies} de {data.maxBusinessSpaces} empresas do seu plano.
                </p>
              </CardHeader>
              <CardContent>
                <NewCompany />
              </CardContent>
            </Card>
          ) : (
            <UpgradePrompt
              title={data && data.maxBusinessSpaces > 0 ? 'Limite de empresas do seu plano' : 'Empresas fazem parte do Dono App'}
              description={
                data && data.maxBusinessSpaces > 0
                  ? `Seu plano comporta ${data.maxBusinessSpaces} empresas ativas. Arquive uma ou fale com a gente para ampliar.`
                  : 'Separe até 3 empresas da sua vida pessoal, com pró-labore, limites de gasto e painel do dono.'
              }
            />
          )}
        </>
      )}
    </div>
  );
}
