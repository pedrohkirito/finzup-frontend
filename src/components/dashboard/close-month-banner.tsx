'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { FinancialMonth } from '@/types';

interface ClosePreview {
  incomesToCarry: { name: string; amount: string | number }[];
  donationsToCarry: { name: string; amount: string | number }[];
  fixedExpensesToCreate: { name: string; defaultAmount: string | number }[];
  installmentsToAdvance: { name: string; installmentAmount: string | number }[];
  subscriptionsToCarry: { name: string; amount: string | number }[];
  financingsToAdvance: { name: string; installmentAmount: string | number }[];
}

export function CloseMonthBanner({ month }: { month: FinancialMonth }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: preview } = useQuery({
    queryKey: ['months', month.id, 'close-preview'],
    queryFn: () => api.get<ClosePreview>(`/months/${month.id}/close-preview`),
    enabled: open && month.status === 'open',
  });

  if (month.status === 'closed') return null;

  const handleClose = async () => {
    setLoading(true);
    try {
      await api.post(`/months/${month.id}/close`);
      await queryClient.invalidateQueries();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
      <div>
        <p className="font-medium text-amber-900 dark:text-amber-200">Pronto para fechar o mês?</p>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Receitas, doações e despesas recorrentes serão copiadas para o próximo mês.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-amber-300">Fechar mês</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar fechamento do mês</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="max-h-64 space-y-3 overflow-y-auto text-sm">
              {preview.incomesToCarry.length > 0 && (
                <div>
                  <p className="font-medium">Receitas a repetir:</p>
                  {preview.incomesToCarry.map((i) => (
                    <p key={i.name} className="text-slate-500">{i.name} — {formatCurrency(Number(i.amount))}</p>
                  ))}
                </div>
              )}
              {preview.donationsToCarry.length > 0 && (
                <div>
                  <p className="font-medium">Doações a repetir:</p>
                  {preview.donationsToCarry.map((d) => (
                    <p key={d.name} className="text-slate-500">{d.name} — {formatCurrency(Number(d.amount))}</p>
                  ))}
                </div>
              )}
              {preview.fixedExpensesToCreate.length > 0 && (
                <div>
                  <p className="font-medium">Despesas fixas:</p>
                  {preview.fixedExpensesToCreate.map((e) => (
                    <p key={e.name} className="text-slate-500">{e.name} — {formatCurrency(Number(e.defaultAmount))}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          <Button onClick={handleClose} disabled={loading}>
            {loading ? 'Fechando...' : 'Confirmar fechamento'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
