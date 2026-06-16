'use client';

import Link from 'next/link';
import type { UserBilling } from '@/types';

interface TrialBannerProps {
  billing: UserBilling;
}

export function TrialBanner({ billing }: TrialBannerProps) {
  if (!billing.inTrial) {
    return null;
  }

  const days = billing.daysLeftInTrial;
  const dayLabel = days === 1 ? 'dia' : 'dias';

  return (
    <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-900 dark:text-brand-100">
          Teste gratuito ativo — faltam{' '}
          <strong>
            {days} {dayLabel}
          </strong>{' '}
          para a primeira cobrança do seu plano. O cartão já está cadastrado.
        </p>
        <Link
          href="/dashboard/configuracoes"
          className="shrink-0 rounded-lg border border-brand-300 bg-white px-4 py-2 text-center text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-100"
        >
          Gerenciar assinatura
        </Link>
      </div>
    </div>
  );
}
