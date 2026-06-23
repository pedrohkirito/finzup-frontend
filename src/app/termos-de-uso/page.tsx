import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL, WEBSITE_URL, LGPD_RESPONSE_DAYS } from '@/content/legal/constants';
import { TRIAL_DAYS } from '@/constants/billing';

export const metadata: Metadata = {
  title: 'Termos de Uso — Finzup',
  description: 'Condições para utilização da plataforma Finzup.',
};

const termsSections = [
  {
    title: '1. Aceitação dos termos',
    content: (
      <>
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do Finzup, plataforma de organização
          financeira pessoal disponível em{' '}
          <a href={WEBSITE_URL} className="text-emerald-600 hover:underline dark:text-emerald-400">
            {WEBSITE_URL}
          </a>
          .
        </p>
        <p>
          Ao criar uma conta, você declara ter lido, compreendido e aceito estes Termos de Uso e nossa{' '}
          <a
            href="/politica-de-privacidade"
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: '2. Descrição do serviço',
    content: (
      <>
        <p>
          O Finzup é uma ferramenta de software como serviço (SaaS) que permite registrar e acompanhar
          receitas, despesas, orçamentos, investimentos e outras informações financeiras pessoais.
        </p>
        <p>
          O Finzup <strong>não é uma instituição financeira</strong>, não oferece consultoria de
          investimentos, não realiza transações financeiras em seu nome e não garante resultados
          econômicos. As informações exibidas dependem dos dados inseridos por você.
        </p>
      </>
    ),
  },
  {
    title: '3. Cadastro e conta',
    content: (
      <>
        <p>Para utilizar o serviço, você deve:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Ter pelo menos 18 anos de idade;</li>
          <li>Fornecer informações verdadeiras, completas e atualizadas;</li>
          <li>Manter a confidencialidade da sua senha;</li>
          <li>Notificar-nos imediatamente em caso de uso não autorizado da sua conta.</li>
        </ul>
        <p>
          Você é responsável por todas as atividades realizadas na sua conta. Cada pessoa deve possuir
          apenas uma conta, vinculada ao seu CPF.
        </p>
      </>
    ),
  },
  {
    title: '4. Assinatura e pagamentos',
    content: (
      <>
        <p>
          O Finzup pode oferecer período de teste gratuito de {TRIAL_DAYS} dias, conforme divulgado no
          site. Durante o teste, você pode utilizar as funcionalidades indicadas na página de assinatura.
          Ao final do período de teste, o acesso às funcionalidades completas pode exigir assinatura paga.
        </p>
        <p>
          Os pagamentos são processados pelo Stripe. Ao assinar um plano pago, você autoriza a cobrança
          recorrente conforme o plano escolhido (mensal, semestral ou anual), incluindo renovações
          automáticas até que o cancelamento seja realizado. Você pode cancelar a assinatura a qualquer
          momento pelo portal de cobrança; o acesso permanece ativo até o fim do período já pago, salvo
          disposição em contrário na interface.
        </p>
        <p>
          <strong>Direito de arrependimento (CDC):</strong> em contratações realizadas fora do
          estabelecimento comercial, você pode desistir do contrato em até 7 (sete) dias a contar da
          contratação ou do ato de recebimento do produto ou serviço, o que ocorrer por último, mediante
          solicitação ao{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          . Quando aplicável por lei, o reembolso será processado pelo mesmo meio de pagamento utilizado
          na compra, no prazo regulamentar.
        </p>
        <p>
          Reservamo-nos o direito de alterar preços e planos para novas contratações, com comunicação
          prévia aos assinantes ativos quando aplicável à renovação da sua assinatura.
        </p>
      </>
    ),
  },
  {
    title: '5. Comunicações e marketing',
    content: (
      <>
        <p>
          O Finzup pode enviar e-mails transacionais relacionados à sua conta, como confirmação de
          cadastro, redefinição de senha e informações sobre assinatura.
        </p>
        <p>
          Com sua autorização prévia, também podemos enviar comunicações de marketing com novidades,
          dicas de uso, promoções e informações sobre funcionalidades do Finzup. No cadastro, essa opção
          pode aparecer pré-selecionada, mas você pode desmarcá-la antes de concluir o registro. Você
          pode revogar esse consentimento e cancelar o recebimento dessas mensagens a qualquer momento,
          pelo link de descadastro nos e-mails (quando aplicável) ou entrando em contato pelo{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          O aceite destes Termos de Uso no cadastro não obriga você a receber comunicações de marketing.
        </p>
      </>
    ),
  },
  {
    title: '6. Uso permitido',
    content: (
      <>
        <p>Você concorda em utilizar o Finzup apenas para fins lícitos e de acordo com estes termos. É
          proibido:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Violar leis aplicáveis ou direitos de terceiros;</li>
          <li>Tentar acessar áreas ou dados de outros usuários;</li>
          <li>Interferir no funcionamento da plataforma ou em suas medidas de segurança;</li>
          <li>Utilizar o serviço para distribuir spam, malware ou conteúdo ilícito;</li>
          <li>Reproduzir, revender ou sublicenciar o software sem autorização.</li>
        </ul>
      </>
    ),
  },
  {
    title: '7. Propriedade intelectual',
    content: (
        <p>
          O Finzup, incluindo sua marca, interface, código e conteúdo proprietário, é de nossa titularidade
          ou de nossos licenciadores. Você recebe uma licença limitada, pessoal, não exclusiva e revogável
          para usar a plataforma conforme estes termos. Os dados financeiros inseridos por você
          permanecem de sua propriedade. Você nos concede licença limitada para hospedar, processar e
          exibir esses dados exclusivamente para prestar o serviço contratado.
        </p>
    ),
  },
  {
    title: '8. Disponibilidade e alterações',
    content: (
      <>
        <p>
          Empregamos esforços razoáveis para manter o serviço disponível, mas não garantimos
          funcionamento ininterrupto ou livre de erros. Podemos realizar manutenções, atualizações ou
          modificar funcionalidades a qualquer momento. Recomendamos que você mantenha cópias de informações
          financeiras relevantes, pois não nos responsabilizamos por perda de dados decorrente de falhas
          técnicas, uso indevido da conta ou exclusões realizadas por você.
        </p>
        <p>
          Podemos suspender ou encerrar contas que violem estes termos, sem prejuízo de outras medidas
          cabíveis.
        </p>
      </>
    ),
  },
  {
    title: '9. Limitação de responsabilidade',
    content: (
      <>
        <p>
          O Finzup é fornecido &quot;como está&quot;. Na extensão máxima permitida pela lei, não nos
          responsabilizamos por decisões financeiras tomadas com base nas informações registradas na
          plataforma, por perdas indiretas, lucros cessantes ou danos decorrentes de indisponibilidade do
          serviço.
        </p>
        <p>
          Nossa responsabilidade total, quando aplicável, limita-se ao valor pago por você nos 12 meses
          anteriores ao evento que deu origem à reclamação. Cláusulas limitativas não se aplicam em
          situações em que a lei, inclusive o Código de Defesa do Consumidor, não permitir limitação ou
          exclusão de responsabilidade.
        </p>
      </>
    ),
  },
  {
    title: '10. Privacidade',
    content: (
      <>
        <p>
          O tratamento dos seus dados pessoais é regido pela nossa{' '}
          <a
            href="/politica-de-privacidade"
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Política de Privacidade
          </a>
          , que integra estes Termos de Uso.
        </p>
        <p>
          Você pode solicitar a exclusão da sua conta e dos dados pessoais pelo e-mail{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          . Responderemos em até {LGPD_RESPONSE_DAYS} dias, conforme a LGPD.
        </p>
      </>
    ),
  },
  {
    title: '11. Alterações dos termos',
    content: (
      <p>
          Podemos alterar estes Termos de Uso a qualquer momento. A data da última atualização será
          indicada no topo desta página. Alterações relevantes serão comunicadas por e-mail ou aviso
          destacado na plataforma com antecedência razoável. O uso continuado após o prazo informado
          constitui aceite das novas condições, ressalvados os direitos previstos na legislação de
          proteção ao consumidor.
      </p>
    ),
  },
  {
    title: '12. Lei aplicável e foro',
    content: (
      <p>
        Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
        comarca do domicílio do usuário para dirimir eventuais controvérsias, salvo disposição legal em
        contrário.
      </p>
    ),
  },
  {
    title: '13. Contato',
    content: (
      <p>
        Dúvidas sobre estes Termos de Uso podem ser enviadas para{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-emerald-600 hover:underline dark:text-emerald-400"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout title="Termos de Uso" lastUpdated={LEGAL_LAST_UPDATED} sections={termsSections} />
  );
}
