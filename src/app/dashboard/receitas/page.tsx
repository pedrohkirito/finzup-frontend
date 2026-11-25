'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { useReorder } from '@/hooks/use-reorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ItemActions } from '@/components/despesas/item-actions';
import { SortableList } from '@/components/despesas/sortable-list';
import { formatCurrency } from '@/lib/utils';
import type { IncomeEntry } from '@/types';
import { Plus, TrendingUp, RefreshCw } from 'lucide-react';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { EntryExtrasFields, entryExtrasFormShape, extrasFormValues } from '@/components/finance/entry-extras-fields';
import { CategorySelect } from '@/components/finance/category-select';
import { EntryExtrasMeta } from '@/components/finance/entry-extras-meta';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  amount: z.number().positive('Valor deve ser positivo'),
  carryForward: z.boolean(),
  categoryId: z.string().nullable().optional(),
  ...entryExtrasFormShape,
});

type IncomeFormValues = z.infer<typeof schema>;

function IncomeForm({
  form,
  onSubmit,
  submitLabel,
}: {
  form: UseFormReturn<IncomeFormValues>;
  onSubmit: (data: IncomeFormValues) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input placeholder="Ex: Salário" {...form.register('name')} />
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <FormCurrencyInput control={form.control} name="amount" placeholder="0,00" />
      </div>
      <CategorySelect
        kind="income"
        scope={form.watch('scope') ?? 'personal'}
                  spaceId={form.watch('spaceId')}
        value={form.watch('categoryId')}
        onChange={(v) => form.setValue('categoryId', v)}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="carryForward"
          checked={form.watch('carryForward')}
          onCheckedChange={(v) => form.setValue('carryForward', !!v)}
        />
        <Label htmlFor="carryForward">Repetir todo mês</Label>
      </div>
      <EntryExtrasFields form={form} recurring={form.watch('carryForward')} />
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

export default function ReceitasPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IncomeEntry | null>(null);
  const queryClient = useQueryClient();
  const reorder = useReorder();

  const { data: incomes, isLoading } = useQuery({
    queryKey: ['incomes', selectedMonthId],
    queryFn: () => api.get<IncomeEntry[]>(`/months/${selectedMonthId}/incomes`),
    enabled: !!selectedMonthId,
  });

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: 0, carryForward: false },
  });

  const editForm = useForm<IncomeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: 0, carryForward: false },
  });

  const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) ?? 0;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['incomes', selectedMonthId] });
    await queryClient.invalidateQueries({ queryKey: ['months'] });
  };

  const openEdit = (income: IncomeEntry) => {
    editForm.reset({
      name: income.name,
      amount: Number(income.amount),
      carryForward: income.carryForward,
      categoryId: income.categoryId ?? null,
      ...extrasFormValues(income),
    });
    setEditTarget(income);
  };

  const remove = async (id: string) => {
    await api.delete(`/months/${selectedMonthId}/incomes/${id}`);
    await invalidate();
  };

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Receitas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Salário, freelances e outras fontes de renda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          {isMonthOpen && (
            <DialogTrigger asChild>
              <Button className="h-11 w-full font-semibold sm:w-auto">
                <Plus className="h-4 w-4" />
                Nova receita
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova receita</DialogTitle>
            </DialogHeader>
            <IncomeForm
              form={form}
              submitLabel="Salvar"
              onSubmit={async (data) => {
                await api.post(`/months/${selectedMonthId}/incomes`, data);
                await invalidate();
                form.reset();
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BabyStepPageHint pageKey="receitas" />

      {/* Card de total */}
      <Card className="border-emerald-100 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="icon-chip h-11 w-11 bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Total do mês
            </p>
            <p className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {incomes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/[0.08]">
          <div className="icon-chip mb-4 h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
            <TrendingUp className="h-7 w-7" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200">Nenhuma receita cadastrada</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione seu salário ou outras fontes de renda.</p>
          {isMonthOpen && (
            <Button variant="outline" className="mt-5 h-11" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar receita
            </Button>
          )}
        </div>
      ) : incomes ? (
        <SortableList
          items={incomes}
          sortable={!!isMonthOpen}
          onReorder={(items) =>
            reorder(['incomes', selectedMonthId], `/months/${selectedMonthId}/incomes/reorder`, items)
          }
        >
          {(income, dragHandle) => (
            <Card
              key={income.id}
              className="border-slate-200 transition-colors hover:shadow-sm dark:hover:bg-white/[0.05]"
            >
              <CardContent className="flex min-h-[60px] flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {dragHandle}
                  <div className="icon-chip bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{income.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {income.category && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                          {income.category.name}
                        </span>
                      )}
                      {income.carryForward && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400">
                          <RefreshCw className="h-3 w-3" />
                          Repete todo mês
                        </span>
                      )}
                      <EntryExtrasMeta entry={income} recurring={income.carryForward} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Number(income.amount))}
                  </span>
                  <ItemActions
                    readOnly={!isMonthOpen}
                    onEdit={() => openEdit(income)}
                    onDelete={() => remove(income.id)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </SortableList>
      ) : null}

      {/* Dialog de edição */}
      <Dialog open={!!editTarget} onOpenChange={(isOpen) => !isOpen && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar receita</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <IncomeForm
              form={editForm}
              submitLabel="Salvar"
              onSubmit={async (data) => {
                await api.patch(`/months/${selectedMonthId}/incomes/${editTarget.id}`, data);
                await invalidate();
                setEditTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
