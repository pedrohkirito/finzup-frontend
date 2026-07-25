import { ArrowRight, CheckCircle2, Circle, Lock, Sparkles } from 'lucide-react';

const steps = [
  { step: 1, title: 'Fundo inicial', status: 'completed' as const },
  { step: 2, title: 'Bola de neve', status: 'current' as const, progress: 62 },
  { step: 3, title: 'Reserva completa', status: 'locked' as const },
  { step: 4, title: 'Investir 15%', status: 'locked' as const },
  { step: 5, title: 'Casa própria', status: 'locked' as const },
  { step: 6, title: 'Prosperar', status: 'locked' as const },
];

export function MethodPreviewMock() {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(2,146,184,0.18)_0%,transparent_65%)] blur-2xl"
        aria-hidden
      />

      {/* Browser frame */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-brand-500/10 ring-1 ring-white/5">
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-slate-500 sm:text-xs">
            app.finzup.com.br/dashboard/metodo
          </div>
        </div>

        <div className="space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6">
          {/* Current step hero */}
          <div className="rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-brand-green-500/5 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold tracking-wide text-brand-300 uppercase">
                  Você está aqui
                </p>
                <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  Passo 2 — Bola de neve
                </p>
                <p className="text-sm text-slate-400">
                  Faça agora: Atacar a menor dívida
                </p>
                <div className="mt-1 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full w-[62%] rounded-full bg-gradient-to-r from-brand-500 to-brand-green-500"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25">
                  Atacar dívida
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                  Pedir plano à IA
                </span>
              </div>
            </div>
          </div>

          {/* Journey */}
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Jornada dos 6 passos
            </p>
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className={
                    step.status === 'current'
                      ? 'flex gap-3 rounded-xl border border-brand-500/35 bg-white/[0.04] p-3 shadow-sm shadow-brand-500/10 sm:p-3.5'
                      : step.status === 'completed'
                        ? 'flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-3.5'
                        : 'flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 opacity-60 sm:p-3.5'
                  }
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                    {step.status === 'current' && (
                      <Circle className="h-5 w-5 fill-brand-500 text-brand-500" />
                    )}
                    {step.status === 'locked' && (
                      <Lock className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        Passo {step.step}: {step.title}
                      </p>
                      {step.status === 'current' && (
                        <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                          Atual
                        </span>
                      )}
                    </div>
                    {step.status === 'current' && (
                      <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full w-[62%] rounded-full bg-brand-500"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
