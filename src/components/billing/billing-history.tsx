'use client';

import { ExternalLink, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBillingHistory } from '@/hooks/use-plan';
import { cn, formatCurrency } from '@/lib/utils';
import type { BillingHistoryItem } from '@/types';

const STATUS: Record<BillingHistoryItem['status'], { label: string; className: string }> = {
  paid: { label: 'Paga', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  pending: { label: 'Aguardando', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  overdue: { label: 'Vencida', className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' },
  refunded: { label: 'Estornada', className: 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300' },
  canceled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300' },
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function BillingHistoryCard() {
  const { data, isPending } = useBillingHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-slate-500" aria-hidden /> Histórico de cobranças
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <p className="text-sm text-slate-500">Carregando…</p>
        ) : !data?.length ? (
          <p className="text-sm text-slate-500">Nenhuma cobrança registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {data.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.planName ?? item.description ?? 'Assinatura Finzup'}
                    {item.billingPlan && (
                      <span className="ml-1 font-normal text-slate-500">· {item.billingPlan === 'annual' ? 'anual' : item.billingPlan === 'semester' ? 'semestral' : 'mensal'}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.paidAt ? `Paga em ${formatDate(item.paidAt)}` : `Vence em ${formatDate(item.dueDate ?? item.createdAt)}`}
                    {item.billingType ? ` · ${item.billingType === 'PIX' ? 'PIX' : item.billingType === 'CREDIT_CARD' ? 'Cartão' : item.billingType}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS[item.status].className)}>
                    {STATUS[item.status].label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  {item.invoiceUrl && (
                    <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline dark:text-brand-300" aria-label="Ver fatura">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
