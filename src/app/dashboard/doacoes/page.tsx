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
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import type { DonationEntry, PaymentMethod } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

const entrySchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().optional(),
  notes: z.string().optional(),
  carryForward: z.boolean().default(false),
});

export default function DoacoesPage() {
  const { selectedMonthId } = useMonthStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries } = useQuery({
    queryKey: ['donations', selectedMonthId],
    queryFn: () => api.get<DonationEntry[]>(`/months/${selectedMonthId}/donations`),
    enabled: !!selectedMonthId,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
  });

  const entryForm = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: { name: '', amount: 0, carryForward: false },
  });

  const totalDonated = entries?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doações</h1>
        <p className="text-slate-500">Registre suas contribuições e doações do mês</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">Total doado este mês</span>
          <span className="text-xl font-bold text-rose-600">{formatCurrency(totalDonated)}</span>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Doações do mês</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nova doação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova doação</DialogTitle></DialogHeader>
            <form
              onSubmit={entryForm.handleSubmit(async (data) => {
                await api.post(`/months/${selectedMonthId}/donations`, data);
                await queryClient.invalidateQueries();
                entryForm.reset();
                setOpen(false);
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Instituição / destinatário</Label>
                <Input placeholder="Ex: Instituto X, Igreja Y" {...entryForm.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <FormCurrencyInput control={entryForm.control} name="amount" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Select
                  value={entryForm.watch('paymentMethodId') ?? ''}
                  onValueChange={(v) => entryForm.setValue('paymentMethodId', v)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input placeholder="Ex: Dízimo, campanha de natal" {...entryForm.register('notes')} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="carryForward"
                  checked={entryForm.watch('carryForward')}
                  onCheckedChange={(v) => entryForm.setValue('carryForward', !!v)}
                />
                <Label htmlFor="carryForward">Repetir todo mês</Label>
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {entries?.length === 0 && (
          <p className="text-center text-sm text-slate-500">Nenhuma doação registrada este mês.</p>
        )}
        {entries?.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex justify-between p-4">
              <div>
                <p className="font-medium">{entry.name}</p>
                {entry.carryForward && <p className="text-xs text-rose-600">Repete todo mês</p>}
                {entry.paymentMethod && (
                  <p className="text-xs text-slate-500">{entry.paymentMethod.name}</p>
                )}
                {entry.notes && <p className="text-xs text-slate-500">{entry.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-600">{formatCurrency(Number(entry.amount))}</span>
                <Button variant="ghost" size="icon" onClick={async () => {
                  await api.delete(`/months/${selectedMonthId}/donations/${entry.id}`);
                  await queryClient.invalidateQueries();
                }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
