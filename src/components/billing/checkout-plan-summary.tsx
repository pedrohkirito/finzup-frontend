import { CalendarClock, Check, CreditCard, ShieldCheck, Unlock } from 'lucide-react';
import { TRIAL_DAYS } from '@/constants/billing';
import {
  BILLING_PLANS,
  type BillingPlanId,
  formatBRL,
  formatPriceParts,
  monthlyEquivalent,
} from '@/constants/billing-plans';

interface CheckoutPlanSummaryProps {
  planId: BillingPlanId;
}

const timeline = [
  {
    icon: Unlock,
    title: 'Hoje',
    description: 'Acesso completo. Nenhuma cobrança no cartão.',
  },
  {
    icon: CalendarClock,
    title: `${TRIAL_DAYS} dias grátis`,
    description: 'Use tudo à vontade. Cancele quando quiser.',
  },
  {
    icon: CreditCard,
    title: `Após o teste`,
    description: 'Cobrança automática do plano escolhido.',
  },
];

export function CheckoutPlanSummary({ planId }: CheckoutPlanSummaryProps) {
  const plan = BILLING_PLANS[planId];
  const monthly = monthlyEquivalent(plan.total, plan.intervalMonths);
  const { int, dec } = formatPriceParts(plan.total);
  const intervalSuffix =
    plan.intervalMonths === 1 ? '/mês' : plan.intervalMonths === 6 ? '/semestre' : '/ano';

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Resumo do pedido
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Plano {plan.label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
        </div>

        <div className="space-y-0 divide-y divide-slate-100 px-5 dark:divide-slate-800">
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Cobrança hoje</span>
            <span className="text-lg font-bold text-brand-green-600 dark:text-brand-green-400">R$ 0,00</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <span className="text-sm text-slate-600 dark:text-slate-400">Após o teste gratuito</span>
            </div>
            <div className="text-right">
              <div className="flex items-end justify-end gap-0.5">
                <span className="pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">R$</span>
                <span className="text-2xl font-extrabold leading-none text-slate-900 dark:text-white">
                  {int}
                  <span className="text-lg">,{dec}</span>
                </span>
                <span className="pb-0.5 text-xs text-slate-500 dark:text-slate-400">{intervalSuffix}</span>
              </div>
              {plan.intervalMonths > 1 && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                  Equivalente a R$ {formatBRL(monthly)}/mês
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-5 dark:border-brand-900/60 dark:bg-brand-950/20">
        <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Como funciona o teste</p>
        <ol className="space-y-4">
          {timeline.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-brand-200 dark:bg-slate-900 dark:text-brand-400 dark:ring-brand-800">
                <step.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  <span className="mr-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {index + 1}.
                  </span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <ul className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
        {[
          'Cancele em 1 clique, sem burocracia',
          'Sem taxa de cancelamento',
          'Seus dados protegidos e criptografados',
        ].map((text) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <Check className="h-4 w-4 flex-shrink-0 text-brand-green-500" />
            {text}
          </li>
        ))}
        <li className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-brand-green-500" />
          Garantia de {TRIAL_DAYS} dias para experimentar
        </li>
      </ul>
    </div>
  );
}
