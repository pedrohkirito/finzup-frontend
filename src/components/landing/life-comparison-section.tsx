'use client';

import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Siren,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { type BillingPlanId, BILLING_PLANS, monthlyEquivalent } from '@/constants/billing-plans';
import { type LandingCtaClick } from '@/lib/funnel-analytics';
import { Reveal } from '@/components/landing/reveal';
import { RefundNote } from '@/components/landing/refund-note';

const rows = [
  {
    withoutIcon: Siren,
    withIcon: ShieldCheck,
    without: 'Imprevisto vira dívida nova',
    with: 'Reserva pronta. Imprevisto não te derruba.',
  },
  {
    withoutIcon: Clock3,
    withIcon: Zap,
    without: 'Horas recriando a mesma planilha',
    with: 'Minutos. A Finzup já fez o trabalho.',
  },
  {
    withoutIcon: Wallet,
    withIcon: PiggyBank,
    without: 'Fecha o mês sem sobrar nada',
    with: 'Contas pagas — e ainda sobra dinheiro',
  },
  {
    withoutIcon: Banknote,
    withIcon: BadgeDollarSign,
    without: 'O ano fecha sem você saber para onde foi',
    with: 'Você vê o que sobrou e onde cortar',
  },
  {
    withoutIcon: RefreshCw,
    withIcon: Compass,
    without: 'Anos girando no mesmo círculo',
    with: 'Você já sabe o caminho desde o primeiro dia',
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
    <section data-landing-section="life_comparison" className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 left-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-red-500/[0.06] blur-3xl dark:bg-red-500/10" />
        <div className="absolute right-0 bottom-0 h-[480px] w-[480px] translate-x-1/4 translate-y-1/4 rounded-full bg-brand-green-500/[0.08] blur-3xl dark:bg-brand-green-500/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="mb-4 inline-block text-sm font-semibold tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
            Antes e depois
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            <span className="text-slate-400 dark:text-slate-500">Sem a Finzup</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden>
              ×
            </span>
            <span className="brand-gradient-text">Com a Finzup</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-500 sm:text-lg dark:text-slate-400">
            O mesmo problema. Dois caminhos. Só um te tira do ciclo.
          </p>
        </Reveal>

        {/* Column headers */}
        <Reveal delay={80} className="mx-auto mb-4 grid max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-2 sm:mb-5 sm:gap-4">          <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50 px-3 py-3.5 sm:px-4 dark:border-red-500/20 dark:bg-red-950/40">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 dark:bg-red-500/20">
              <X className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-sm font-bold tracking-wide text-red-600 sm:text-base dark:text-red-400">
              Sem a Finzup
            </span>
          </div>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-extrabold tracking-wider text-slate-400 uppercase shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
            aria-hidden
          >
            vs
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-green-200/80 bg-brand-green-50 px-3 py-3.5 sm:px-4 dark:border-brand-green-500/25 dark:bg-brand-green-950/40">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green-500/15 dark:bg-brand-green-500/20">
              <Check className="h-3.5 w-3.5 text-brand-green-600 dark:text-brand-green-400" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-sm font-bold tracking-wide text-brand-green-700 sm:text-base dark:text-brand-green-400">
              Com a Finzup
            </span>
          </div>
        </Reveal>

        {/* Comparison rows */}
        <div className="mx-auto max-w-4xl space-y-3">
          {rows.map(({ without, with: withCopy, withoutIcon: WithoutIcon, withIcon: WithIcon }, index) => (
            <Reveal key={without} delay={index * 70} className="group grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-white/70 px-4 py-4 transition-all duration-200 group-hover:border-red-200 group-hover:bg-red-50/60 dark:border-red-500/10 dark:bg-red-950/20 dark:group-hover:border-red-500/25 dark:group-hover:bg-red-950/35">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:bg-red-500/15">
                  <WithoutIcon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="pt-1.5 text-sm leading-snug font-medium text-slate-600 sm:text-[15px] dark:text-slate-400">
                  {without}
                </p>
              </div>

              <div
                className="hidden items-center justify-center sm:flex"
                aria-hidden
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors duration-200 group-hover:bg-brand-500/10 group-hover:text-brand-500 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400">
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </div>

              <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-brand-green-200/70 bg-white px-4 py-4 shadow-[0_0_0_1px_rgba(34,189,123,0.04)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-green-300 group-hover:shadow-[0_8px_24px_-12px_rgba(34,189,123,0.35)] dark:border-brand-green-500/20 dark:bg-brand-green-950/30 dark:group-hover:border-brand-green-500/40">
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green-500/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-500/15 text-brand-green-600 dark:bg-brand-green-500/20 dark:text-brand-green-400">
                  <WithIcon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="relative pt-1.5 text-sm leading-snug font-semibold text-slate-800 sm:text-[15px] dark:text-slate-100">
                  {withCopy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Price + CTA */}
        <Reveal delay={140} className="mx-auto mt-14 max-w-md text-center sm:mt-16">
          <div className="mb-8 inline-flex flex-col items-center gap-1 rounded-2xl border border-brand-200/60 bg-white/80 px-6 py-4 dark:border-brand-500/20 dark:bg-slate-900/60">
            <span className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">
              Tudo isso por apenas
            </span>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              R$ {monthlyEquiv.toFixed(2).replace('.', ',')}
              <span className="text-base font-semibold text-slate-500 dark:text-slate-400">/mês</span>
            </p>
          </div>

          <div>
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
              <span className="btn-arrow-bg absolute right-3">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <RefundNote className="mt-4" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
