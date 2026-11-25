'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, Check, ChevronDown, Loader2, Pencil, Plus, Sparkles, Tags, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActiveSpaces, useEffectiveSpace } from '@/hooks/use-spaces';
import {
  useAddDefaultCategories,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/use-categories';
import { ApiError } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import type { Category, CategoryKind, FinanceScope } from '@/types';

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Algo deu errado. Tente de novo.';
}

function CategoryRow({ category, limitLabel }: { category: Category; limitLabel: string }) {
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [limit, setLimit] = useState(category.defaultLimit);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: category.id,
        ...(name.trim() !== category.name && { name: name.trim() }),
        ...(category.kind === 'expense' && limit !== category.defaultLimit && { defaultLimit: limit }),
      });
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const archiveOrDelete = async () => {
    setError(null);
    try {
      const result = await remove.mutateAsync(category.id);
      if (result.archived) setNotice(result.message);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (editing) {
    return (
      <li className="space-y-2 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void save()}
            aria-label="Nome da categoria"
            className="min-w-0 flex-1 basis-full sm:basis-[min(100%,12rem)]"
          />
          {category.kind === 'expense' && (
            <CurrencyInput
              value={limit}
              onChange={setLimit}
              aria-label={limitLabel}
              placeholder="Sem limite"
              className="w-full shrink-0 sm:w-40"
            />
          )}
          <div className="flex shrink-0 gap-2">
            <Button size="sm" onClick={save} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setName(category.name);
                setLimit(category.defaultLimit);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {category.kind === 'expense' && (
          <p className="text-xs text-slate-500">{limitLabel} mensal. Deixe em R$ 0,00 para só acompanhar o gasto.</p>
        )}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </li>
    );
  }

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{category.name}</p>
          {category.kind === 'expense' && category.defaultLimit > 0 && (
            <p className="text-xs text-slate-500">
              {limitLabel}: {formatCurrency(category.defaultLimit)}/mês
            </p>
          )}
        </div>
        {category.isDefault && (
          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 sm:inline dark:bg-white/[0.06] dark:text-slate-400">
            Padrão
          </span>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)} aria-label={`Editar ${category.name}`}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-slate-500 hover:text-red-600"
          onClick={archiveOrDelete}
          disabled={remove.isPending}
          aria-label={`Remover ${category.name}`}
          title="Remover (se já tiver lançamentos, a categoria é arquivada)"
        >
          {remove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {(notice || error) && (
        <p className={cn('mt-1 text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-slate-500')}>{error ?? notice}</p>
      )}
    </li>
  );
}

function AddCategory({ kind, scope, spaceId }: { kind: CategoryKind; scope: FinanceScope; spaceId?: string }) {
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      await create.mutateAsync(spaceId ? { name: name.trim(), kind, spaceId } : { name: name.trim(), kind, scope });
      setName('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="pt-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={kind === 'income' ? 'Nova categoria de receita' : 'Nova categoria de despesa'}
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void submit()}
          className="min-w-0 flex-1 basis-full sm:basis-[min(100%,12rem)]"
        />
        <Button variant="outline" onClick={submit} disabled={create.isPending || !name.trim()} className="shrink-0">
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="hidden sm:inline">Adicionar</span>
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function CategoryGroup({
  title,
  kind,
  scope,
  spaceId,
  items,
  limitLabel,
}: {
  title: string;
  kind: CategoryKind;
  scope: FinanceScope;
  spaceId?: string;
  items: Category[];
  limitLabel: string;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-slate-500">Nenhuma categoria ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {items.map((c) => (
              <CategoryRow key={c.id} category={c} limitLabel={limitLabel} />
            ))}
          </ul>
        )}
        <AddCategory kind={kind} scope={scope} spaceId={spaceId} />
      </CardContent>
    </Card>
  );
}

export default function CategoriasPage() {
  const { spaces, businesses } = useActiveSpaces();
  const [pickedSpaceId, setPickedSpaceId] = useState<string | undefined>(undefined);
  const space = useEffectiveSpace(pickedSpaceId);
  const activeScope: FinanceScope = space?.kind ?? 'personal';
  const { data, isPending } = useCategories({ spaceId: space?.id, includeArchived: true, enabled: !!space });
  const addDefaults = useAddDefaultCategories();
  const update = useUpdateCategory();
  const [showArchived, setShowArchived] = useState(false);
  const [defaultsMessage, setDefaultsMessage] = useState<string | null>(null);

  const active = (data ?? []).filter((c) => !c.archived);
  const archived = (data ?? []).filter((c) => c.archived);
  const limitLabel = activeScope === 'business' ? 'Limite de gasto' : 'Orçamento';

  const handleDefaults = async () => {
    setDefaultsMessage(null);
    try {
      const result = await addDefaults.mutateAsync(space ? { spaceId: space.id } : { scope: activeScope });
      setDefaultsMessage(
        result.created > 0
          ? `${result.created} categoria${result.created === 1 ? '' : 's'} padrão adicionada${result.created === 1 ? '' : 's'}.`
          : 'Você já tem todas as categorias padrão.',
      );
    } catch (err) {
      setDefaultsMessage(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Tags className="h-6 w-6 text-brand-500" aria-hidden /> Categorias
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Organize receitas e despesas. Renomear uma categoria muda todos os lançamentos ligados a ela.{' '}
            <Link href="/dashboard/orcamentos" className="text-brand-600 hover:underline dark:text-brand-300">
              Ver {activeScope === 'business' ? 'limites de gasto' : 'orçamentos'}
            </Link>
          </p>
        </div>
        {businesses.length > 0 && space && (
          <Select value={space.id} onValueChange={setPickedSpaceId}>
            <SelectTrigger aria-label="Espaço" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {spaces.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.kind === 'personal' ? `${sp.name} (PF)` : sp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <CategoryGroup
              title="Despesas"
              kind="expense"
              scope={activeScope}
              spaceId={space?.id}
              items={active.filter((c) => c.kind === 'expense')}
              limitLabel={limitLabel}
            />
            <CategoryGroup
              title="Receitas"
              kind="income"
              scope={activeScope}
              spaceId={space?.id}
              items={active.filter((c) => c.kind === 'income')}
              limitLabel={limitLabel}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.1]">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Categorias padrão {activeScope === 'business' ? `da empresa${space ? ` ${space.name}` : ''}` : 'pessoais'}</p>
              <p className="text-xs text-slate-500">
                Adiciona só as que faltam. {defaultsMessage && <span className="text-brand-600 dark:text-brand-300">{defaultsMessage}</span>}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDefaults} disabled={addDefaults.isPending}>
              {addDefaults.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Adicionar categorias padrão
            </Button>
          </div>

          {archived.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                aria-expanded={showArchived}
              >
                <ChevronDown className={cn('h-4 w-4 transition-transform', showArchived && 'rotate-180')} />
                Arquivadas ({archived.length})
              </button>
              {showArchived && (
                <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 dark:divide-white/[0.06] dark:border-white/[0.08]">
                  {archived.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 py-2.5">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {c.name} <span className="text-xs">· {c.kind === 'income' ? 'receita' : 'despesa'}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => update.mutate({ id: c.id, archived: false })}
                        disabled={update.isPending}
                      >
                        <ArchiveRestore className="h-4 w-4" /> Reativar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
