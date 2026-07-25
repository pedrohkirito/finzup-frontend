import { ChevronRight } from 'lucide-react';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Você não está endividado porque gasta demais.
            <br />
            Está endividado porque{' '}
            <span className="brand-gradient-text">ninguém te mostrou o caminho</span>.
          </h1>

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
            <span className="btn-arrow-bg absolute right-3.5"><ChevronRight className="h-4 w-4" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
