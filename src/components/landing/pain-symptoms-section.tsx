import { AlertTriangle } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';

const symptoms = [
  'O salário acaba antes do fim do mês',
  'A fatura do cartão nunca para de crescer',
  'Você paga sempre o mínimo, nunca o total',
  'Já usou um empréstimo pra pagar outro',
  'Não sabe dizer quanto deve, no total',
  'Sente um aperto no peito ao abrir o extrato',
  'Dinheiro já virou discussão em casa',
  'Qualquer imprevisto vira dívida nova',
];

export function PainSymptomsSection() {
  return (
    <section data-landing-section="pain_symptoms" className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,146,184,0.08)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center sm:mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Se isso acontece com você,
            <br />
            <span className="brand-gradient-text-light">continua lendo</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-400 sm:text-lg">
            A maioria das pessoas vive presa nesse ciclo sem saber por quê.
          </p>
        </Reveal>

        <ul className="mx-auto mb-14 grid max-w-[860px] grid-cols-1 gap-5 sm:mb-16 sm:grid-cols-2 sm:gap-6">
          {symptoms.map((text, i) => (
            <Reveal key={text} as="li" delay={i * 60}>
              <div className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/35 hover:bg-white/[0.05] sm:gap-4 sm:px-5 sm:py-4">
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />
                <span
                  className="relative shrink-0 self-center font-extrabold text-[2.5rem] leading-none tracking-tight text-brand-500/20 transition-colors duration-200 group-hover:text-brand-500/35 sm:text-[2.8rem]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative flex items-start gap-2.5 pt-0.5">
                  <AlertTriangle
                    className="mt-1 h-[18px] w-[18px] shrink-0 text-brand-400 opacity-80"
                    aria-hidden
                  />
                  <span className="text-base font-medium leading-relaxed text-slate-300 transition-colors duration-200 group-hover:text-white">
                    {text}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200} className="mx-auto flex max-w-3xl flex-col items-center gap-3">
          <div
            className="h-px w-16 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
            aria-hidden
          />
          <p className="text-center text-lg text-slate-300 sm:whitespace-nowrap sm:text-xl">
            Se marcou pelo menos <strong className="font-extrabold text-brand-400">um</strong> desses,
            o problema não é você. É o <strong className="font-extrabold text-brand-400">método</strong>.
          </p>
          <div
            className="h-px w-16 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
            aria-hidden
          />
        </Reveal>
      </div>
    </section>
  );
}
