import { Plus } from 'lucide-react';

const faqs = [
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos PIX e cartão de crédito, processados com segurança pela Asaas. Você escolhe entre os planos mensal, semestral ou anual.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Pode. O cancelamento é feito de forma rápida e sem burocracia. Você mantém o acesso até o fim do período já pago.',
  },
  {
    question: 'Tenho direito a reembolso?',
    answer:
      'Sim. Nos primeiros 7 dias após a contratação, você tem direito de arrependimento com reembolso integral. É só falar com a gente por e-mail ou WhatsApp que a gente resolve na hora.',
  },
  {
    question: 'Meus dados financeiros estão seguros?',
    answer:
      'Sim. Seus dados trafegam de forma criptografada e são tratados com privacidade total. Nunca vendemos ou compartilhamos suas informações.',
  },
  {
    question: 'Funciona no celular?',
    answer:
      'Sim. A Finzup funciona em qualquer dispositivo com navegador — celular, tablet ou computador — com a mesma experiência.',
  },
  {
    question: 'Preciso recadastrar tudo todo mês?',
    answer:
      'Não. Marque lançamentos com "Repetir todo mês", use despesas fixas e defina seus orçamentos uma vez. Ao fechar o mês, a Finzup copia receitas, despesas recorrentes, doações e meta de investimentos para o mês seguinte — você só ajusta o que mudou.',
  },
  {
    question: 'Preciso entender de finanças para usar?',
    answer:
      'Não. A Finzup foi feita para ser simples desde o primeiro acesso. Você registra receitas e despesas, a gente organiza tudo de forma visual, e o Assistente de IA responde suas dúvidas sobre o dinheiro.',
  },
  {
    question: 'O que o Assistente de IA faz?',
    answer:
      'É um assistente que responde suas dúvidas sobre o dinheiro — com base nos seus lançamentos — e sobre como usar a Finzup. Ele também monta planejamentos, sugere orçamentos, aponta onde economizar e ajuda a organizar metas e prioridades do mês.',
  },
  {
    question: 'Como funcionam os créditos de IA?',
    answer:
      'Os créditos são consumidos conforme o uso da IA. Os créditos vêm inclusos no seu plano (250 no mensal, 500 no semestral e 750 no anual) e renovam a cada ciclo de cobrança. Quando acabam, o assistente fica indisponível até a próxima renovação. Pode ficar tranquilo que os créditos duram muito.',
  },
  {
    question: 'Por que não usar só uma planilha?',
    answer:
      'Planilha é gratuita, mas exige recomeçar do zero todo mês: você recopia despesas fixas, salário, orçamentos e categorias uma a uma. Na Finzup, marque um lançamento como recorrente e ele aparece automaticamente no próximo mês — você só ajusta o que mudou. Menos tempo gasto, mais consistência, e ainda conta com o Assistente de IA.',
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
              className="group rounded-2xl border border-slate-200 bg-slate-50 transition-colors open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 p-5 text-left text-base font-semibold text-slate-900 marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus className="h-5 w-5 flex-shrink-0 text-brand-500 transition-transform group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
