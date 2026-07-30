'use client';

import { useState } from 'react';
import type { PaymentMethod } from '@/types';
import { paymentMethodTypeLabels, paymentMethodTypeStyles } from '@/lib/payment-method-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddPaymentMethodDialog } from '@/components/payment-methods/add-payment-method-dialog';
import { CreditCard, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaymentMethodFieldProps = {
  methods: PaymentMethod[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  typeFilter?: PaymentMethod['type'];
  defaultType?: PaymentMethod['type'];
};

export function PaymentMethodField({
  methods,
  value,
  onChange,
  label = 'Forma de pagamento',
  typeFilter,
  defaultType,
}: PaymentMethodFieldProps) {
  const [addOpen, setAddOpen] = useState(false);
  const filtered = typeFilter ? methods.filter((m) => m.type === typeFilter) : methods;
  const resolvedDefaultType = defaultType ?? typeFilter;
  const isCreditOnly = typeFilter === 'credit';

  const handleCreated = (method: PaymentMethod) => {
    if (!typeFilter || method.type === typeFilter) {
      onChange(method.id);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {filtered.length > 0 ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um método">
              {value && (() => {
                const selected = filtered.find((m) => m.id === value);
                if (!selected) return null;
                return (
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', paymentMethodTypeStyles[selected.type].dot)} />
                    <span>{typeFilter ? selected.name : `${selected.name} · ${paymentMethodTypeLabels[selected.type]}`}</span>
                  </div>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {filtered.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', paymentMethodTypeStyles[m.type].dot)} />
                  {typeFilter ? m.name : `${m.name} · ${paymentMethodTypeLabels[m.type]}`}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-white/[0.1] dark:bg-white/[0.04]">
          {isCreditOnly ? (
            <CreditCard className="mx-auto mb-2 h-8 w-8 text-brand-400 dark:text-brand-500" />
          ) : null}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isCreditOnly
              ? 'Nenhum cartão de crédito cadastrado.'
              : 'Nenhum método de pagamento cadastrado.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isCreditOnly ? 'Cadastrar cartão de crédito' : 'Cadastrar método'}
          </Button>
        </div>
      )}

      <AddPaymentMethodDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultType={resolvedDefaultType}
        onCreated={handleCreated}
      />
    </div>
  );
}
