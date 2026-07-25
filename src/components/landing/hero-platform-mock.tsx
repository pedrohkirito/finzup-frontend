import { ArrowRight, CheckCircle2, Circle, Lock, Sparkles } from 'lucide-react';

const steps = [
  { step: 1, title: 'Fundo inicial', status: 'completed' as const },
  { step: 2, title: 'Bola de neve', status: 'current' as const },
  { step: 3, title: 'Reserva', status: 'locked' as const },
  { step: 4, title: 'Investir', status: 'locked' as const },
  { step: 5, title: 'Casa própria', status: 'locked' as const },
  { step: 6, title: 'Prosperar', status: 'locked' as const },
];

export function HeroPlatformMock() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.22)_0%,transparent_68%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.18)_0%,transparent_68%)]"
        aria-hidden
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-2xl shadow-brand-500/15 ring-1 ring-black/5 dark:border-white/10 dark:ring-white/5">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-slate-500">
            app.finzup.com.br/dashboard/metodo
          </div>
        </div>

        <div className="space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-5">
          {/* Passo atual */}
          <div className="rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-brand-green-500/5 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-brand-300 uppercase">
              Você está aqui
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-white">
              Passo 2 — Bola de neve
            </p>
            <p className="mt-1 text-sm text-slate-400">Atacar a menor dívida agora</p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-[62%] rounded-full bg-gradient-to-r from-brand-500 to-brand-green-500"
                aria-hidden
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25">
                Atacar dívida
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                Pedir plano à IA
              </span>
            </div>
          </div>

          {/* Caminho compacto */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Seu caminho
            </p>
            <div className="space-y-1.5">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className={
                    step.status === 'current'
                      ? 'flex items-center gap-2.5 rounded-lg border border-brand-500/35 bg-white/[0.04] px-3 py-2'
                      : step.status === 'completed'
                        ? 'flex items-center gap-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2'
                        : 'flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 opacity-50'
                  }
                >
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                  {step.status === 'current' && (
                    <Circle className="h-4 w-4 shrink-0 fill-brand-500 text-brand-500" />
                  )}
                  {step.status === 'locked' && (
                    <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                  )}
                  <span
                    className={
                      step.status === 'locked'
                        ? 'text-sm text-slate-500'
                        : 'text-sm font-medium text-white'
                    }
                  >
                    {step.step}. {step.title}
                  </span>
                  {step.status === 'current' && (
                    <span className="ml-auto rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      Atual
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
