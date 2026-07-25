'use client';

import { Bot, ChevronRight } from 'lucide-react';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

const capabilities = [
  'Cadastra por conversa',
  'Sabe quantas parcelas faltam',
  'Aponta onde cortar — com nome e valor',
  'Monta o plano de quitação',
  'Projeta seu patrimônio',
  'Sugere antes de você perguntar',
];

export function AiAssistantSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/3 rounded-full bg-brand-green-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300">
            <Bot className="h-3.5 w-3.5" />
            Assistente de IA
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Um assistente que conhece os{' '}
            <span className="brand-gradient-text-light">seus números</span>
          </h2>
        </div>

        <div className="mx-auto mb-14 max-w-xl sm:mb-16">
          <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-7">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-500/25 px-4 py-3 text-sm text-brand-100">
                Recebi um 13º de R$ 2.400. O que eu faço?
              </p>
            </div>
            <div className="flex justify-start">
              <p className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[0.08] px-4 py-3 text-sm leading-relaxed text-slate-200">
                Separe R$ 240 (10%) para generosidade. Do restante, R$ 1.800 vai para a sua dívida
                de menor saldo — você a quita ainda este mês. Confirma?
              </p>
            </div>
            <div className="flex justify-end">
              <p className="rounded-2xl rounded-tr-sm bg-brand-500/25 px-4 py-3 text-sm text-brand-100">
                Confirmo.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-lg">
          {capabilities.map((text, i) => (
            <div
              key={text}
              className="flex items-baseline gap-4 border-b border-white/[0.06] py-3.5 first:pt-0 last:border-0"
            >
              <span className="font-mono text-sm font-bold tabular-nums text-brand-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-base text-slate-200 sm:text-lg">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
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
            <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
