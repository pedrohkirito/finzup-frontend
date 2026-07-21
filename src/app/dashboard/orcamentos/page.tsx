'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { MonthBudget } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, Target, ChevronDown, ChevronUp,
  RotateCcw, Save,
} from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';

const templateSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  defaultLimit: z.coerce.number().nonnegative('Informe um valor válido'),
});

function getProgressColor(progress: number, overBudget: boolean) {
  if (overBudget) return '[&>div]:bg-red-500';
  if (progress >= 85) return '[&>div]:bg-amber-400';
  if (progress >= 60) return '[&>div]:bg-blue-500';
  return '[&>div]:bg-emerald-500';
}

function getAmountColor(progress: number, overBudget: boolean) {
  if (overBudget) return 'text-red-500';
  if (progress >= 85) return 'text-amber-500';
  return 'text-slate-700 dark:text-slate-200';
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

  useEffect(() => {
    setLimit(budget.limit);
  }, [budget.limit]);

  return (
    <div className="pt-4 space-y-2">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Limite deste mês</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CurrencyInput value={limit} onChange={setLimit} placeholder="0,00" />
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              type="button" variant="ghost" size="icon"
              className="h-9 w-9 shrink-0 text-slate-400"
              onClick={() => setLimit(budget.limit)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button" size="sm" disabled={!isDirty || saving}
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
  const [expanded, setExpanded] = useState(false);
  const pct = Math.min(budget.progress, 100);
  const progressColor = getProgressColor(budget.progress, budget.overBudget);
  const amountColor = getAmountColor(budget.progress, budget.overBudget);
  const hasDetails = budget.entries.length > 0 || (isMonthOpen && !!selectedMonthId);

  return (
    <Card>
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug">
              {budget.name}
            </p>
            <p className="mt-0.5 min-h-4 text-xs leading-4 text-slate-400">
              {budget.limit !== budget.defaultLimit && (
                <>Limite ajustado: {formatCurrency(budget.limit)}</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <span className={cn('mr-1 text-sm font-bold tabular-nums', amountColor)}>
              {budget.progress.toFixed(0)}%
            </span>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => onEdit(budget)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-slate-300 hover:text-red-500"
              onClick={() => onDelete(budget)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={pct}
          className={cn('mt-3 h-1.5', progressColor)}
        />

        {/* Amounts */}
        <div className="mt-2 flex justify-between text-xs">
          <span className={cn('font-medium', budget.overBudget ? 'text-red-500' : 'text-slate-500')}>
            {formatCurrency(budget.spent)}
            <span className="font-normal text-slate-400"> / {formatCurrency(budget.limit)}</span>
          </span>
          {budget.remaining >= 0 ? (
            <span className="text-emerald-500 font-medium">
              {formatCurrency(budget.remaining)} restantes
            </span>
          ) : (
            <span className="text-red-500 font-medium">
              {formatCurrency(Math.abs(budget.remaining))} acima
            </span>
          )}
        </div>

        {/* Expandable details */}
        {hasDetails && (
          <>
            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? <><ChevronUp className="h-3 w-3" /> Ocultar detalhes</>
                : <><ChevronDown className="h-3 w-3" /> Detalhes</>}
            </button>

            {expanded && (
              <div className="mt-1 space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {isMonthOpen && selectedMonthId && (
                  <MonthLimitEditor
                    budget={budget}
                    monthId={selectedMonthId}
                    onSaved={onLimitSaved}
                  />
                )}

                {budget.entries.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Despesas vinculadas
                    </p>
                    {budget.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-slate-600 dark:text-slate-300">{entry.name}</span>
                        <span className="shrink-0 font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
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

  const { data: budgets } = useQuery({
    queryKey: ['budgets', selectedMonthId],
    queryFn: () => api.get<MonthBudget[]>(`/months/${selectedMonthId}/budgets`),
    enabled: !!selectedMonthId,
  });

  const templateForm = useForm({ resolver: zodResolver(templateSchema) });
  const invalidate = () => queryClient.invalidateQueries();

  const openCreateTemplate = () => {
    setEditTemplateId(null);
    templateForm.reset({ name: '', defaultLimit: 0 });
    setTemplateDialog(true);
  };

  const openEditTemplate = (budget: MonthBudget) => {
    setEditTemplateId(budget.templateId);
    templateForm.reset({ name: budget.name, defaultLimit: budget.defaultLimit });
    setTemplateDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await api.delete(`/budget-templates/${deleteTarget.templateId}`);
    setDeleting(false);
    setDeleteTarget(null);
    invalidate();
  };

  const sortedBudgets = budgets
    ? [...budgets].sort((a, b) => {
        if (a.overBudget !== b.overBudget) return a.overBudget ? -1 : 1;
        return b.progress - a.progress;
      })
    : [];

  const totalLimit = budgets?.reduce((s, b) => s + b.limit, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const totalRemaining = totalLimit - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Orçamentos
          </h1>
          {!!budgets?.length && (
            <p className="mt-1 text-sm text-slate-500">
              {formatCurrency(totalSpent)} gastos de {formatCurrency(totalLimit)} ·{' '}
              <span className={totalRemaining < 0 ? 'text-red-500' : 'text-emerald-500'}>
                {formatCurrency(Math.abs(totalRemaining))}{' '}
                {totalRemaining < 0 ? 'acima do limite' : 'restantes'}
              </span>
            </p>
          )}
        </div>
        <Button onClick={openCreateTemplate} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo orçamento
        </Button>
      </div>

      <BabyStepPageHint pageKey="orcamentos" />

      {/* Empty state */}
      {!budgets?.length && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-5">
            <Target className="h-9 w-9 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Nenhum orçamento criado
            </p>
            <p className="text-sm text-slate-400 max-w-xs">
              Defina limites por categoria e acompanhe seus gastos ao longo do mês.
            </p>
          </div>
          <Button onClick={openCreateTemplate} variant="outline" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Criar orçamento
          </Button>
        </div>
      )}

      {/* Grid of cards */}
      {sortedBudgets.length > 0 && (
        <div className="grid items-start gap-3 sm:grid-cols-2">
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
      )}

      {/* Create / Edit dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTemplateId ? 'Editar orçamento' : 'Novo orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editTemplateId
                ? 'Altere o nome ou o limite padrão deste orçamento.'
                : 'O limite padrão é aplicado em todos os meses. Você pode ajustá-lo mês a mês.'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={templateForm.handleSubmit(async (data) => {
              if (editTemplateId) {
                await api.patch(`/budget-templates/${editTemplateId}`, data);
              } else {
                await api.post('/budget-templates', data);
              }
              invalidate();
              setTemplateDialog(false);
              templateForm.reset();
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="budget-name">Nome</Label>
              <Input
                id="budget-name"
                placeholder="Ex: Lazer, Alimentação fora…"
                {...templateForm.register('name')}
              />
              {templateForm.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {templateForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Limite padrão mensal</Label>
              <FormCurrencyInput
                control={templateForm.control}
                name="defaultLimit"
                placeholder="0,00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTemplateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editTemplateId ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover orçamento</DialogTitle>
            <DialogDescription>
              Remover{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteTarget?.name}
              </span>
              ? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removendo…' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
