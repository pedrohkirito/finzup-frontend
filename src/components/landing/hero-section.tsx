import { Sparkles, ChevronRight } from 'lucide-react';
import { BILLING_PLANS, monthlyEquivalent } from '@/constants/billing-plans';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

export function HeroSection() {
  const annualEquiv = monthlyEquivalent(
    BILLING_PLANS.annual.total,
    BILLING_PLANS.annual.intervalMonths,
  );
  const priceLabel = annualEquiv.toFixed(2).replace('.', ',');

  return (
    <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-500/10 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            A partir de R$ {priceLabel}/mês · cancele quando quiser
          </div>

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Pare de recomeçar do zero{' '}
            <span className="brand-gradient-text">todo mês</span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-slate-600 sm:mb-10 sm:text-xl dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">Assistente de IA</span>{' '}
            que responde suas dúvidas sobre o seu dinheiro.
            <br />
            Cadastre uma vez — o Finzup repete tudo no mês seguinte.
          </p>

          <a
            href="#pricing"
            onClick={() =>
              trackLandingCtaClick({
                ctaLocation: 'hero',
                ctaLabel: 'Começar agora',
                action: 'scroll_to_pricing',
              })
            }
            className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-10 py-5 pr-14 text-base font-semibold"
          >
            Começar agora
            <span className="btn-arrow-bg absolute right-3.5"><ChevronRight className="h-4 w-4" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
