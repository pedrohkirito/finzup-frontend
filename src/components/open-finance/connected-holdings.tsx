'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useHasFeature } from '@/hooks/use-plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type OpenFinanceHolding = {
  id: string;
  name: string;
  type: string | null;
  subtype: string | null;
  balance: number;
  quantity: number | null;
  currencyCode: string;
  institution: string | null;
  updatedAt: string;
};

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

/** Carteira lida do banco. Não entra nos aportes do mês. */
export function ConnectedHoldingsCard() {
  const canUse = useHasFeature('statement_import');
  const { data, error, isLoading } = useQuery({
    queryKey: ['open-finance-holdings'],
    queryFn: () => api.get<OpenFinanceHolding[]>('/open-finance/holdings'),
    enabled: canUse,
    retry: false,
  });

  if (!canUse) return null;
  if (error instanceof ApiError && (error.code === 'PLUGGY_NOT_CONFIGURED' || error.status === 402)) return null;
  if (isLoading || !data) return null;
  if (!data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Custódia conectada</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          Nenhuma posição chegou ainda.{' '}
          <Link href="/dashboard/open-finance" className="text-brand-600 underline dark:text-brand-400">
            Conectar um banco
          </Link>
        </CardContent>
      </Card>
    );
  }

  const updatedAt = data.map((row) => row.updatedAt).sort().at(-1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4 text-slate-400" aria-hidden />
          Custódia conectada
        </CardTitle>
        <p className="text-sm text-slate-500">
          Posições lidas do Open Finance. Elas não viram aporte do mês.
          {updatedAt ? ` Atualizado em ${formatUpdated(updatedAt)}.` : ''}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {data.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">{row.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {[row.institution, row.subtype || row.type].filter(Boolean).join(' · ')}
                  {row.quantity != null ? ` · ${row.quantity}` : ''}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(row.balance)}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
