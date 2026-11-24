'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCurrencyInput, CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import type { IncomeEntry, MonthBudget } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterCategories, useCategories } from '@/hooks/use-categories';
import {
  Plus, Pencil, Trash2, Target, ChevronDown, ChevronUp,
  RotateCcw, Save, TrendingUp,
} from 'lucide-react';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';

const NEW_CATEGORY = '__new__';

const templateSchema = z
  .object({
    categoryId: z.string().optional(),
    name: z.string().optional(),
    defaultLimit: z.coerce.number().nonnegative('Informe um valor válido'),
  })
  .refine((v) => (v.categoryId && v.categoryId !== NEW_CATEGORY) || (v.name ?? '').trim().length > 0, {
    message: 'Escolha a categoria ou informe um nome',
    path: ['name'],
  });

const steps = [
  {
    n: '1',
    title: 'Escolha a categoria',
    body: 'Defina o máximo que quer gastar por mês numa categoria. Ex.: Alimentação, R$ 1.200.',
  },
  {
    n: '2',
    title: 'Vincule a despesa',
    body: 'Em Despesas, escolha a categoria no lançamento. Sem isso, o valor não entra aqui.',
  },
  {
    n: '3',
    title: 'Acompanhe a barra',
    body: 'Verde está folgado, âmbar está perto do teto e vermelho passou do limite.',
  },
];

