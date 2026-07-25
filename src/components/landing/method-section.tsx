import { ChevronRight, Sparkles } from 'lucide-react';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

const outcomes = [
  'Dívidas saindo de verdade',
  'Dinheiro sobrando no fim do mês',
  'Reserva formada',
  'Liberdade de não depender do próximo salário',
];

export function MethodSection() {
  return (
    <section id="metodo" className="relative overflow-hidden bg-slate-950 pt-16 pb-24 sm:pt-20 sm:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/3 rounded-full bg-brand-green-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-brand-300 uppercase">
          Como funciona
        </p>

        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Existe um caminho.
          <br />
          <span className="brand-gradient-text-light">E ele já tirou milhões das dívidas.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Adaptação brasileira do método de{' '}
          <span className="font-semibold text-white">Dave Ramsey</span>.
        </p>

        <ul className="mx-auto mt-14 max-w-md space-y-4 text-left">
          {outcomes.map((outcome) => (
            <li key={outcome} className="flex items-center gap-3 text-lg text-slate-200">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-green-400" />
              {outcome}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-16 max-w-lg">
          <Sparkles className="mx-auto mb-4 h-5 w-5 text-brand-300" />
          <p className="text-xl font-semibold text-white sm:text-2xl">
            Não vamos te entregar o método aqui.
          </p>
          <p className="mt-3 text-base text-slate-400">
            Quando você entra, ele já está montado com os seus números.
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
            <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
