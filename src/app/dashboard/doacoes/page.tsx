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
import { PaymentMethodField } from '@/components/payment-methods/payment-method-field';
import { ItemActions } from '@/components/despesas/item-actions';
import { SortableList } from '@/components/despesas/sortable-list';
import { formatCurrency } from '@/lib/utils';
import type { DonationEntry, PaymentMethod } from '@/types';
import { Heart, Plus, RefreshCw } from 'lucide-react';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { CategorySelect } from '@/components/finance/category-select';
import { EntryExtrasFields, entryExtrasFormShape, extrasFormValues } from '@/components/finance/entry-extras-fields';
import { EntryExtrasMeta } from '@/components/finance/entry-extras-meta';

const entrySchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  carryForward: z.boolean(),
  ...entryExtrasFormShape,
});

type EntryFormValues = z.infer<typeof entrySchema>;

function DonationForm({
  form,
  paymentMethods,
  onSubmit,
  submitLabel,
}: {
  form: UseFormReturn<EntryFormValues>;
  paymentMethods?: PaymentMethod[];
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
      <PaymentMethodField
        methods={paymentMethods ?? []}
        value={form.watch('paymentMethodId') ?? ''}
        onChange={(v) => form.setValue('paymentMethodId', v)}
      />
      <div className="space-y-1">
        <CategorySelect
          kind="expense"
          scope={form.watch('scope') ?? 'personal'}
                  spaceId={form.watch('spaceId')}
          value={form.watch('budgetTemplateId')}
          onChange={(v) => form.setValue('budgetTemplateId', v)}
        />
        <p className="text-xs text-slate-500">Se a categoria tiver limite, o valor é abatido dele.</p>
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
      <EntryExtrasFields form={form} recurring={form.watch('carryForward')} />
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}

export default function DoacoesPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DonationEntry | null>(null);
  const queryClient = useQueryClient();
  const reorder = useReorder();

  const { data: entries } = useQuery({
    queryKey: ['donations', selectedMonthId],
    queryFn: () => api.get<DonationEntry[]>(`/months/${selectedMonthId}/donations`),
    enabled: !!selectedMonthId,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
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
      ...extrasFormValues(entry),
    });
    setEditTarget(entry);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Doações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registre suas contribuições e doações do mês</p>
      </div>

      <BabyStepPageHint pageKey="doacoes" />

      <Card className="border-sky-100 bg-sky-50 dark:border-sky-400/20 dark:bg-sky-500/[0.08]">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="icon-chip h-11 w-11 bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
            <Heart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Total doado este mês
            </p>
            <p className="text-3xl font-bold tracking-tight text-sky-700 dark:text-sky-300">
              {formatCurrency(totalDonated)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Doações do mês</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          {isMonthOpen && (
          <DialogTrigger asChild>
            <Button className="h-11 w-full bg-sky-600 font-semibold hover:bg-sky-700 focus-visible:ring-sky-500 sm:w-auto dark:bg-sky-500 dark:shadow-[0_4px_14px_rgba(14,165,233,0.25)] dark:hover:bg-sky-400"><Plus className="h-4 w-4" /> Nova doação</Button>
          </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader><DialogTitle>Nova doação</DialogTitle></DialogHeader>
            <DonationForm
              form={entryForm}
              paymentMethods={paymentMethods}
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/[0.08]">
            <div className="icon-chip mb-4 h-14 w-14 rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 dark:text-sky-400">
              <Heart className="h-7 w-7" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma doação registrada este mês.</p>
          </div>
        )}
        {entries && entries.length > 0 && (
          <SortableList
            items={entries}
            sortable={!!isMonthOpen}
            onReorder={(items) =>
              reorder(['donations', selectedMonthId!], `/months/${selectedMonthId}/donations/reorder`, items)
            }
          >
            {(entry, dragHandle) => (
              <Card
                key={entry.id}
                className="border-slate-200 transition-colors hover:shadow-sm dark:hover:bg-white/[0.05]"
              >
                <CardContent className="flex min-h-[60px] flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {dragHandle}
                    <div className="icon-chip bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-white">{entry.name}</p>
                      {entry.carryForward && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400">
                          <RefreshCw className="h-3 w-3" />
                          Repete todo mês
                        </div>
                      )}
                      {entry.paymentMethod && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{entry.paymentMethod.name}</p>
                      )}
                      {entry.budgetTemplate && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Categoria: {entry.budgetTemplate.name}</p>
                      )}
                      {entry.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{entry.notes}</p>}
                      <EntryExtrasMeta entry={entry} recurring={entry.carryForward} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                      {formatCurrency(Number(entry.amount))}
                    </span>
                    <ItemActions
                      readOnly={!isMonthOpen}
                      onEdit={() => openEdit(entry)}
                      onDelete={async () => {
                        await api.delete(`/months/${selectedMonthId}/donations/${entry.id}`);
                        await queryClient.invalidateQueries();
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </SortableList>
        )}
      </div>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar doação</DialogTitle></DialogHeader>
          {editTarget && (
            <DonationForm
              form={editForm}
              paymentMethods={paymentMethods}
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
