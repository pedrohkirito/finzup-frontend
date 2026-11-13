import { CalendarClock, Check, CreditCard, ShieldCheck } from 'lucide-react';
import {
  BILLING_PLANS,
  type BillingPlanId,
  formatBRL,
  formatPriceParts,
  monthlyEquivalent,
  planPriceIntervalSuffix,
} from '@/constants/billing-plans';

interface CheckoutPlanSummaryProps {
  planId: BillingPlanId;
}

const timeline = [
  {
    icon: CreditCard,
    title: 'Hoje',
    description: 'Pagamento confirmado e acesso liberado.',
  },
  {
    icon: CalendarClock,
    title: 'Renovação automática',
    description: 'Seu plano renova no fim de cada período. Cancele quando quiser.',
  },
  {
    icon: ShieldCheck,
    title: 'Sem surpresas',
    description: 'Preço fixo do plano escolhido. Sem taxas escondidas.',
  },
];

export function CheckoutPlanSummary({ planId }: CheckoutPlanSummaryProps) {
  const plan = BILLING_PLANS[planId];
  const monthly = monthlyEquivalent(plan.total, plan.intervalMonths);
  const { int, dec } = formatPriceParts(plan.total);
  const intervalSuffix = planPriceIntervalSuffix(plan.intervalMonths);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/[0.1] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(2,6,23,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Resumo do pedido
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Plano {plan.label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
        </div>

        <div className="space-y-0 divide-y divide-slate-100 px-5 dark:divide-white/[0.06]">
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total a pagar</span>
            <div className="text-right">
              {plan.compareAt != null && (
                <p className="text-xs font-medium text-slate-400 line-through dark:text-slate-500">
                  R$ {formatBRL(plan.compareAt)}
                  {intervalSuffix}
                </p>
              )}
              <div className="flex items-end justify-end gap-0.5">
                <span className="pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">R$</span>
                <span className="text-2xl font-extrabold leading-none text-slate-900 dark:brand-gradient-text">
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
              <p className="mt-0.5 text-xs text-slate-500">No cartão, o mesmo valor — juros inclusos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-5 dark:border-brand-400/20 dark:bg-brand-500/10">
        <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Como funciona</p>
        <ol className="space-y-4">
          {timeline.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-brand-200 dark:bg-white/[0.06] dark:text-brand-400 dark:ring-brand-400/30">
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

      <ul className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
        {[
          'Cancele em 1 clique, sem burocracia',
          'Sem taxa de cancelamento',
          'Seus dados protegidos e criptografados',
        ].map((text) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <Check className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
