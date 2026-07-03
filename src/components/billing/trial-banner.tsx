'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { UserBilling } from '@/types';

interface TrialBannerProps {
  billing: UserBilling;
}

export function TrialBanner({ billing }: TrialBannerProps) {
  const [reactivating, setReactivating] = useState(false);

  if (!billing.inTrial || billing.billingProvider !== 'stripe') {
    return null;
  }

  const days = billing.daysLeftInTrial;
  const dayLabel = days === 1 ? 'dia' : 'dias';
  const canceled = billing.cancelAtPeriodEnd;

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const { url } = await api.post<{ url: string }>('/billing/portal-session');
      window.location.href = url;
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-900 dark:text-brand-100">
          {canceled ? (
            <>
              Faltam{' '}
              <strong>
                {days} {dayLabel}
              </strong>{' '}
              no seu teste gratuito. Reative a assinatura para continuar com o Finzup depois desse
              período.
            </>
          ) : (
            <>
              Faltam{' '}
              <strong>
                {days} {dayLabel}
              </strong>{' '}
              no seu teste gratuito. Ao fim do período, seu plano será cobrado automaticamente no
              cartão cadastrado.
            </>
          )}
        </p>
        {canceled ? (
          <Button
            className="shrink-0"
            disabled={reactivating}
            onClick={handleReactivate}
          >
            {reactivating ? 'Abrindo…' : 'Reativar assinatura'}
          </Button>
        ) : (
          <Link
            href="/dashboard/configuracoes"
            className="shrink-0 rounded-lg border border-brand-300 bg-white px-4 py-2 text-center text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-100"
          >
            Cancelar assinatura
          </Link>
        )}
      </div>
    </div>
  );
}
