import { CalendarClock, Check, CreditCard, Lock, Sparkles } from 'lucide-react';

const timeline = [
  {
    icon: Sparkles,
    title: 'Hoje',
    description: 'Escolha o plano e pague com PIX ou cartão — acesso liberado na hora.',
  },
  {
    icon: CalendarClock,
    title: 'Todo mês',
    description: 'Receitas, despesas e orçamentos repetem automaticamente, sem recomeçar do zero.',
  },
  {
    icon: CreditCard,
    title: 'Quando quiser',
    description: 'Cancele em 1 clique. Sem multa, sem burocracia.',
  },
];

const badges = [
  { icon: Check, text: 'PIX ou cartão' },
  { icon: Check, text: 'Cancele quando quiser' },
  { icon: Lock, text: 'Pagamento seguro' },
];

export function TrialTrust() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 backdrop-blur-xl sm:p-6 dark:border-white/[0.1] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(2,6,23,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="grid gap-4 sm:grid-cols-3">
        {timeline.map((step) => (
          <div key={step.title} className="flex gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
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

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:gap-6 dark:border-white/[0.08]">
        {badges.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
