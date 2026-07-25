'use client';

import { Check, ChevronRight, X } from 'lucide-react';
import { type BillingPlanId, BILLING_PLANS, monthlyEquivalent } from '@/constants/billing-plans';
import { type LandingCtaClick } from '@/lib/funnel-analytics';

const rows = [
  {
    without: 'Juros do rotativo acima de 400% ao ano',
    with: 'Dívida atacada na ordem certa',
  },
  {
    without: 'Horas recriando planilha todo mês',
    with: 'Minutos — a Finzup repete tudo',
  },
  {
    without: 'Consultor a partir de R$ 200/mês',
    with: 'A partir de R$ 24,83/mês',
  },
  {
    without: 'Anos girando em círculo',
    with: 'Saber o que fazer desde o dia 1',
  },
];

interface LifeComparisonSectionProps {
  onCta: (plan?: BillingPlanId, cta?: LandingCtaClick) => void;
}

export function LifeComparisonSection({ onCta }: LifeComparisonSectionProps) {
  const monthlyEquiv = monthlyEquivalent(
    BILLING_PLANS.annual.total,
    BILLING_PLANS.annual.intervalMonths,
  );

  return (
    <section className="bg-white py-20 sm:py-28 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Sem a Finzup × Com a Finzup
          </h2>
        </div>

        <div className="mx-auto mb-3 grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 dark:bg-red-950/30">
            <X className="h-4 w-4 text-red-500" strokeWidth={2.5} />
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Sem</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-green-50 py-3 dark:bg-brand-green-950/30">
            <Check className="h-4 w-4 text-brand-green-600" strokeWidth={2.5} />
            <span className="text-sm font-bold text-brand-green-700 dark:text-brand-green-400">Com</span>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-2.5">
          {rows.map(({ without, with: withCopy }) => (
            <div key={without} className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-red-50/80 px-4 py-4 dark:bg-red-950/15">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{without}</p>
              </div>
              <div className="rounded-xl bg-brand-green-50/80 px-4 py-4 dark:bg-brand-green-950/15">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{withCopy}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-base text-slate-500 dark:text-slate-400">
          Tudo isso por{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            R$ {monthlyEquiv.toFixed(2).replace('.', ',')}/mês
          </span>
        </p>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() =>
              onCta('annual', {
                ctaLocation: 'life_comparison',
                ctaLabel: 'Assinar agora',
                action: 'open_checkout',
                planId: 'annual',
              })
            }
            className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-sm font-semibold"
          >
            Assinar agora
            <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
          </button>
        </div>
      </div>
    </section>
  );
}
