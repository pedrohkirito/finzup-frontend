import {
  ChevronRight,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Unlock,
} from 'lucide-react';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

const outcomes = [
  {
    icon: TrendingDown,
    title: 'Dívidas saindo de verdade',
    detail: 'Ataque na ordem certa, sem chute.',
  },
  {
    icon: PiggyBank,
    title: 'Dinheiro sobrando no fim do mês',
    detail: 'Sobrou porque o plano cabia na vida real.',
  },
  {
    icon: ShieldCheck,
    title: 'Reserva formada',
    detail: 'Imprevisto deixa de virar dívida nova.',
  },
  {
    icon: Unlock,
    title: 'Liberdade de não depender do próximo salário',
    detail: 'Você decide o próximo passo — não o boleto.',
  },
];

export function MethodSection() {
  return (
    <section id="metodo" data-landing-section="method" className="relative overflow-hidden bg-slate-950 pt-16 pb-24 sm:pt-20 sm:pb-32">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/3 rounded-full bg-brand-green-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-brand-300 uppercase">
            Como funciona
          </p>

          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Existe um caminho.
            <br />
            <span className="brand-gradient-text-light">E ele já tirou milhões das dívidas.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Um método criado pela{' '}
            <span className="font-semibold text-white">Finzup</span>, baseado no método de{' '}
            <span className="font-semibold text-white">Dave Ramsey</span>.
          </p>
        </div>

        {/* Path label */}
        <div className="mx-auto mt-14 mb-8 flex max-w-md items-center gap-4 sm:mt-16">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
            aria-hidden
          />
          <span className="shrink-0 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">
            O que muda no caminho
          </span>
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
            aria-hidden
          />
        </div>

        {/* Visual journey */}
        <ol className="relative mx-auto max-w-lg">
          {/* Connecting line */}
          <div
            className="pointer-events-none absolute top-5 bottom-5 left-[1.375rem] w-px bg-gradient-to-b from-brand-500 via-brand-400 to-brand-green-400 sm:left-6"
            aria-hidden
          />

          {outcomes.map((outcome, index) => {
            const isLast = index === outcomes.length - 1;
            return (
              <li
                key={outcome.title}
                className="group relative flex gap-4 pb-8 last:pb-0 sm:gap-5 sm:pb-10"
              >
                {/* Milestone marker */}
                <div className="relative z-10 flex shrink-0 flex-col items-center">
                  <div
                    className={
                      isLast
                        ? 'flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-green-500 text-white shadow-lg shadow-brand-500/30 ring-4 ring-slate-950 transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12'
                        : 'flex h-11 w-11 items-center justify-center rounded-full border border-brand-500/40 bg-slate-900 text-brand-300 shadow-md shadow-brand-500/10 ring-4 ring-slate-950 transition-all duration-200 group-hover:border-brand-400 group-hover:text-brand-200 sm:h-12 sm:w-12'
                    }
                  >
                    <outcome.icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-1.5 sm:pt-2">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={
                        isLast
                          ? 'font-mono text-[11px] font-bold tracking-wider text-brand-green-400'
                          : 'font-mono text-[11px] font-bold tracking-wider text-brand-500/70'
                      }
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isLast && (
                      <span className="rounded bg-brand-green-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-green-400 uppercase">
                        Destino
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white transition-colors duration-200 group-hover:text-brand-100 sm:text-xl">
                    {outcome.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 transition-colors duration-200 group-hover:text-slate-400 sm:text-base">
                    {outcome.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Tease + CTA */}
        <div className="relative mx-auto mt-16 max-w-lg text-center sm:mt-20">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[220px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,146,184,0.14)_0%,transparent_70%)]"
            aria-hidden
          />

          <span className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-brand-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Dentro da plataforma
          </span>

          <p className="relative text-xl font-semibold text-white sm:text-2xl">
            Quando você entra, o método já está preparado com os seus números.
          </p>

          <a
            href="#plataforma"
            onClick={() =>
              trackLandingCtaClick({
                ctaLocation: 'method',
                ctaLabel: 'Ver o que está incluído',
                action: 'scroll_to_section',
              })
            }
            className="btn-brand-gradient relative mt-8 inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-base font-semibold"
          >
            Ver o que está incluído
            <span className="btn-arrow-bg absolute right-3">
              <ChevronRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
