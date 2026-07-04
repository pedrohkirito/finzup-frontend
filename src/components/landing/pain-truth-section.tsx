'use client';

import { type ReactNode } from 'react';
import { ChevronRight, X, Check } from 'lucide-react';
import { type BillingPlanId } from '@/constants/billing-plans';

const AI_LABEL = 'Assistente de IA';

function withBoldAi(text: string, strongClassName: string): ReactNode {
  if (!text.includes(AI_LABEL)) return text;

  const parts = text.split(AI_LABEL);
  return parts.flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <strong key={index} className={strongClassName}>
            {AI_LABEL}
          </strong>,
          part,
        ],
  );
}

const painPoints = [
  {
    pain: 'Você anota gastos no caderno ou planilha e no dia 1 do mês recomeça tudo do zero.',
    solution: 'No Finzup, receitas e despesas fixas aparecem automaticamente no próximo mês.',
  },
  {
    pain: 'Apps genéricos mostram gráficos bonitos, mas não repetem suas contas fixas sozinhos.',
    solution: 'O Finzup copia recorrências, orçamentos e metas ao fechar o mês — você só ajusta o que mudou.',
  },
  {
    pain: 'Você trabalha o mês inteiro e no fim não sabe para onde foi o salário.',
    solution: 'Cada real tem categoria, orçamento e limite — você vê em tempo real se está no azul ou no vermelho.',
  },
  {
    pain: 'Você já tentou vários aplicativos e nenhum resolveu o problema de verdade.',
    solution:
      'O Finzup foi feito para quem quer sistema automático, não mais uma planilha digital.',
  },
];

interface PainTruthSectionProps {
  onCta: (plan?: BillingPlanId) => void;
}

export function PainTruthSection({ onCta }: PainTruthSectionProps) {
  return (
    <section className="relative bg-slate-900 py-16 pb-20 sm:py-24 sm:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-b from-slate-900/40 to-transparent dark:from-slate-900/60"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="mb-3 text-sm font-semibold tracking-widest uppercase brand-gradient-text-light">
            A verdade que ninguém te conta
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Por que controlar finanças é tão{' '}
            <span className="brand-gradient-text-light whitespace-nowrap">difícil na prática</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            {withBoldAi(
              'Não é falta de disciplina. É falta de sistema automático e de um Assistente de IA que responda suas dúvidas sobre o dinheiro.',
              'font-extrabold text-white',
            )}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 sm:gap-6 md:grid-cols-2">
          {painPoints.map(({ pain, solution }, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-500 ease-in-out hover:border-brand-400/20 hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] sm:px-7 sm:py-7"
            >
              <div className="flex gap-3.5 px-4">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-400/20">
                  <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                </span>
                <p className="text-[15px] leading-relaxed text-red-400">{pain}</p>
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
                <div className="flex gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full brand-gradient-bg shadow-md shadow-brand-green-500/15">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.75} />
                  </span>
                    <p className="text-[15px] font-medium leading-relaxed text-brand-300">
                      {solution}
                    </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => onCta()}
            className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-base font-semibold"
          >
            Quero parar de recomeçar do zero
            <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
          </button>
        </div>
      </div>
    </section>
  );
}
