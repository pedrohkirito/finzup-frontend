'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import type { FinancialMonth } from '@/types';

interface ClosePreview {
  incomesToCarry: { id: string; name: string; amount: string | number }[];
  donationsToCarry: { id: string; name: string; amount: string | number }[];
  fixedExpensesToCreate: { id: string; name: string; defaultAmount: string | number }[];
  installmentsToAdvance: { id: string; name: string; installmentAmount: string | number }[];
  subscriptionsToCarry: { id: string; name: string; amount: string | number }[];
  financingsToAdvance: { id: string; name: string; installmentAmount: string | number }[];
  investmentGoalToCarry: { targetAmount: string | number } | null;
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

  const handleReopen = async () => {
    setLoading(true);
    try {
      await api.post(`/months/${month.id}/reopen`);
      await queryClient.invalidateQueries();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (month.status === 'closed') {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/50">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">Este mês está fechado</p>
          <p className="text-sm text-slate-500">
            Os lançamentos estão em modo leitura. Você pode reabrir para editar novamente.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">Reabrir mês</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reabrir mês</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500">
              O mês voltará a ficar editável. Alterações feitas no fechamento — como parcelas avançadas e
              lançamentos criados no próximo mês — não serão desfeitas automaticamente.
            </p>
            <Button onClick={handleReopen} disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Reabrindo...' : 'Confirmar reabertura'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
      <div>
        <p className="font-medium text-amber-900 dark:text-amber-200">Pronto para fechar o mês?</p>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Receitas, doações, despesas recorrentes e meta de investimentos serão copiadas para o próximo mês.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-amber-300 sm:w-auto">Fechar mês</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar fechamento do mês</DialogTitle>
          </DialogHeader>
          {preview && (
            <ScrollArea className="max-h-64">
              <div className="space-y-3 text-sm">
              {preview.incomesToCarry.length > 0 && (
                <div>
                  <p className="font-medium">Receitas a repetir:</p>
                  {preview.incomesToCarry.map((i) => (
                    <p key={i.id} className="text-slate-500">{i.name} — {formatCurrency(Number(i.amount))}</p>
                  ))}
                </div>
              )}
              {preview.donationsToCarry.length > 0 && (
                <div>
                  <p className="font-medium">Doações a repetir:</p>
                  {preview.donationsToCarry.map((d) => (
                    <p key={d.id} className="text-slate-500">{d.name} — {formatCurrency(Number(d.amount))}</p>
                  ))}
                </div>
              )}
              {preview.fixedExpensesToCreate.length > 0 && (
                <div>
                  <p className="font-medium">Despesas fixas:</p>
                  {preview.fixedExpensesToCreate.map((e) => (
                    <p key={e.id} className="text-slate-500">{e.name} — {formatCurrency(Number(e.defaultAmount))}</p>
                  ))}
                </div>
              )}
              {preview.investmentGoalToCarry && (
                <div>
                  <p className="font-medium">Meta de investimentos:</p>
                  <p className="text-slate-500">
                    {formatCurrency(Number(preview.investmentGoalToCarry.targetAmount))}
                  </p>
                </div>
              )}
              </div>
            </ScrollArea>
          )}
          <Button onClick={handleClose} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Fechando...' : 'Confirmar fechamento'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
