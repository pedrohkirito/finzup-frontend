import { ChevronRight } from 'lucide-react';
import { HeroPlatformMock } from '@/components/landing/hero-platform-mock';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pb-28">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-[420px] w-[680px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Copy */}
          <div className="mx-auto flex max-w-xl flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left">
            <p
              className="hero-reveal mb-6 text-4xl font-extrabold tracking-tight brand-gradient-text sm:mb-8 sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '0ms' }}
            >
              Finzup
            </p>

            <h1 className="w-full">
              <span
                className="hero-reveal block text-lg leading-snug font-semibold tracking-tight text-slate-500 sm:text-xl dark:text-slate-400"
                style={{ animationDelay: '120ms' }}
              >
                Você não está travado porque{' '}
                <span className="text-slate-400 decoration-brand-500/45 line-through decoration-2 dark:text-slate-500">
                  gasta demais
                </span>
                .
              </span>

              <span
                className="hero-reveal my-5 flex items-center justify-center gap-3 lg:justify-start"
                style={{ animationDelay: '240ms' }}
                aria-hidden
              >
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-500/40 sm:w-14" />
                <span className="h-1.5 w-1.5 rotate-45 bg-brand-500/70" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-green-500/40 sm:w-14" />
              </span>

              <span
                className="hero-reveal block text-3xl leading-[1.2] font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] xl:text-5xl dark:text-white"
                style={{ animationDelay: '320ms' }}
              >
                Está travado porque
                <br />
                <span className="brand-gradient-text">ninguém te mostrou o caminho</span>.
              </span>
            </h1>

            <p
              className="hero-reveal mt-6 max-w-md text-base leading-relaxed text-slate-600 sm:mt-8 sm:text-lg dark:text-slate-400"
              style={{ animationDelay: '440ms' }}
            >
              Existe um método claro. E ele começa pelo próximo passo certo.
            </p>

            <div className="hero-reveal mt-8 sm:mt-10" style={{ animationDelay: '560ms' }}>
              <a
                href="#metodo"
                onClick={() =>
                  trackLandingCtaClick({
                    ctaLocation: 'hero',
                    ctaLabel: 'Quero sair das dívidas',
                    action: 'scroll_to_section',
                  })
                }
                className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-10 py-5 pr-14 text-base font-semibold"
              >
                Quero sair das dívidas
                <span className="btn-arrow-bg absolute right-3.5">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>

          {/* Platform visual */}
          <div
            className="hero-reveal relative mx-auto w-full max-w-md sm:max-w-lg lg:mx-0 lg:max-w-none"
            style={{ animationDelay: '280ms' }}
          >
            <HeroPlatformMock />
          </div>
        </div>
      </div>
    </section>
  );
}
