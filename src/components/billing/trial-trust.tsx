import { CalendarClock, Check, CreditCard, Lock, Unlock } from 'lucide-react';
import { TRIAL_DAYS } from '@/constants/billing';

const timeline = [
  {
    icon: Unlock,
    title: 'Hoje',
    description: 'Acesso completo liberado na hora, sem nenhuma cobrança.',
  },
  {
    icon: CalendarClock,
    title: `Durante os ${TRIAL_DAYS} dias`,
    description: 'Use tudo à vontade. Cancele em 1 clique quando quiser.',
  },
  {
    icon: CreditCard,
    title: `Dia ${TRIAL_DAYS}`,
    description: 'Só então começa a cobrança do plano escolhido.',
  },
];

const badges = [
  { icon: Check, text: 'Não cobramos hoje' },
  { icon: Check, text: 'Cancele em 1 clique' },
  { icon: Lock, text: 'Pagamento seguro via Stripe' },
];

export function TrialTrust() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-3">
        {timeline.map((step) => (
          <div key={step.title} className="flex gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <step.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:gap-6 dark:border-slate-800">
        {badges.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 text-brand-green-500" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
