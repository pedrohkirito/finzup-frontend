import { ChevronRight } from 'lucide-react';
import { HeroPlatformMock } from '@/components/landing/hero-platform-mock';
import { RefundNote } from '@/components/landing/refund-note';
import { BILLING_PLANS, BLACK_FRIDAY_PROMO, formatBRL } from '@/constants/billing-plans';

export function HeroSection({ onCheckout }: { onCheckout: () => void }) {
  return (
    <section
      data-landing-section="hero"
      className="relative overflow-hidden pt-36 pb-10 sm:pt-44 sm:pb-16 lg:pb-20"
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-0 left-1/2 h-[640px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[420px] w-[420px] translate-x-1/4 translate-y-1/4 rounded-full bg-brand-green-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(3,182,230,0.12)_0%,transparent_55%)]" />
        {/* Fade suave para a próxima seção */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-950 sm:h-56" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center lg:max-w-5xl">
          {BLACK_FRIDAY_PROMO.active && (
            <a
              href="#pricing"
              className="hero-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/70 px-3 py-1.5 text-xs font-semibold text-amber-200"
            >
              <span className="font-black tracking-widest text-amber-300">BLACK FRIDAY</span>
              <span>
                Anual de{' '}
                <span className="line-through opacity-70">
                  R$ {formatBRL(BILLING_PLANS.annual.compareAt ?? 0)}
                </span>{' '}
                por R$ {formatBRL(BILLING_PLANS.annual.total)}
              </span>
            </a>
          )}
          <h1
            className="hero-reveal text-balance text-[2.15rem] leading-[1.12] font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.08] xl:text-7xl"
            style={{ animationDelay: '0ms' }}
          >
            Seu dinheiro está sumindo
            <br className="hidden sm:block" />{' '}
            <span className="brand-gradient-text-light">e você não sabe o porquê?</span>
          </h1>

          <p
            className="hero-reveal mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:mt-7 sm:text-lg lg:text-xl"
            style={{ animationDelay: '140ms' }}
          >
            A Finzup organiza tudo num só lugar e aponta o próximo passo.
          </p>

          <div className="hero-reveal mt-8 sm:mt-10" style={{ animationDelay: '280ms' }}>
            <button
              type="button"
              onClick={onCheckout}
              className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-10 py-5 pr-14 text-base font-semibold"
            >
              Quero descobrir
              <span className="btn-arrow-bg absolute right-3.5">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <RefundNote className="mt-4 text-slate-400" />
          </div>
        </div>

        <div
          className="hero-reveal relative mx-auto mt-12 w-full max-w-2xl sm:mt-16 sm:max-w-3xl lg:mt-20 lg:max-w-5xl"
          style={{ animationDelay: '400ms' }}
        >
          <HeroPlatformMock />
        </div>
      </div>

      {/* Máscara em primeiro plano — apaga o corte da sombra do print na borda da seção */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-slate-950 sm:h-44 lg:h-56"
        aria-hidden
      />
    </section>
  );
}
