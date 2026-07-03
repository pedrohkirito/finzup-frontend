'use client';

import { ChevronRight, XCircle, CheckCircle2 } from 'lucide-react';
import { type BillingPlanId } from '@/constants/billing-plans';

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
    solution: 'O Finzup foi feito para quem quer sistema automático, não mais uma planilha digital.',
  },
];

interface PainTruthSectionProps {
  onCta: (plan?: BillingPlanId) => void;
}

export function PainTruthSection({ onCta }: PainTruthSectionProps) {
  return (
    <section className="bg-slate-900 py-16 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest uppercase brand-gradient-text-light">
            A verdade que ninguém te conta
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Por que controlar finanças é tão{' '}
            <span className="brand-gradient-text-light">difícil na prática</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Não é falta de disciplina. É falta de sistema automático. Veja o que acontece na vida real.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-2">
          {painPoints.map(({ pain, solution }, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6"
            >
              <div className="mb-3 flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <p className="text-sm leading-relaxed text-slate-300">{pain}</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-brand-green-950/40 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green-400" />
                <p className="text-sm leading-relaxed text-brand-green-200">{solution}</p>
              </div>
            </div>
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
          <p className="mt-3 text-sm text-slate-500">Cancele quando quiser · PIX ou cartão</p>
        </div>
      </div>
    </section>
  );
}
