'use client';

import {
  Bot,
  Check,
  ChevronRight,
  MessageSquarePlus,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

const knowledge = [
  {
    icon: Wallet,
    label: 'Menor dívida',
    value: 'Cartão · R$ 1.800',
    tone: 'alert' as const,
  },
  {
    icon: PiggyBank,
    label: '13º salário',
    value: 'R$ 2.400 recebido',
    tone: 'info' as const,
  },
  {
    icon: Target,
    label: 'Próximo passo',
    value: 'Quitar ainda este mês',
    tone: 'success' as const,
  },
];

const capabilities = [
  {
    icon: MessageSquarePlus,
    title: 'Cadastra por conversa',
    detail: 'Fala o valor. Ele lança no lugar certo.',
  },
  {
    icon: Wallet,
    title: 'Sabe quantas parcelas faltam',
    detail: 'Sem abrir planilha. Sem adivinhar.',
  },
  {
    icon: Target,
    title: 'Aponta onde cortar',
    detail: 'Com nome, valor e motivo.',
  },
  {
    icon: Check,
    title: 'Monta o plano de quitação',
    detail: 'Ordem certa. Próximo passo claro.',
  },
  {
    icon: TrendingUp,
    title: 'Projeta seu patrimônio',
    detail: 'O que muda se você agir agora.',
  },
  {
    icon: Sparkles,
    title: 'Sugere antes de perguntar',
    detail: 'Enxerga a oportunidade no seu mês.',
  },
];

const planBreakdown = [
  { label: 'Generosidade', value: 'R$ 240', pct: '10%' },
  { label: 'Dívida menor', value: 'R$ 1.800', pct: 'quita' },
  { label: 'Sobrou', value: 'R$ 360', pct: 'reserva' },
];

export function AiAssistantSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-1/4 right-0 h-[520px] w-[520px] translate-x-1/3 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[420px] w-[420px] -translate-x-1/4 translate-y-1/3 rounded-full bg-brand-green-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(3,182,230,0.07)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300">
            <Bot className="h-3.5 w-3.5" aria-hidden />
            Assistente de IA
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Um assistente que conhece os{' '}
            <span className="brand-gradient-text-light">seus números</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
            Não é chat genérico. Ele lê o seu mês, a sua dívida e o seu próximo passo —
            e responde com valor, ordem e decisão.
          </p>
        </div>

        {/* Stage: knowledge chips + chat */}
        <div className="relative mx-auto max-w-3xl">
          {/* Knowledge chips — gatilhos visuais */}
          <div className="mb-5 flex flex-wrap items-stretch justify-center gap-2.5 sm:mb-7 sm:gap-3">
            {knowledge.map((item, index) => (
              <div
                key={item.label}
                className="ai-float inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.35}s` }}
              >
                <span
                  className={
                    item.tone === 'success'
                      ? 'flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green-500/15 text-brand-green-400'
                      : item.tone === 'alert'
                        ? 'flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400'
                        : 'flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300'
                  }
                >
                  <item.icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="min-w-0 text-left leading-tight">
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
                <span
                  className={
                    item.tone === 'success'
                      ? 'ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green-400'
                      : item.tone === 'alert'
                        ? 'ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400'
                        : 'ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400'
                  }
                  aria-hidden
                />
              </div>
            ))}
          </div>

          {/* Chat — container de interação */}
          <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_30px_80px_-40px_rgba(3,182,230,0.45)]">
            {/* Chrome */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-green-500 text-white shadow-md shadow-brand-500/30">
                  <Bot className="h-4 w-4" aria-hidden />
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-brand-green-400" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-white">Finzup Assistente</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-brand-green-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green-400" />
                    Online · lê o seu mês agora
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:inline">
                Seus dados
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="ai-msg flex justify-end" style={{ animationDelay: '120ms' }}>
                <p className="max-w-[88%] rounded-2xl rounded-tr-md bg-brand-500/25 px-4 py-3 text-sm leading-relaxed text-brand-100 sm:max-w-[80%]">
                  Recebi um 13º de{' '}
                  <span className="font-bold text-white">R$ 2.400</span>. O que eu faço?
                </p>
              </div>

              <div className="ai-msg flex justify-start gap-2.5" style={{ animationDelay: '380ms' }}>
                <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-green-500 text-white sm:flex">
                  <Bot className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="max-w-[92%] space-y-3 sm:max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-md bg-white/[0.08] px-4 py-3.5 text-sm leading-relaxed text-slate-200">
                    Separe{' '}
                    <span className="font-bold text-brand-green-300">R$ 240 (10%)</span> para
                    generosidade. Do restante,{' '}
                    <span className="font-bold text-brand-300">R$ 1.800</span> vai para a sua
                    dívida de menor saldo — você a quita ainda este mês.
                  </div>

                  {/* Breakdown visual */}
                  <div className="grid grid-cols-3 gap-2">
                    {planBreakdown.map((row) => (
                      <div
                        key={row.label}
                        className="rounded-xl border border-white/[0.06] bg-slate-950/60 px-2.5 py-2 text-center"
                      >
                        <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                          {row.label}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-white">{row.value}</p>
                        <p className="text-[10px] font-semibold text-brand-400">{row.pct}</p>
                      </div>
                    ))}
                  </div>

                  <p className="px-1 text-sm text-slate-400">Confirma?</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-green-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/25">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      Confirmar plano
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-400">
                      Ajustar valores
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-msg flex justify-end" style={{ animationDelay: '640ms' }}>
                <p className="rounded-2xl rounded-tr-md bg-brand-500/25 px-4 py-3 text-sm text-brand-100">
                  Confirmo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mx-auto mt-14 max-w-4xl sm:mt-20">
          <div className="mb-6 flex items-center gap-4 sm:mb-8">
            <div
              className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
              aria-hidden
            />
            <span className="shrink-0 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">
              O que ele faz por você
            </span>
            <div
              className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
              aria-hidden
            />
          </div>

          <ul className="mx-auto grid max-w-[860px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {capabilities.map((item, index) => (
              <li
                key={item.title}
                className="group relative flex items-start gap-3.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/35 hover:bg-white/[0.05] sm:gap-4 sm:px-5 sm:py-4"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 transition-colors duration-200 group-hover:bg-brand-500/20 group-hover:text-brand-200">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="relative min-w-0 flex-1 pt-0.5">
                  <div className="mb-0.5 flex items-baseline gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-brand-500/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm font-semibold text-white transition-colors duration-200 group-hover:text-brand-100 sm:text-base">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-sm leading-snug text-slate-500 transition-colors duration-200 group-hover:text-slate-400">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 text-center sm:mt-16">
          <a
            href="#pricing"
            onClick={() =>
              trackLandingCtaClick({
                ctaLocation: 'ai_assistant',
                ctaLabel: 'Começar agora',
                action: 'scroll_to_pricing',
              })
            }
            className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-base font-semibold"
          >
            Começar agora
            <span className="btn-arrow-bg absolute right-3">
              <ChevronRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
