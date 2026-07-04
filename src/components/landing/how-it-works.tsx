import { UserPlus, CalendarCheck, LineChart } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastre uma vez',
    description:
      'Adicione salário, contas fixas, orçamentos e demais lançamentos do seu mês — leva poucos minutos.',
  },
  {
    icon: CalendarCheck,
    title: 'O próximo mês já vem pronto',
    description:
      'Ao fechar o mês, receitas, despesas recorrentes e orçamentos são gerados automaticamente — você só ajusta o que mudou.',
  },
  {
    icon: LineChart,
    title: 'Acompanhe em tempo real',
    description:
      'Veja saldo, orçamentos e relatórios visuais e tire dúvidas com o Assistente de IA para decidir com clareza.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-slate-200 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-4 sm:text-4xl dark:text-white">
            Configure uma vez. O Finzup cuida do resto.
          </h2>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Sem planilha, sem recomeçar do zero todo mês.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mb-2 inline-block text-sm font-bold brand-gradient-text">
                Passo {index + 1}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
