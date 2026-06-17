import { z } from 'zod';
import type { PaymentMethod } from '@/types';

export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  type: z.enum(['cash', 'debit', 'credit', 'pix', 'transfer', 'other']),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

export const paymentMethodTypeLabels: Record<PaymentMethod['type'], string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
  pix: 'PIX',
  transfer: 'Transferência',
  other: 'Outro',
};

// Estilos por tipo — bg do ícone + cor do ícone + cor do dot
export const paymentMethodTypeStyles: Record<
  PaymentMethod['type'],
  { iconBg: string; iconText: string; dot: string }
> = {
  credit:   { iconBg: 'bg-violet-100 dark:bg-violet-950/60',                           iconText: 'text-violet-600 dark:text-violet-400',                           dot: 'bg-violet-500' },
  pix:      { iconBg: 'bg-brand-green-100 dark:bg-brand-green-950/60',                 iconText: 'text-brand-green-600 dark:text-brand-green-400',                 dot: 'bg-brand-green-500' },
  cash:     { iconBg: 'bg-brand-green-100 dark:bg-brand-green-950/60',                 iconText: 'text-brand-green-600 dark:text-brand-green-400',                 dot: 'bg-brand-green-500' },
  debit:    { iconBg: 'bg-brand-100 dark:bg-brand-950/60',                             iconText: 'text-brand-600 dark:text-brand-400',                             dot: 'bg-brand-500' },
  transfer: { iconBg: 'bg-brand-100 dark:bg-brand-950/60',                             iconText: 'text-brand-600 dark:text-brand-400',                             dot: 'bg-brand-500' },
  other:    { iconBg: 'bg-brand-100 dark:bg-brand-950/60',                             iconText: 'text-brand-600 dark:text-brand-400',                             dot: 'bg-brand-500' },
};
