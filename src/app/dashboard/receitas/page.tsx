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

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  amount: z.number().positive('Valor deve ser positivo'),
  carryForward: z.boolean(),
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
      <div className="flex items-center gap-2">
        <Checkbox
          id="carryForward"
          checked={form.watch('carryForward')}
          onCheckedChange={(v) => form.setValue('carryForward', !!v)}
        />
        <Label htmlFor="carryForward">Repetir todo mês</Label>
      </div>
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
          <p className="text-sm text-slate-500">Salário, freelances e outras fontes de renda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          {isMonthOpen && (
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
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
      <Card className="border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Total do mês
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {incomes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <TrendingUp className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-300">Nenhuma receita cadastrada</p>
          <p className="mt-1 text-sm text-slate-500">Adicione seu salário ou outras fontes de renda.</p>
          {isMonthOpen && (
            <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
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
              className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800"
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {dragHandle}
                  <div className="h-8 w-1 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{income.name}</p>
                    {income.carryForward && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <RefreshCw className="h-3 w-3" />
                        Repete todo mês
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
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
