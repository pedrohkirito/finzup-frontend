import { Compass, LineChart, UserPlus } from 'lucide-react';
import { LandingSummaryMock } from '@/components/landing/summary-mock';

const flow = [
  { icon: UserPlus, title: 'Cadastre uma vez' },
  { icon: Compass, title: 'A Finzup organiza' },
  { icon: LineChart, title: 'Acompanhe em tempo real' },
];

const highlights = [
  'Recorrência automática',
  'Orçamentos em tempo real',
  'Relatórios visuais',
  '5 tipos de despesa',
  'Simulador de investimentos',
  'Cenários de planejamento',
];

export function PlatformSection() {
  return (
    <section id="plataforma" className="border-t border-slate-200 bg-white py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] uppercase brand-gradient-text">
            A plataforma
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            O método na prática
          </h2>
        </div>

        <LandingSummaryMock />

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 sm:mt-20 sm:gap-8">
          {flow.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mb-1 font-mono text-xs font-bold text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                {step.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-2.5 sm:mt-16 sm:gap-3">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
