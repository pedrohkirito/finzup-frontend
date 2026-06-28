import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BILLING_PLANS, monthlyEquivalent } from '@/constants/billing-plans';

export function HeroSection() {
  const annualEquiv = monthlyEquivalent(
    BILLING_PLANS.annual.total,
    BILLING_PLANS.annual.intervalMonths,
  );
  const priceLabel = annualEquiv.toFixed(2).replace('.', ',');

  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            A partir de R$ {priceLabel}/mês · cancele quando quiser
          </div>

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Pare de recomeçar do zero{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-green-500 bg-clip-text text-transparent">
              todo mês
            </span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-slate-600 sm:mb-10 sm:text-xl dark:text-slate-400">
            Cadastre receitas, despesas fixas e orçamentos{' '}
            <span className="font-semibold text-slate-900 dark:text-white">uma única vez.</span>{' '}
            O Finzup repete tudo no mês seguinte — sem planilha, sem esforço, sem surpresa no fim do mês.
          </p>

          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-200/60 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-300/50 dark:shadow-brand-900/50"
          >
            Começar agora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green-500" />
              PIX ou cartão
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green-500" />
              Cancele quando quiser
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green-500" />
              Pagamento seguro via Asaas
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
