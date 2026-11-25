'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Check, ChevronDown, Loader2, Pencil, Plus, Sparkles, Tags, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { useActiveSpaces, useEffectiveSpace, useSelectedSpace } from '@/hooks/use-spaces';
import {
  useAddDefaultCategories,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useInvalidateCategories,
  useUpdateCategory,
} from '@/hooks/use-categories';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { ApiError, api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import type { Category, CategoryKind, FinanceScope, IncomeEntry, MonthBudget } from '@/types';

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Algo deu errado. Tente de novo.';
}

function CategoryRow({
  category,
  limitLabel,
  budget,
  monthId,
  isMonthOpen,
}: {
  category: Category;
  limitLabel: string;
  budget?: MonthBudget;
  monthId?: string;
  isMonthOpen: boolean;
}) {
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const invalidate = useInvalidateCategories();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [limit, setLimit] = useState(category.defaultLimit);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showMonth, setShowMonth] = useState(false);
  const [monthLimit, setMonthLimit] = useState(budget?.limit ?? category.defaultLimit);
  useEffect(() => {
    if (!showMonth && budget) setMonthLimit(budget.limit);
  }, [budget, showMonth]);
  const [savingMonth, setSavingMonth] = useState(false);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: category.id,
        ...(name.trim() !== category.name && { name: name.trim() }),
        ...(category.kind === 'expense' && limit !== category.defaultLimit && { defaultLimit: limit }),
      });
      const monthWasCustom = !!budget && budget.limit !== category.defaultLimit;
      if (
        category.kind === 'expense' &&
        monthId &&
        isMonthOpen &&
        !monthWasCustom &&
        limit !== category.defaultLimit
      ) {
        await api.put(`/months/${monthId}/budgets/${category.id}/limit`, { limitAmount: limit });
        await invalidate();
      }
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
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{category.name}</p>
          {category.kind === 'expense' && category.defaultLimit > 0 && (
            <p className="text-xs text-slate-500">
              {limitLabel}: {formatCurrency(category.defaultLimit)}/mês
              {budget && budget.limit !== category.defaultLimit ? ` · este mês ${formatCurrency(budget.limit)}` : ''}
            </p>
          )}
          {budget && category.kind === 'expense' && (
            <div className="mt-1.5 space-y-1">
              <Progress
                value={budget.limit > 0 ? Math.min(budget.progress, 100) : 0}
                className={cn(
                  'h-1.5',
                  budget.overBudget && '[&>div]:bg-red-500',
                  !budget.overBudget && budget.progress >= 85 && budget.limit > 0 && '[&>div]:bg-amber-400',
                )}
              />
              <p className="text-xs text-slate-500">
                {formatCurrency(budget.spent)} neste mês
                {budget.limit > 0 ? ` de ${formatCurrency(budget.limit)}` : ''}
                {budget.entries.length > 0
                  ? ` · ${budget.entries.length} ${budget.entries.length === 1 ? 'lançamento' : 'lançamentos'}`
                  : ''}
              </p>
            </div>
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
      {category.kind === 'expense' && isMonthOpen && monthId && (
        <div className="mt-1">
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            onClick={() => setShowMonth((open) => !open)}
          >
            Limite só deste mês
          </button>
          {showMonth && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CurrencyInput
                value={monthLimit}
                onChange={setMonthLimit}
                aria-label={`Limite de ${category.name} neste mês`}
                className="w-full sm:w-36"
              />
              <Button
                size="sm"
                disabled={savingMonth}
                onClick={async () => {
                  setSavingMonth(true);
                  setError(null);
                  try {
                    await api.put(`/months/${monthId}/budgets/${category.id}/limit`, { limitAmount: monthLimit });
                    await invalidate();
                    setShowMonth(false);
                  } catch (err) {
                    setError(errorMessage(err));
                  } finally {
                    setSavingMonth(false);
                  }
                }}
              >
                {savingMonth ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function AddCategory({ kind, scope, spaceId }: { kind: CategoryKind; scope: FinanceScope; spaceId?: string }) {
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      await create.mutateAsync({
        name: name.trim(),
        kind,
        ...(spaceId ? { spaceId } : { scope }),
        ...(kind === 'expense' && limit > 0 && { defaultLimit: limit }),
      });
      setName('');
      setLimit(0);
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
        {kind === 'expense' && (
          <CurrencyInput
            value={limit}
            onChange={setLimit}
            aria-label="Limite mensal"
            placeholder="Sem limite"
            className="w-full shrink-0 sm:w-36"
          />
        )}
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
  budgets,
  monthId,
  isMonthOpen,
}: {
  title: string;
  kind: CategoryKind;
  scope: FinanceScope;
  spaceId?: string;
  items: Category[];
  limitLabel: string;
  budgets: Map<string, MonthBudget>;
  monthId?: string;
  isMonthOpen: boolean;
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
              <CategoryRow
                key={c.id}
                category={c}
                limitLabel={limitLabel}
                budget={budgets.get(c.id)}
                monthId={monthId}
                isMonthOpen={isMonthOpen}
              />
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
  const headerSpace = useSelectedSpace();
  const [pickedSpaceId, setPickedSpaceId] = useState<string | undefined>(undefined);
  const space = useEffectiveSpace(pickedSpaceId);
  const activeScope: FinanceScope = space?.kind ?? 'personal';
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const isMonthOpen = months?.find((m) => m.id === selectedMonthId)?.status === 'open';
  const { data, isPending } = useCategories({ spaceId: space?.id, includeArchived: true, enabled: !!space });
  const { data: budgets } = useQuery({
    queryKey: ['budgets', selectedMonthId, space?.id ?? 'all'],
    queryFn: () => api.get<MonthBudget[]>(`/months/${selectedMonthId}/budgets?spaceId=${space!.id}`),
    enabled: !!selectedMonthId && !!space,
  });
  const { data: incomes } = useQuery({
    queryKey: ['incomes', selectedMonthId],
    queryFn: () => api.get<IncomeEntry[]>(`/months/${selectedMonthId}/incomes`),
    enabled: !!selectedMonthId,
  });
  const addDefaults = useAddDefaultCategories();
  const update = useUpdateCategory();
  const [showArchived, setShowArchived] = useState(false);
  const [defaultsMessage, setDefaultsMessage] = useState<string | null>(null);
  const budgetById = new Map((budgets ?? []).map((b) => [b.templateId, b]));
  const withLimit = (budgets ?? []).filter((b) => b.hasLimit !== false);
  const totalLimit = withLimit.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = withLimit.reduce((sum, b) => sum + b.spent, 0);
  const incomesMatchSpace = !headerSpace || headerSpace.id === space?.id;
  const totalIncome = incomesMatchSpace
    ? (incomes ?? []).filter((income) => !space || income.spaceId === space.id).reduce((sum, income) => sum + Number(income.amount), 0)
    : null;

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
            Organize receitas e despesas. O limite de uma categoria de despesa é o teto do mês — a barra mostra o que já foi usado.
            Renomear muda todos os lançamentos ligados a ela.
          </p>
          <div className="mt-3">
            <BabyStepPageHint pageKey="orcamentos" />
          </div>
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

      {!isPending && withLimit.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-500">Gasto nas categorias com limite</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</p>
            <p className="mt-1 text-xs text-slate-400">de {formatCurrency(totalLimit)} neste mês</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-500">Receitas do mês</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {totalIncome == null ? '—' : formatCurrency(totalIncome)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-500">
              {totalIncome != null && totalIncome - totalLimit < 0 ? 'Acima da receita' : 'Sobra da receita'}
            </p>
            <p className={cn('mt-2 text-2xl font-bold tabular-nums', totalIncome != null && totalIncome - totalLimit < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400')}>
              {totalIncome == null ? '—' : formatCurrency(Math.abs(totalIncome - totalLimit))}
            </p>
            <p className="mt-1 text-xs text-slate-400">Receitas menos os limites</p>
          </Card>
        </div>
      )}

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
              budgets={budgetById}
              monthId={selectedMonthId ?? undefined}
              isMonthOpen={!!isMonthOpen}
            />
            <CategoryGroup
              title="Receitas"
              kind="income"
              scope={activeScope}
              spaceId={space?.id}
              items={active.filter((c) => c.kind === 'income')}
              limitLabel={limitLabel}
              budgets={budgetById}
              monthId={selectedMonthId ?? undefined}
              isMonthOpen={!!isMonthOpen}
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
