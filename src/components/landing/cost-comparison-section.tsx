'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BillingPlanId, BILLING_PLANS, monthlyEquivalent } from '@/constants/billing-plans';

const alternatives = [
  { name: 'Planilha manual', cost: 'R$ 0 + horas perdidas', hasAuto: false, hasVisual: false, hasHistory: false },
  { name: 'Apps genéricos', cost: '~R$ 20–40/mês', hasAuto: false, hasVisual: true, hasHistory: true },
  { name: 'Consultor financeiro', cost: '~R$ 200+/mês', hasAuto: false, hasVisual: true, hasHistory: true },
];

interface CostComparisonSectionProps {
  onCta: (plan?: BillingPlanId) => void;
}

export function CostComparisonSection({ onCta }: CostComparisonSectionProps) {
  const annualPlan = BILLING_PLANS.annual;
  const monthlyEquiv = monthlyEquivalent(annualPlan.total, annualPlan.intervalMonths);

  return (
    <section className="bg-white py-16 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="mb-3 text-sm font-semibold tracking-widest text-brand-500 uppercase">
            Faça as contas
          </p>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Quanto você pagaria por cada alternativa?
          </h2>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Compare as opções disponíveis e veja onde o Finzup se encaixa.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-800">
          <ScrollArea orientation="horizontal">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Alternativa
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Custo/mês
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Recorrência auto
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Visual
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Histórico
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {alternatives.map(({ name, cost, hasAuto, hasVisual, hasHistory }) => (
                  <tr key={name} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{name}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{cost}</td>
                    <td className="px-4 py-4 text-center">
                      {hasAuto ? (
                        <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {hasVisual ? (
                        <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {hasHistory ? (
                        <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-red-400" />
                      )}
                    </td>
                  </tr>
                ))}

                {/* Finzup row - highlighted */}
                <tr className="bg-brand-50 ring-2 ring-inset ring-brand-500 dark:bg-brand-950/30 dark:ring-brand-700">
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-brand-700 dark:text-brand-300">
                        Finzup (plano anual)
                      </p>
                      <p className="text-xs text-brand-600/70 dark:text-brand-400/70">
                        Sua melhor opção
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm font-extrabold text-brand-700 dark:text-brand-300">
                      R$ {monthlyEquiv.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-brand-600/70 dark:text-brand-400/70">por mês</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Check className="mx-auto h-5 w-5 text-brand-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Tudo reunido por{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            menos que um café por mês
          </span>{' '}
          — com recorrência automática que planilha nunca vai te dar.
        </p>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onCta('annual')}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-200/60 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg dark:shadow-brand-900/50"
          >
            Ver planos e assinar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
