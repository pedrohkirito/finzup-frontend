import { Plus } from 'lucide-react';

const faqs = [
  {
    question: 'Estou endividado. Faz sentido pagar por um app agora?',
    answer:
      'Especialmente agora. Cada mês sem direção é mais juros pagos. A Finzup custa menos que um lanche por mês e existe exatamente para te tirar dessa situação.',
  },
  {
    question: 'Tenho dívida em vários lugares. Por onde começo?',
    answer:
      'Você não precisa decidir sozinho. Assim que cadastra as dívidas, a Finzup organiza tudo dentro do Método Finzup e mostra a sua próxima ação.',
  },
  {
    question: 'Minha renda é baixa ou variável. Funciona pra mim?',
    answer:
      'Sim. O método trabalha com a renda que você já tem hoje — fixa ou variável — e se ajusta conforme o mês muda.',
  },
  {
    question: 'Já tentei vários apps e desisti. Por que agora seria diferente?',
    answer:
      'A maioria só mostra gráfico do passado. A Finzup te diz o que fazer com o dinheiro deste mês, repete suas contas sozinha e tem um Assistente de IA — não é mais uma planilha digital.',
  },
  {
    question: 'Como funciona o Método Finzup?',
    answer:
      'É um método criado pela Finzup, baseado no método de Dave Ramsey. Quando você entra, ele já está montado com os seus números.',
  },
  {
    question: 'A Finzup se conecta ao meu banco?',
    answer:
      'Não. O cadastro é feito por você — digitando ou conversando com a IA. Com a recorrência automática, você não recadastra tudo todo mês.',
  },
  {
    question: 'A Finzup negocia minha dívida?',
    answer:
      'Não. Ela organiza as dívidas na ordem certa de pagamento e te mostra o plano. A negociação com o credor continua sendo com você.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Sem burocracia. Você mantém o acesso até o fim do período já pago. Nos primeiros 7 dias, há reembolso integral.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'PIX e cartão de crédito, processados com segurança pela Asaas. Planos mensal ou anual.',
  },
];

export function Faq() {
  return (
    <section id="faq" data-landing-section="faq" className="bg-slate-50 py-20 sm:py-28 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Dúvidas comuns
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950"
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
