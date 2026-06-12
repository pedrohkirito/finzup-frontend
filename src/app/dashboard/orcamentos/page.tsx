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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { MonthBudget } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';

const templateSchema = z.object({
  name: z.string().min(1),
  defaultLimit: z.coerce.number().nonnegative(),
});

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

  useEffect(() => {
    setLimit(budget.limit);
  }, [budget.limit]);

  return (
    <div className="flex flex-wrap items-end gap-2 border-t pt-4">
      <div className="min-w-[180px] flex-1 space-y-2">
        <Label className="text-xs">Limite só neste mês</Label>
        <CurrencyInput value={limit} onChange={setLimit} placeholder="0,00" />
      </div>
      <Button type="button" variant="outline" onClick={() => setLimit(budget.limit)}>
        Restaurar
      </Button>
      <Button
        type="button"
        onClick={async () => {
          await api.put(`/months/${monthId}/budgets/${budget.templateId}/limit`, { limitAmount: limit });
          onSaved();
        }}
      >
        Salvar limite
      </Button>
    </div>
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
    templateForm.reset({
      name: budget.name,
      defaultLimit: budget.defaultLimit,
    });
    setTemplateDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-slate-500">Limites mensais e gastos vinculados às despesas (exceto financiamentos)</p>
        </div>
        <Button onClick={openCreateTemplate}>
          <Plus className="h-4 w-4" /> Novo orçamento
        </Button>
      </div>

      {!budgets?.length && (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Nenhum orçamento cadastrado. Crie um para acompanhar limites como mesada ou lazer.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {budgets?.map((budget) => (
          <Card key={budget.templateId}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base">{budget.name}</CardTitle>
                <p className="text-sm text-slate-500">
                  Padrão: {formatCurrency(budget.defaultLimit)} · Limite do mês: {formatCurrency(budget.limit)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditTemplate(budget)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!confirm(`Remover o orçamento "${budget.name}"?`)) return;
                    await api.delete(`/budget-templates/${budget.templateId}`);
                    invalidate();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                  <span className={cn(budget.overBudget ? 'text-red-500 font-medium' : '')}>
                    {formatCurrency(budget.spent)} gastos
                  </span>
                  <span className={cn(budget.remaining < 0 ? 'text-red-500' : 'text-slate-500')}>
                    {budget.remaining >= 0
                      ? `${formatCurrency(budget.remaining)} restantes`
                      : `${formatCurrency(Math.abs(budget.remaining))} acima do limite`}
                  </span>
                </div>
                <Progress
                  value={budget.progress}
                  className={cn(budget.overBudget && '[&>div]:bg-red-500')}
                />
                {budget.overBudget && (
                  <Badge variant="destructive" className="mt-2">Orçamento estourado</Badge>
                )}
              </div>

              {isMonthOpen && selectedMonthId && (
                <MonthLimitEditor budget={budget} monthId={selectedMonthId} onSaved={invalidate} />
              )}

              {budget.entries.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium text-slate-600">Despesas vinculadas</p>
                  {budget.entries.map((entry) => (
                    <div key={entry.id} className="flex justify-between text-sm">
                      <span>{entry.name}</span>
                      <span className="font-medium text-red-500">{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTemplateId ? 'Editar orçamento' : 'Novo orçamento'}</DialogTitle>
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
              <Label>Nome</Label>
              <Input placeholder="Ex: Pedro — livre" {...templateForm.register('name')} />
            </div>
            <div className="space-y-2">
              <Label>Limite padrão mensal</Label>
              <FormCurrencyInput control={templateForm.control} name="defaultLimit" placeholder="0,00" />
            </div>
            <Button type="submit" className="w-full">
              {editTemplateId ? 'Salvar alterações' : 'Criar orçamento'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