function budgetStatus(budget: MonthBudget) {
  if (budget.limit <= 0) {
    return {
      label: 'Sem limite',
      bar: '[&>div]:bg-slate-400',
      text: 'text-slate-500 dark:text-slate-400',
      chip: 'bg-slate-500/10 text-slate-500 dark:bg-white/10 dark:text-slate-300',
      badge: 'bg-slate-500/10 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    };
  }
  if (budget.overBudget) {
    return {
      label: 'Estourou',
      bar: '[&>div]:bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      chip: 'bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400',
      badge: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    };
  }
  if (budget.progress >= 85) {
    return {
      label: 'Quase no limite',
      bar: '[&>div]:bg-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
      chip: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    };
  }
  if (budget.spent <= 0) {
    return {
      label: 'Sem gastos',
      bar: '[&>div]:bg-emerald-500',
      text: 'text-slate-500 dark:text-slate-400',
      chip: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      badge: 'bg-slate-500/10 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    };
  }
  return {
    label: 'Dentro do limite',
    bar: '[&>div]:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  };
}

function remainingCopy(budget: MonthBudget) {
  if (budget.limit <= 0) return 'Defina um limite para esta categoria.';
  if (budget.spent <= 0) return 'Nenhuma despesa contou aqui ainda.';
  if (budget.remaining >= 0) return `Ainda pode gastar ${formatCurrency(budget.remaining)}`;
  return `Passou ${formatCurrency(Math.abs(budget.remaining))} do limite`;
}

function MonthLimitEditor({
  budget,
  monthId,
  onSaved,
}: {
  budget: MonthBudget;
  monthId: string;
  onSaved: () => void;
}) {
  const [limit, setLimit] = useState(budget.limit);
  const [saving, setSaving] = useState(false);
  const isDirty = limit !== budget.limit;

  return (
    <div className="space-y-2 pt-4">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Limite só deste mês</p>
      <p className="text-xs leading-relaxed text-slate-500">
        Vale apenas para o mês selecionado. O padrão dos outros meses continua {formatCurrency(budget.defaultLimit)}.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CurrencyInput value={limit} onChange={setLimit} placeholder="0,00" />
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-400"
              onClick={() => setLimit(budget.limit)}
              aria-label="Desfazer alteração"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!isDirty || saving}
            className="flex-1 sm:flex-none sm:shrink-0"
            onClick={async () => {
              setSaving(true);
              await api.put(
                `/months/${monthId}/budgets/${budget.templateId}/limit`,
                { limitAmount: limit },
              );
              setSaving(false);
              onSaved();
            }}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({
  budget,
  isMonthOpen,
  selectedMonthId,
  onEdit,
  onDelete,
  onLimitSaved,
}: {
  budget: MonthBudget;
  isMonthOpen: boolean;
  selectedMonthId: string | null;
  onEdit: (b: MonthBudget) => void;
  onDelete: (b: MonthBudget) => void;
  onLimitSaved: () => void;
}) {
  const [showExpenses, setShowExpenses] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const status = budgetStatus(budget);
  const adjusted = budget.limit !== budget.defaultLimit;
  const expenseCount = budget.entries.length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn('icon-chip', status.chip)}>
              <Target className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-snug text-slate-800 dark:text-slate-100">
                {budget.name}
              </p>
              <p className="mt-0.5 text-xs leading-4 text-slate-500">
                {expenseCount === 0
                  ? 'Nenhuma despesa vinculada'
                  : `${expenseCount} ${expenseCount === 1 ? 'despesa contando' : 'despesas contando'} neste mês`}
                {adjusted && ` · limite diferente do padrão`}
              </p>
            </div>
          </div>
          <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', status.badge)}>
            {status.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400">Gasto neste mês</p>
            <p className={cn('mt-0.5 text-lg font-bold tabular-nums', budget.overBudget ? status.text : 'text-slate-900 dark:text-white')}>
              {formatCurrency(budget.spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Limite</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(budget.limit)}
            </p>
          </div>
        </div>

        <Progress value={Math.min(budget.progress, 100)} className={cn('mt-3 h-2.5', status.bar)} />

        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
          <span className={cn('font-semibold tabular-nums', status.text)}>
            {budget.limit > 0 ? `${budget.progress.toFixed(0)}% do limite` : 'Limite não definido'}
          </span>
          <span className={cn('font-medium', status.text)}>{remainingCopy(budget)}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-white/[0.05] dark:hover:text-slate-200"
            onClick={() => setShowExpenses((open) => !open)}
          >
            {showExpenses ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expenseCount > 0 ? 'Ver gastos' : 'Por que está zerado'}
          </button>
          {isMonthOpen && selectedMonthId && (
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-white/[0.05] dark:hover:text-slate-200"
              onClick={() => setShowLimit((open) => !open)}
            >
              {showLimit ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Limite deste mês
            </button>
          )}
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-slate-300 hover:text-slate-600 sm:h-9 sm:w-9 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
              onClick={() => onEdit(budget)}
              aria-label={`Editar nome e limite padrão de ${budget.name}`}
              title="Editar nome e limite padrão"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-slate-300 hover:text-red-500 sm:h-9 sm:w-9 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-red-400"
              onClick={() => onDelete(budget)}
              aria-label={`Remover orçamento ${budget.name}`}
              title="Remover orçamento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {showExpenses && (
          <div className="mt-1 space-y-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Despesas que contam aqui
            </p>
            {expenseCount === 0 ? (
              <p className="text-sm leading-relaxed text-slate-500">
                Nenhuma despesa deste mês está ligada a {budget.name}. Ao lançar uma despesa, escolha esta categoria no campo Categoria.{' '}
                <Link href="/dashboard/despesas" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
                  Ir para despesas
                </Link>
              </p>
            ) : (
              budget.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-slate-600 dark:text-slate-300">{entry.name}</span>
                  <span className="shrink-0 font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {showLimit && isMonthOpen && selectedMonthId && (
          <div className="border-t border-slate-100 dark:border-white/[0.06]">
            <MonthLimitEditor
              key={budget.limit}
              budget={budget}
              monthId={selectedMonthId}
              onSaved={onLimitSaved}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HowBudgetsWork({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Como usar</p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {step.n}
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.body}</p>
            </li>
          ))}
        </ol>
        <Button onClick={onCreate} className="mt-5 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Criar primeiro orçamento
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OrcamentosPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const queryClient = useQueryClient();

  const [templateDialog, setTemplateDialog] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MonthBudget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', selectedMonthId],
    queryFn: () => api.get<MonthBudget[]>(`/months/${selectedMonthId}/budgets`),
    enabled: !!selectedMonthId,
  });

  const { data: incomes, isLoading: incomesLoading } = useQuery({
    queryKey: ['incomes', selectedMonthId],
    queryFn: () => api.get<IncomeEntry[]>(`/months/${selectedMonthId}/incomes`),
    enabled: !!selectedMonthId,
  });

  const { data: categories } = useCategories();
  const templateForm = useForm({ resolver: zodResolver(templateSchema) });
  // Categorias de despesa PF ainda sem limite: candidatas a virar orçamento.
  const budgetIds = new Set((budgets ?? []).filter((b) => b.hasLimit !== false).map((b) => b.templateId));
  const categoriesWithoutLimit = filterCategories(categories, 'expense', 'personal').filter((c) => !budgetIds.has(c.id));
  const selectedCategoryId = useWatch({ control: templateForm.control, name: 'categoryId' }) as string | undefined;
  const invalidate = () => queryClient.invalidateQueries();

  const openCreateTemplate = () => {
    setEditTemplateId(null);
    templateForm.reset({ categoryId: categoriesWithoutLimit[0]?.id ?? NEW_CATEGORY, name: '', defaultLimit: 0 });
    setTemplateDialog(true);
  };

  const openSetLimit = (budget: MonthBudget) => {
    setEditTemplateId(null);
    templateForm.reset({ categoryId: budget.templateId, name: '', defaultLimit: 0 });
    setTemplateDialog(true);
  };

  const openEditTemplate = (budget: MonthBudget) => {
    setEditTemplateId(budget.templateId);
    templateForm.reset({ categoryId: budget.templateId, name: budget.name, defaultLimit: budget.defaultLimit });
    setTemplateDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // Tirar o orçamento = zerar o limite. A categoria continua (e as despesas ligadas a ela).
    await api.patch(`/categories/${deleteTarget.templateId}`, { defaultLimit: 0 });
    if (isMonthOpen && selectedMonthId) {
      await api.put(`/months/${selectedMonthId}/budgets/${deleteTarget.templateId}/limit`, { limitAmount: 0 });
    }
    setDeleting(false);
    setDeleteTarget(null);
    invalidate();
  };

  // Orçamento = categoria com limite. Sem limite e com gasto aparece à parte, para o usuário definir um teto.
  const limitedBudgets = (budgets ?? []).filter((b) => b.hasLimit !== false);
  const unlimitedWithSpending = (budgets ?? []).filter((b) => b.hasLimit === false && b.spent > 0);
  const sortedBudgets = budgets
    ? [...limitedBudgets].sort((a, b) => {
        if (a.overBudget !== b.overBudget) return a.overBudget ? -1 : 1;
        return b.progress - a.progress;
      })
    : [];

  const totalLimit = limitedBudgets.reduce((s, b) => s + b.limit, 0);
  const totalIncome = incomes?.reduce((sum, income) => sum + Number(income.amount), 0) ?? 0;
  const incomeLeft = totalIncome - totalLimit;
  const overCount = sortedBudgets.filter((budget) => budget.overBudget).length;
  const pageLoading = !selectedMonthId || isLoading || incomesLoading;
  const nothingCounted = sortedBudgets.length > 0 && sortedBudgets.every((budget) => budget.entries.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Orçamentos
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Um teto de gasto por categoria. As despesas lançadas na categoria somam aqui e mostram o que ainda cabe no mês.{' '}
            <Link href="/dashboard/categorias" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
              Gerenciar categorias
            </Link>
          </p>
        </div>
        <Button onClick={openCreateTemplate} size="sm" className="h-11 w-full sm:h-9 sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo orçamento
        </Button>
      </div>

      <BabyStepPageHint pageKey="orcamentos" />

      {selectedMonth?.status === 'closed' && (
        <p className="text-sm text-slate-500">
          Este mês está fechado. Dá para consultar os gastos, sem alterar os limites.
        </p>
      )}

      {pageLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      )}

      {!pageLoading && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              Receitas do mês
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalIncome)}
            </p>
            {totalIncome === 0 && (
              <Link href="/dashboard/receitas" className="mt-1 inline-block text-xs font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
                Cadastrar receitas
              </Link>
            )}
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Target className="h-3.5 w-3.5" />
              Orçamentos planejados
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalLimit)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-500">
              {incomeLeft < 0 ? 'Acima da receita' : 'Sobra da receita'}
            </p>
            <p className={cn(
              'mt-2 text-2xl font-bold tabular-nums tracking-tight',
              incomeLeft < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
            )}>
              {formatCurrency(Math.abs(incomeLeft))}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Receitas menos os limites planejados
            </p>
          </Card>
        </div>
      )}

      {!pageLoading && sortedBudgets.length === 0 && (
        <HowBudgetsWork onCreate={openCreateTemplate} />
      )}

      {!pageLoading && sortedBudgets.length > 0 && (
        <>
          {overCount > 0 && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {overCount} {overCount === 1 ? 'categoria estourou' : 'categorias estouraram'} o limite neste mês.
            </p>
          )}

          {nothingCounted && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              Os tetos já existem, mas nenhuma despesa entrou na conta. Ao lançar uma despesa, selecione a categoria no campo Categoria.{' '}
              <Link href="/dashboard/despesas" className="font-semibold underline underline-offset-2">
                Abrir despesas
              </Link>
            </div>
          )}

          <div className="grid items-start gap-4 sm:grid-cols-2">
            {sortedBudgets.map((budget) => (
              <BudgetCard
                key={budget.templateId}
                budget={budget}
                isMonthOpen={!!isMonthOpen}
                selectedMonthId={selectedMonthId ?? null}
                onEdit={openEditTemplate}
                onDelete={setDeleteTarget}
                onLimitSaved={invalidate}
              />
            ))}
          </div>
        </>
      )}

      {!pageLoading && unlimitedWithSpending.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Gastos em categorias sem limite</p>
            <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/[0.06]">
              {unlimitedWithSpending.map((b) => (
                <li key={b.templateId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="truncate text-slate-700 dark:text-slate-300">{b.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">{formatCurrency(b.spent)}</span>
                    {!b.archived && (
                      <Button size="sm" variant="ghost" onClick={() => openSetLimit(b)}>
                        Definir limite
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTemplateId ? 'Editar orçamento' : 'Novo orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editTemplateId
                ? 'O nome e o limite padrão valem para os meses seguintes. O mês atual pode ter um limite diferente.'
                : 'Escolha a categoria e quanto pode gastar por mês. As despesas lançadas nela passam a contar aqui.'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={templateForm.handleSubmit(async (data) => {
              if (editTemplateId) {
                await api.patch(`/categories/${editTemplateId}`, { name: data.name, defaultLimit: data.defaultLimit });
              } else if (data.categoryId && data.categoryId !== NEW_CATEGORY) {
                await api.patch(`/categories/${data.categoryId}`, { defaultLimit: data.defaultLimit });
                if (isMonthOpen && selectedMonthId) {
                  await api.put(`/months/${selectedMonthId}/budgets/${data.categoryId}/limit`, { limitAmount: data.defaultLimit });
                }
              } else {
                await api.post('/budget-templates', { name: (data.name ?? '').trim(), defaultLimit: data.defaultLimit });
              }
              invalidate();
              setTemplateDialog(false);
              templateForm.reset();
            })}
            className="space-y-4"
          >
            {!editTemplateId && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={selectedCategoryId ?? NEW_CATEGORY}
                  onValueChange={(v) => templateForm.setValue('categoryId', v)}
                >
                  <SelectTrigger aria-label="Categoria">
                    <SelectValue placeholder="Escolha a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesWithoutLimit.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    <SelectItem value={NEW_CATEGORY}>+ Nova categoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className={cn('space-y-2', !editTemplateId && selectedCategoryId !== NEW_CATEGORY && 'hidden')}>
              <Label htmlFor="budget-name">{editTemplateId ? 'Nome da categoria' : 'Nome da nova categoria'}</Label>
              <Input
                id="budget-name"
                placeholder="Ex.: Pets, Viagens"
                {...templateForm.register('name')}
              />
              {templateForm.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {templateForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Quanto pode gastar por mês</Label>
              <FormCurrencyInput
                control={templateForm.control}
                name="defaultLimit"
                placeholder="0,00"
              />
              <p className="text-xs text-slate-500">
                Esse é o limite padrão. Dá para ajustar só o mês atual depois, sem mudar os outros.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTemplateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editTemplateId ? 'Salvar' : 'Criar orçamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tirar o orçamento</DialogTitle>
            <DialogDescription>
              Tirar o limite de{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteTarget?.name}
              </span>
              ? A categoria continua existindo com as despesas ligadas a ela; só deixa de ter teto de gasto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Tirando…' : 'Tirar limite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
