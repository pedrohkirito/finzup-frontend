import { Plus } from 'lucide-react';

const faqs = [
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos PIX e cartão de crédito, processados com segurança pela Asaas. Você escolhe entre os planos mensal, semestral ou anual.',
  },
  {
    question: 'Preciso criar conta antes de pagar?',
    answer:
      'Não. Você informa nome completo, CPF ou CNPJ e email no checkout. Após a confirmação do pagamento, enviamos um link para criar sua senha e acessar o Finzup.',
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
    question: 'Por que não usar só uma planilha?',
    answer:
      'Planilha é gratuita, mas exige recomeçar do zero todo mês: você recopia despesas fixas, salário, orçamentos e categorias uma a uma. No Finzup, marque um lançamento como recorrente e ele aparece automaticamente no próximo mês — você só ajusta o que mudou. Menos tempo gasto, mais consistência.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
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
