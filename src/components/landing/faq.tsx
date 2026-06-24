import { Plus } from 'lucide-react';
import { TRIAL_DAYS } from '@/constants/billing';

const faqs = [
  {
    question: 'Preciso cadastrar cartão para testar?',
    answer: `Sim, mas você não é cobrado nada durante os ${TRIAL_DAYS} dias de teste. A cobrança só acontece ao fim do período — e se cancelar antes, não paga nada.`,
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Pode. O cancelamento é feito em poucos cliques, sem taxa e sem precisar falar com ninguém. Você mantém o acesso até o fim do período já pago.',
  },
  {
    question: 'Meus dados financeiros estão seguros?',
    answer:
      'Sim. Seus dados trafegam de forma criptografada e são tratados com privacidade total. Nunca vendemos ou compartilhamos suas informações.',
  },
  {
    question: 'Funciona no celular?',
    answer:
      'Sim. O Finzup funciona em qualquer dispositivo com navegador — celular, tablet ou computador — com a mesma experiência.',
  },
  {
    question: 'Preciso recadastrar tudo todo mês?',
    answer:
      'Não. Marque lançamentos com "Repetir todo mês", use despesas fixas e defina seus orçamentos uma vez. Ao fechar o mês, o Finzup copia receitas, despesas recorrentes, doações e meta de investimentos para o mês seguinte — você só ajusta o que mudou.',
  },
  {
    question: 'Preciso entender de finanças para usar?',
    answer:
      'Não. O Finzup foi feito para ser simples desde o primeiro acesso. Você registra receitas e despesas e a gente cuida de organizar tudo de forma visual.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'O pagamento é feito por cartão de crédito de forma segura via Stripe. Você escolhe entre os planos mensal, semestral ou anual.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-white py-16 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-4 sm:text-4xl dark:text-white">
            Perguntas frequentes
          </h2>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Tudo o que você precisa saber antes de começar.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 dark:text-white">
                {faq.question}
                <Plus className="h-5 w-5 flex-shrink-0 text-brand-500 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
