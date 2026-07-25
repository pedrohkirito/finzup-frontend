import {
  ArrowRight,
  BarChart3,
  Compass,
  Heart,
  LineChart,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { LandingSummaryMock } from '@/components/landing/summary-mock';

const flow = [
  {
    icon: UserPlus,
    title: 'Cadastre uma vez',
    detail: 'Receitas, dívidas e metas — do jeito que a vida é.',
  },
  {
    icon: Compass,
    title: 'A Finzup organiza',
    detail: 'O método encaixa os números e aponta o próximo passo.',
  },
  {
    icon: LineChart,
    title: 'Acompanhe em tempo real',
    detail: 'Saldo, progresso e alertas — sem planilha nova todo mês.',
  },
];

const capabilities = [
  { icon: RefreshCw, label: 'Recorrência automática', hint: 'Mês seguinte já montado' },
  { icon: Target, label: 'Orçamentos em tempo real', hint: 'Limite e barra por categoria' },
  { icon: BarChart3, label: 'Relatórios visuais', hint: 'Entenda pra onde foi o dinheiro' },
  { icon: Heart, label: 'Doações organizadas', hint: 'Doações e ofertas no lugar certo' },
  { icon: TrendingUp, label: 'Simulador de investimentos', hint: 'Projete aportes com clareza' },
  { icon: Sparkles, label: 'Cenários de planejamento', hint: 'Teste decisões antes de agir' },
];

const callouts = [
  {
    icon: Wallet,
    label: 'Saldo do mês',
    value: '+ R$ 4.150',
    tone: 'positive' as const,
  },
  {
    icon: PiggyBank,
    label: 'Meta de aporte',
    value: '74% concluída',
    tone: 'progress' as const,
  },
];

export function PlatformSection() {
  return (
    <section
      id="plataforma"
      className="relative overflow-hidden border-t border-slate-200 bg-white py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 left-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-500/15" />
        <div className="absolute right-0 bottom-0 h-[360px] w-[360px] translate-x-1/4 translate-y-1/4 rounded-full bg-brand-green-400/10 blur-3xl dark:bg-brand-green-500/12" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(3,182,230,0.06)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(3,182,230,0.08)_0%,transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] uppercase brand-gradient-text">
            A plataforma
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            O método na prática
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
            Seus números entram. O caminho aparece. Você só segue o próximo passo certo.
          </p>
        </div>

        {/* Flow — jornada visual */}
        <ol className="mx-auto mb-14 grid max-w-4xl grid-cols-1 gap-4 sm:mb-16 sm:grid-cols-3 sm:gap-0">
          {flow.map((step, index) => {
            const isLast = index === flow.length - 1;
            return (
              <li key={step.title} className="relative flex sm:flex-col sm:items-center sm:text-center">
                {/* Connector (desktop) */}
                {!isLast && (
                  <div
                    className="pointer-events-none absolute top-6 right-0 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-brand-400/50 via-brand-500/30 to-brand-green-400/40 sm:block"
                    aria-hidden
                  />
                )}

                <div className="flex w-full items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-col sm:items-center sm:border-transparent sm:bg-transparent sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:dark:border-transparent sm:dark:bg-transparent">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-green-500 text-white shadow-lg shadow-brand-500/25 ring-4 ring-white dark:ring-slate-950">
                    <step.icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1 sm:mt-4">
                    <div className="mb-1.5 flex items-center gap-2 sm:justify-center">
                      <span className="font-mono text-[11px] font-bold tracking-wider text-brand-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {!isLast && (
                        <ArrowRight
                          className="h-3.5 w-3.5 text-brand-400/70 sm:hidden"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-slate-400">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Product stage + floating callouts */}
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:mb-8 sm:gap-4">
            {callouts.map((callout) => (
              <div
                key={callout.label}
                className={
                  callout.tone === 'positive'
                    ? 'inline-flex items-center gap-2.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-2 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/25 dark:bg-emerald-950/50'
                    : 'inline-flex items-center gap-2.5 rounded-full border border-brand-200/80 bg-brand-50/90 px-3.5 py-2 shadow-sm shadow-brand-500/10 dark:border-brand-500/25 dark:bg-brand-950/50'
                }
              >
                <span
                  className={
                    callout.tone === 'positive'
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400'
                  }
                >
                  <callout.icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="pr-1 text-left leading-tight">
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    {callout.label}
                  </p>
                  <p
                    className={
                      callout.tone === 'positive'
                        ? 'text-sm font-bold text-emerald-700 dark:text-emerald-300'
                        : 'text-sm font-bold text-brand-700 dark:text-brand-300'
                    }
                  >
                    {callout.value}
                  </p>
                </div>
                <span
                  className={
                    callout.tone === 'positive'
                      ? 'ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500'
                      : 'ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500'
                  }
                  aria-hidden
                />
              </div>
            ))}
          </div>

          <LandingSummaryMock />
        </div>

        {/* Capabilities — grid organizado, sem cluster de pills */}
        <div className="mx-auto mt-14 max-w-4xl sm:mt-20">
          <div className="mb-6 flex items-center gap-4 sm:mb-8">
            <div
              className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
              aria-hidden
            />
            <span className="shrink-0 text-xs font-bold tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
              O que você vê todo dia
            </span>
            <div
              className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
              aria-hidden
            />
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {capabilities.map((item) => (
              <li
                key={item.label}
                className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300/50 hover:bg-white hover:shadow-[0_10px_28px_-18px_rgba(2,146,184,0.4)] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-brand-500/30 dark:hover:bg-slate-900"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-colors duration-200 group-hover:bg-brand-500/15 group-hover:text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                    {item.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
