'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  paymentMethodSchema,
  paymentMethodTypeLabels,
  paymentMethodTypeStyles,
  type PaymentMethodFormValues,
} from '@/lib/payment-method-types';
import type { PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DueDaySelect } from '@/components/payment-methods/due-day-select';

type AddPaymentMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: PaymentMethod['type'];
  onCreated?: (method: PaymentMethod) => void;
};

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  defaultType,
  onCreated,
}: AddPaymentMethodDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { name: '', type: defaultType },
  });

  const currentType = form.watch('type') as PaymentMethod['type'] | undefined;

  useEffect(() => {
    if (open) {
      form.reset({ name: '', type: defaultType });
    }
  }, [open, defaultType, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo método de pagamento</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            const method = await api.post<PaymentMethod>('/payment-methods', {
              ...data,
              dueDay: data.type === 'credit' ? (data.dueDay ?? null) : null,
              closingDay: data.type === 'credit' ? (data.closingDay ?? null) : null,
            });
            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            onCreated?.(method);
            form.reset();
            onOpenChange(false);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={currentType ?? ''}
              onValueChange={(v) => form.setValue('type', v as PaymentMethod['type'], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(paymentMethodTypeLabels) as [PaymentMethod['type'], string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', paymentMethodTypeStyles[key].dot)} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: Nubank Crédito" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          {currentType === 'credit' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fechamento da fatura (opcional)</Label>
                <DueDaySelect kind="closing" value={form.watch('closingDay')} onChange={(v) => form.setValue('closingDay', v)} />
                <p className="text-xs text-slate-400">Compras depois desse dia entram na fatura do mês seguinte.</p>
              </div>
              <div className="space-y-2">
                <Label>Vencimento da fatura (opcional)</Label>
                <DueDaySelect value={form.watch('dueDay')} onChange={(v) => form.setValue('dueDay', v)} />
                <p className="text-xs text-slate-400">Dia em que a fatura sai do caixa no fluxo.</p>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
