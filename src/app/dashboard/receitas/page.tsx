'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore } from '@/hooks/use-month';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { IncomeEntry } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  carryForward: z.boolean().default(false),
});

export default function ReceitasPage() {
  const { selectedMonthId } = useMonthStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: incomes } = useQuery({
    queryKey: ['incomes', selectedMonthId],
    queryFn: () => api.get<IncomeEntry[]>(`/months/${selectedMonthId}/incomes`),
    enabled: !!selectedMonthId,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: 0, carryForward: false },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await api.post(`/months/${selectedMonthId}/incomes`, data);
    await queryClient.invalidateQueries({ queryKey: ['incomes', selectedMonthId] });
    await queryClient.invalidateQueries({ queryKey: ['months'] });
    form.reset();
    setOpen(false);
  });

  const remove = async (id: string) => {
    await api.delete(`/months/${selectedMonthId}/incomes/${id}`);
    await queryClient.invalidateQueries({ queryKey: ['incomes', selectedMonthId] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receitas</h1>
          <p className="text-slate-500">Salário, freelances e outras fontes de renda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nova receita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova receita</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Salário" {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
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
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {incomes?.map((income) => (
          <Card key={income.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{income.name}</p>
                {income.carryForward && <p className="text-xs text-emerald-600">Repete todo mês</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-600">{formatCurrency(Number(income.amount))}</span>
                <Button variant="ghost" size="icon" onClick={() => remove(income.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {incomes?.length === 0 && (
          <Card><CardHeader><CardTitle className="text-base text-slate-500">Nenhuma receita cadastrada</CardTitle></CardHeader></Card>
        )}
      </div>
    </div>
  );
}
