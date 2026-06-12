'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
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
import { ItemActions } from '@/components/despesas/item-actions';
import { formatCurrency } from '@/lib/utils';
import type { DonationEntry, PaymentMethod, BudgetTemplate } from '@/types';
import { Plus } from 'lucide-react';

const entrySchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  carryForward: z.boolean(),
});

type EntryFormValues = z.infer<typeof entrySchema>;

function BudgetSelect({
  budgets,
  value,
  onChange,
}: {
  budgets: BudgetTemplate[];
  value?: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <Select
      value={value ?? 'none'}
      onValueChange={(v) => onChange(v === 'none' ? null : v)}
    >
      <SelectTrigger><SelectValue placeholder="Orçamento (opcional)" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum</SelectItem>
        {budgets.map((b) => (
          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DonationForm({
  form,
  paymentMethods,
  budgets,
  onSubmit,
  submitLabel,
}: {
  form: UseFormReturn<EntryFormValues>;
  paymentMethods?: PaymentMethod[];
  budgets?: BudgetTemplate[];
  onSubmit: (data: EntryFormValues) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Instituição / destinatário</Label>
        <Input placeholder="Ex: Instituto X, Igreja Y" {...form.register('name')} />
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <FormCurrencyInput control={form.control} name="amount" placeholder="0,00" />
      </div>
      <div className="space-y-2">
        <Label>Forma de pagamento</Label>
        <Select
          value={form.watch('paymentMethodId') ?? ''}
          onValueChange={(v) => form.setValue('paymentMethodId', v)}
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
        <Label>Orçamento</Label>
        <BudgetSelect
          budgets={budgets ?? []}
          value={form.watch('budgetTemplateId')}
          onChange={(v) => form.setValue('budgetTemplateId', v)}
        />
        <p className="text-xs text-slate-500">O valor será abatido do orçamento selecionado.</p>
      </div>
      <div className="space-y-2">
        <Label>Notas (opcional)</Label>
        <Input placeholder="Ex: Dízimo, campanha de natal" {...form.register('notes')} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="carryForward"
          checked={form.watch('carryForward')}
          onCheckedChange={(v) => form.setValue('carryForward', !!v)}
        />
        <Label htmlFor="carryForward">Repetir todo mês</Label>
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}

export default function DoacoesPage() {
  const { selectedMonthId } = useMonthStore();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DonationEntry | null>(null);
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

  const { data: budgets } = useQuery({
    queryKey: ['budget-templates'],
    queryFn: () => api.get<BudgetTemplate[]>('/budget-templates'),
  });

  const entryForm = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { name: '', amount: 0, carryForward: false, budgetTemplateId: null },
  });

  const editForm = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { name: '', amount: 0, carryForward: false, budgetTemplateId: null },
  });

  const totalDonated = entries?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

  const openEdit = (entry: DonationEntry) => {
    editForm.reset({
      name: entry.name,
      amount: Number(entry.amount),
      paymentMethodId: entry.paymentMethodId ?? undefined,
      budgetTemplateId: entry.budgetTemplateId ?? null,
      notes: entry.notes ?? undefined,
      carryForward: entry.carryForward,
    });
    setEditTarget(entry);
  };

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
            <DonationForm
              form={entryForm}
              paymentMethods={paymentMethods}
              budgets={budgets}
              submitLabel="Salvar"
              onSubmit={async (data) => {
                await api.post(`/months/${selectedMonthId}/donations`, {
                  ...data,
                  budgetTemplateId: data.budgetTemplateId ?? null,
                });
                await queryClient.invalidateQueries();
                entryForm.reset();
                setOpen(false);
              }}
            />
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
                {entry.budgetTemplate && (
                  <p className="text-xs text-slate-500">Orçamento: {entry.budgetTemplate.name}</p>
                )}
                {entry.notes && <p className="text-xs text-slate-500">{entry.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-600">{formatCurrency(Number(entry.amount))}</span>
                <ItemActions
                  onEdit={() => openEdit(entry)}
                  onDelete={async () => {
                    await api.delete(`/months/${selectedMonthId}/donations/${entry.id}`);
                    await queryClient.invalidateQueries();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar doação</DialogTitle></DialogHeader>
          {editTarget && (
            <DonationForm
              form={editForm}
              paymentMethods={paymentMethods}
              budgets={budgets}
              submitLabel="Salvar alterações"
              onSubmit={async (data) => {
                await api.patch(`/months/${selectedMonthId}/donations/${editTarget.id}`, {
                  ...data,
                  budgetTemplateId: data.budgetTemplateId ?? null,
                });
                await queryClient.invalidateQueries();
                setEditTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
