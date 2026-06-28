import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL, WEBSITE_URL, COMPANY_LEGAL_NAME, COMPANY_CNPJ, COMPANY_ADDRESS, LGPD_RESPONSE_DAYS, ANPD_URL } from '@/content/legal/constants';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Finzup',
  description: 'Saiba como o Finzup coleta, usa e protege seus dados pessoais.',
};

const privacySections = [
  {
    title: '1. Introdução',
    content: (
      <>
        <p>
          Esta Política de Privacidade descreve como o Finzup (&quot;nós&quot;, &quot;nosso&quot; ou
          &quot;plataforma&quot;), disponível em{' '}
          <a href={WEBSITE_URL} className="text-emerald-600 hover:underline dark:text-emerald-400">
            {WEBSITE_URL}
          </a>
          , trata os dados pessoais dos usuários (&quot;você&quot;) em conformidade com a Lei Geral de
          Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
        <p>
          Ao criar uma conta ou utilizar nossos serviços, você declara ter lido e compreendido esta
          política.
        </p>
      </>
    ),
  },
  {
    title: '2. Quem é o controlador dos dados',
    content: (
      <>
        <p>
          O controlador dos dados pessoais tratados nesta plataforma é o <strong>{COMPANY_LEGAL_NAME}</strong>
          , responsável pelo Finzup, disponível em{' '}
          <a href={WEBSITE_URL} className="text-emerald-600 hover:underline dark:text-emerald-400">
            {WEBSITE_URL}
          </a>
          .
        </p>
        {COMPANY_CNPJ && COMPANY_ADDRESS ? (
          <p>
            Razão social: {COMPANY_LEGAL_NAME}. CNPJ: {COMPANY_CNPJ}. Endereço: {COMPANY_ADDRESS}.
          </p>
        ) : (
          <p>
            Os dados de identificação da pessoa jurídica (razão social, CNPJ e endereço) serão publicados
            nesta página quando formalizados.
          </p>
        )}
        <p>
          Para assuntos relacionados à privacidade e à LGPD, entre em contato pelo e-mail{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          (canal do encarregado pelo tratamento de dados pessoais).
        </p>
      </>
    ),
  },
  {
    title: '3. Dados que coletamos',
    content: (
      <>
        <p>Podemos coletar e tratar as seguintes categorias de dados:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dados de cadastro:</strong> nome completo, CPF, endereço de e-mail e senha (armazenada
            com hash seguro, sem possibilidade de recuperação em texto claro).
          </li>
          <li>
            <strong>Dados financeiros inseridos por você:</strong> receitas, despesas, orçamentos,
            investimentos, doações, formas de pagamento e demais informações que você registra na
            plataforma.
          </li>
          <li>
            <strong>Dados de assinatura:</strong> informações de cobrança processadas pela Asaas (novas
            assinaturas) e/ou Stripe (assinaturas legadas), como status da assinatura e identificadores de
            pagamento. Não armazenamos dados completos de cartão de crédito.
          </li>
          <li>
            <strong>Dados de uso de IA:</strong> mensagens enviadas ao assistente financeiro e metadados
            de consumo de créditos, processados por provedor de IA contratado (ex.: OpenAI), quando você
            utiliza essa funcionalidade.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, tipo de navegador, data e hora de acesso e
            registros de autenticação, utilizados para segurança e prevenção a fraudes.
          </li>
          <li>
            <strong>Dados de uso e navegação:</strong> páginas visitadas, eventos de interação,
            identificadores de dispositivo e cookies, coletados por ferramentas de análise e medição de
            campanhas (conforme descrito na seção de cookies).
          </li>
          <li>
            <strong>Dados de comunicação:</strong> mensagens enviadas ao nosso suporte e interações por
            e-mail.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Finalidades do tratamento',
    content: (
      <>
        <p>Utilizamos seus dados para:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Criar e gerenciar sua conta;</li>
          <li>Permitir o uso das funcionalidades de organização financeira pessoal;</li>
          <li>Processar assinaturas e pagamentos;</li>
          <li>
            Enviar e-mails transacionais (confirmação de cadastro, redefinição de senha, avisos de
            assinatura e cobrança);
          </li>
          <li>
            Enviar comunicações de marketing sobre o Finzup (novidades, dicas de uso, promoções e
            funcionalidades), <strong>apenas quando você tiver consentido</strong> em recebê-las;
          </li>
          <li>
            Medir audiência, desempenho de campanhas, funis de conversão e melhorar a experiência na
            plataforma (ferramentas de analytics, como Mixpanel, e pixel de conversão);
          </li>
          <li>Garantir a segurança da plataforma e prevenir acessos não autorizados;</li>
          <li>Atender solicitações de suporte;</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
        <p>
          Não vendemos seus dados pessoais nem utilizamos suas informações financeiras para fins de
          marketing de terceiros. Comunicações de marketing são limitadas ao Finzup e não dependem do
          conteúdo financeiro que você registra na plataforma.
        </p>
      </>
    ),
  },
  {
    title: '5. Bases legais',
    content: (
      <>
        <p>O tratamento dos seus dados se fundamenta, conforme o caso, em:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Execução de contrato (prestação do serviço Finzup e e-mails transacionais);</li>
          <li>
            Consentimento (comunicações de marketing, cookies não essenciais e outras finalidades para as
            quais você optar expressamente);
          </li>
          <li>
            Legítimo interesse (segurança, prevenção a fraudes e medição agregada de uso da plataforma,
            respeitando seus direitos e expectativas);
          </li>
          <li>Cumprimento de obrigação legal ou regulatória.</li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Compartilhamento de dados',
    content: (
      <>
        <p>Podemos compartilhar dados com prestadores de serviço essenciais à operação do Finzup, como:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Asaas</strong> — processamento de pagamentos e gestão de assinaturas (novos clientes);
          </li>
          <li>
            <strong>Stripe</strong> — processamento de pagamentos e gestão de assinaturas (clientes legados);
          </li>
          <li>
            <strong>OpenAI</strong> — processamento de mensagens do assistente de IA (quando configurado);
          </li>
          <li>
            <strong>Amazon Web Services (AWS)</strong> — hospedagem do backend, banco de dados e envio de
            e-mails transacionais e de marketing (quando autorizado);
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem do site e aplicação web;
          </li>
          <li>
            <strong>Meta (Facebook Pixel)</strong> — medição de conversões e desempenho de campanhas
            publicitárias, quando você interage com o site;
          </li>
          <li>
            <strong>Vercel Analytics</strong> — estatísticas agregadas de acesso e uso do site;
          </li>
          <li>
            <strong>Mixpanel</strong> — análise de funil e eventos de uso (como cadastro e assinatura),
            para entender e melhorar a jornada do usuário na plataforma.
          </li>
        </ul>
        <p>
          Esses parceiros tratam os dados apenas conforme nossas instruções e em conformidade com a
          legislação aplicável. Também podemos divulgar dados quando exigido por lei ou ordem judicial.
        </p>
      </>
    ),
  },
  {
    title: '7. Transferência internacional de dados',
    content: (
      <>
        <p>
          Alguns dos prestadores listados acima podem processar dados em servidores localizados fora do
          Brasil, incluindo Estados Unidos e outros países onde mantêm infraestrutura (como AWS, Stripe,
          Meta, Mixpanel e Vercel).
        </p>
        <p>
          Quando houver transferência internacional, adotamos medidas para garantir um nível adequado de
          proteção, como cláusulas contratuais padrão, políticas de privacidade dos fornecedores e
          avaliação da necessidade e proporcionalidade do tratamento.
        </p>
      </>
    ),
  },
  {
    title: '8. Armazenamento e segurança',
    content: (
      <>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo hash seguro de
          senhas, conexões protegidas (HTTPS), controle de acesso e monitoramento de tentativas de login.
        </p>
        <p>
          Seus dados são mantidos enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir
          obrigações legais. Você pode solicitar a exclusão da conta e dos dados pelo e-mail{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          . Após o encerramento, os dados serão excluídos ou anonimizados em prazo razoável, salvo quando
          a retenção for exigida por lei (por exemplo, registros fiscais ou de pagamento).
        </p>
      </>
    ),
  },
  {
    title: '9. Seus direitos',
    content: (
      <>
        <p>Nos termos da LGPD, você pode solicitar:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Confirmação da existência de tratamento;</li>
          <li>Acesso aos seus dados;</li>
          <li>Correção de dados incompletos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Portabilidade dos dados;</li>
          <li>Revogação do consentimento, inclusive para comunicações de marketing;</li>
          <li>Informações sobre compartilhamento de dados.</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato pelo e-mail{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          . Você pode cancelar o recebimento de e-mails de marketing a qualquer momento pelo link de
          descadastro nas mensagens (quando aplicável) ou solicitando a exclusão da lista pelo mesmo canal
          de contato.
        </p>
        <p>
          Responderemos às solicitações relacionadas aos seus direitos em até {LGPD_RESPONSE_DAYS} dias,
          prorrogáveis conforme previsto na LGPD. Você também pode apresentar reclamação à Autoridade
          Nacional de Proteção de Dados (ANPD) pelo site{' '}
          <a
            href={ANPD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {ANPD_URL}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: '10. Comunicações por e-mail',
    content: (
      <>
        <p>Utilizamos seu endereço de e-mail para dois tipos de comunicação:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Transacionais:</strong> necessários para o funcionamento da conta (verificação,
            segurança, assinatura). Não é possível desativá-los enquanto você mantiver uma conta ativa.
          </li>
          <li>
            <strong>Marketing:</strong> novidades do produto, dicas de organização financeira, ofertas e
            comunicações promocionais do Finzup. Esses e-mails dependem do seu consentimento e podem ser
            interrompidos a qualquer momento.
          </li>
        </ul>
        <p>
          O aceite dos Termos de Uso e desta Política de Privacidade no cadastro <strong>não</strong>{' '}
          equivale automaticamente à autorização para receber e-mails de marketing. No formulário de
          cadastro, a opção de receber comunicações de marketing pode aparecer pré-selecionada para sua
          conveniência; você pode desmarcá-la antes de concluir o registro.
        </p>
      </>
    ),
  },
  {
    title: '11. Cookies e tecnologias similares',
    content: (
      <>
        <p>Utilizamos cookies e tecnologias semelhantes para diferentes finalidades:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Essenciais:</strong> autenticação da sessão e funcionamento básico da plataforma;
          </li>
          <li>
            <strong>Preferências:</strong> lembrar configurações como tema da interface;
          </li>
          <li>
            <strong>Analíticos:</strong> Vercel Analytics e Mixpanel, para entender de forma agregada como
            o site é utilizado e como os usuários percorrem etapas como cadastro e assinatura;
          </li>
          <li>
            <strong>Marketing e medição:</strong> Meta (Facebook Pixel), para medir cadastros e
            assinaturas originados de campanhas.
          </li>
        </ul>
        <p>
          Cookies essenciais não dependem de consentimento. Para cookies analíticos e de marketing, nos
          apoiamos nas bases legais descritas nesta política e você pode limitar o uso por meio das
          configurações do navegador, extensões de bloqueio ou ferramentas de opt-out disponibilizadas
          pelos respectivos fornecedores — ciente de que isso pode afetar algumas funcionalidades ou a
          medição de campanhas.
        </p>
      </>
    ),
  },
  {
    title: '12. Alterações nesta política',
    content: (
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. A data da última atualização será
        indicada no topo desta página. Alterações relevantes poderão ser comunicadas por e-mail ou por
        aviso na plataforma.
      </p>
    ),
  },
  {
    title: '13. Contato',
    content: (
      <p>
        Em caso de dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato:{' '}
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

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={privacySections}
    />
  );
}
