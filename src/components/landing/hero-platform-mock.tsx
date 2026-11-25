import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  Footprints,
  Heart,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const nav = [
  { label: 'Resumo', icon: LayoutDashboard, active: true },
  { label: 'Método', icon: Footprints, isNew: true },
  { label: 'Relatórios', icon: BarChart3 },
  { label: 'Receitas', icon: TrendingUp },
  { label: 'Despesas', icon: Receipt },
  { label: 'Categorias', icon: Target },
  { label: 'Planejamento', icon: CalendarRange },
  { label: 'Investimentos', icon: PiggyBank },
  { label: 'Doações', icon: Heart },
  { label: 'Configurações', icon: Settings },
];

const cards = [
  {
    title: 'Receitas',
    value: 'R$ 8.500',
    hint: '4 itens',
    icon: TrendingUp,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
  {
    title: 'Despesas',
    value: 'R$ 4.200',
    hint: '12 itens',
    icon: TrendingDown,
    accent: 'text-orange-400',
    bg: 'bg-orange-500/15',
  },
  {
    title: 'Saldo',
    value: 'R$ 4.150',
    hint: 'Ver composição',
    icon: Wallet,
    accent: 'text-brand-300',
    bg: 'bg-brand-500/15',
  },
  {
    title: 'Fatura',
    value: 'R$ 1.280',
    hint: '5 itens',
    icon: CreditCard,
    accent: 'text-violet-300',
    bg: 'bg-violet-500/15',
  },
];

const journey = [
  { step: 1, done: true },
  { step: 2, done: true },
  { step: 3, done: true },
  { step: 4, current: true },
  { step: 5 },
  { step: 6 },
];

export function HeroPlatformMock() {
  return (
    <div className="relative mx-auto">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-1/2 left-1/2 h-[75%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute right-[5%] bottom-0 h-[50%] w-[45%] rounded-full bg-brand-green-500/20 blur-3xl" />
      </div>

      <div className="hero-mock-float overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-[0_55px_110px_-28px_rgba(3,182,230,0.55),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-brand-400/25 sm:rounded-3xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 sm:px-5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85" />
          </div>
          <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1.5 text-center text-[11px] text-slate-500 sm:text-xs">
            app.finzup.com.br/dashboard
          </div>
        </div>

        <div className="flex min-h-0">
          {/* Sidebar — como no app real */}
          <aside className="hidden w-[11.5rem] shrink-0 border-r border-white/10 bg-slate-950/90 p-3 sm:block lg:w-52 lg:p-4">
            <div className="mb-5 px-2">
              <p className="text-sm font-bold tracking-tight text-white">Finzup</p>
              <p className="text-[10px] text-slate-500">Sua conta</p>
            </div>
            <nav className="space-y-0.5">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={
                      item.active
                        ? 'flex items-center gap-2.5 rounded-lg bg-brand-500/15 px-2.5 py-2 text-sm font-semibold text-brand-300 shadow-[inset_3px_0_0_#38c4eb]'
                        : 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-500'
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.isNew && (
                        <span className="brand-gradient-bg-r shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase shadow-sm shadow-brand-500/30">
                          Novo
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Conteúdo do dashboard */}
          <div className="min-w-0 flex-1 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:space-y-5 sm:p-5 lg:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  Resumo do mês
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">Visão geral das suas finanças</p>
              </div>
              <span className="hidden rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-300 sm:inline">
                Julho · 2026
              </span>
            </div>

            {/* Método Finzup — compass real */}
            <div className="rounded-xl border border-brand-500/35 bg-gradient-to-br from-brand-500/20 via-brand-500/10 to-brand-green-500/10 p-3 shadow-lg shadow-brand-500/10 sm:rounded-2xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-brand-300 sm:gap-2">
                    <Footprints className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
                      Método Finzup
                    </span>
                  </div>
                  <p className="mt-1 text-base font-bold tracking-tight text-white sm:mt-1.5 sm:text-xl">
                    Passo 4 — Investir 15%
                  </p>
                  <p className="mt-0.5 hidden text-sm text-slate-400 sm:mt-1 sm:block">
                    Aportar 15% da renda · Meta R$ 1.275 este mês
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-extrabold tabular-nums text-brand-300 sm:text-3xl">45%</p>
                  <p className="text-[10px] text-slate-500 sm:text-[11px]">do passo</p>
                </div>
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10 sm:mt-3 sm:h-2">
                <div
                  className="hero-bar-fill h-full w-[45%] rounded-full bg-gradient-to-r from-brand-500 to-brand-green-500"
                  aria-hidden
                />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-500/30 sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-sm">
                  Fazer aporte
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
                <span className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 sm:inline-flex">
                  <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                  Pedir plano à IA
                </span>
              </div>

              <div className="mt-3 flex items-center sm:mt-4">
                {journey.map((item, index) => (
                  <div key={item.step} className="flex flex-1 items-center last:flex-none">
                    <span
                      className={
                        item.done
                          ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300 sm:h-7 sm:w-7'
                          : item.current
                            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white shadow-[0_0_0_4px_rgba(3,182,230,0.2)] sm:h-7 sm:w-7 sm:text-xs'
                            : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-slate-500 sm:h-7 sm:w-7 sm:text-xs'
                      }
                    >
                      {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : item.step}
                    </span>
                    {index < journey.length - 1 && (
                      <span
                        className={
                          item.done
                            ? 'mx-1 h-0.5 flex-1 rounded-full bg-emerald-500/40'
                            : 'mx-1 h-0.5 flex-1 rounded-full bg-white/[0.08]'
                        }
                        aria-hidden
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cards do resumo — como no app */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 sm:p-3.5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-400">{card.title}</p>
                      <span className={`rounded-lg p-1.5 ${card.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${card.accent}`} />
                      </span>
                    </div>
                    <p className={`text-base font-bold tracking-tight tabular-nums sm:text-lg ${card.accent}`}>
                      {card.value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{card.hint}</p>
                  </div>
                );
              })}
            </div>

            {/* Meta de investimento */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <PiggyBank className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">Meta de investimento</p>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                      74%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    R$ 1.850 de R$ 2.500 · 3 aportes este mês
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="hero-bar-fill h-full w-[74%] rounded-full bg-emerald-500"
                  style={{ animationDelay: '280ms' }}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
