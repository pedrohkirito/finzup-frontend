export type PageKey =
  | 'resumo'
  | 'receitas'
  | 'despesas'
  | 'investimentos'
  | 'simulador_investimentos'
  | 'doacoes'
  | 'orcamentos'
  | 'planejamento'
  | 'relatorios'
  | 'fluxo'
  | 'importar'
  | 'pro_labore'
  | 'painel_dono'
  | 'configuracoes'
  | 'assistente'
  | 'metodo'
  | 'generic';

export type AssistantPageContext = {
  key: PageKey;
  label: string;
  description: string;
  guidance: string;
};

const DEFAULT_CONTEXT: AssistantPageContext = {
  key: 'generic',
  label: 'Finzup',
  description: 'O usuário está no painel financeiro da Finzup.',
  guidance: 'Ajude com finanças pessoais e uso do app. Indique a página correta se precisar cadastrar algo. Conecte a orientação ao Baby Step atual.',
};

const PAGE_CONTEXTS: Record<string, AssistantPageContext> = {
  '/dashboard/receitas': {
    key: 'receitas',
    label: 'Receitas',
    description: 'Página de cadastro de receitas do mês selecionado.',
    guidance:
      'Priorize ajudar a cadastrar e organizar fontes de renda. Aceite listas. Pergunte "repetir todo mês" quando relevante. Direcione renda extra conforme o Baby Step atual.',
  },
  '/dashboard/despesas': {
    key: 'despesas',
    label: 'Despesas',
    description:
      'Página de despesas: avulsas, fixas, parcelamentos, assinaturas e financiamentos.',
    guidance:
      'Priorize cadastro de despesas (avulsas, fixas com valor 0, parcelamentos). Aceite listas livres. No Passo 2, destaque dívidas da bola de neve.',
  },
  '/dashboard/orcamentos': {
    key: 'orcamentos',
    label: 'Orçamentos',
    description: 'Página de orçamentos por categoria com limites mensais.',
    guidance:
      'Priorize definir limites por categoria e identificar estouros. Alinhe ao Baby Step e aos princípios que o usuário mantém ligados no Método (padrão: 10% lazer, 10% dízimo, 15% investir).',
  },
  '/dashboard/planejamento': {
    key: 'planejamento',
    label: 'Planejamento',
    description: 'Página de simulação com cenários de receitas, despesas, doações e investimentos.',
    guidance:
      'Priorize ajudar a montar e comparar cenários. Sugira cenário "completar meu Baby Step atual". Não altera o mês real.',
  },
  '/dashboard/investimentos': {
    key: 'investimentos',
    label: 'Investimentos',
    description: 'Página de meta mensal e aportes de investimento.',
    guidance:
      'Priorize meta mensal e registro de aportes. Não indique produtos, instituições nem taxas (Resolução CVM 19); pedidos de onde investir vão para um consultor CVM. Se o usuário ainda está nos Passos 1–2, avise que investir 15% ainda não é o foco.',
  },
  '/dashboard/investimentos/simulador': {
    key: 'simulador_investimentos',
    label: 'Simulador de investimentos',
    description: 'Simulação de patrimônio com juros compostos, metas e projeção em 30 anos.',
    guidance:
      'Intake primeiro: uma pergunta por vez (finalidade, meta/prazo, patrimônio, aportes). Plano com números só após intake completo. Rentabilidade é hipótese do usuário; não sugira taxa nem produto (CVM 19). Salvar simulação após confirmação. Sem aportes do mês.',
  },
  '/dashboard/doacoes': {
    key: 'doacoes',
    label: 'Doações',
    description: 'Página de doações do mês selecionado.',
    guidance:
      'Priorize cadastro de doações com nome e valor. Se o dízimo estiver ligado no Método, proteja o % definido pelo usuário (padrão 10%) em qualquer Baby Step; se estiver desligado, doações são escolha livre.',
  },
  '/dashboard/metodo': {
    key: 'metodo',
    label: 'Método Finzup',
    description: 'Mapa dos Baby Steps, reserva, bola de neve e meta da casa.',
    guidance:
      'Ajude com o passo atual: progresso, próxima ação, reserva, dívidas ou entrada da casa. Não pule etapas.',
  },
  '/dashboard/relatorios': {
    key: 'relatorios',
    label: 'Relatórios',
    description: 'Página de relatórios e análises financeiras detalhadas.',
    guidance:
      'Priorize explicar gráficos, categorias, tendências e comparativos com base nos dados. Relacione insights ao Baby Step atual. Não cadastre itens aqui.',
  },
  '/dashboard/fluxo': {
    key: 'fluxo',
    label: 'Fluxo de caixa',
    description: 'Fluxo de caixa diário do mês: saldo previsto dia a dia, com filtros de conta bancária e PF/PJ.',
    guidance:
      'Use o fluxo de caixa (get_cash_flow) para dizer o saldo em um dia, o menor saldo e quando fica negativo. Sugira mudar datas de entradas/saídas para evitar aperto. Lançamentos sem data contam no início do mês.',
  },
  '/dashboard/importar': {
    key: 'importar',
    label: 'Importar extrato',
    description: 'Importação de extrato OFX/CSV: o usuário envia o arquivo, revisa as categorias sugeridas e confirma.',
    guidance:
      'Ajude a revisar a importação em andamento (get_statement_import) e a ajustar linhas ou criar regras (categorize_statement_lines). Só confirme a importação depois do "Confirmo".',
  },
  '/dashboard/painel': {
    key: 'painel_dono',
    label: 'Painel do dono',
    description: 'Painel do dono: caixa e dias de caixa das empresas, pró-labore x retiradas, dívidas e reserva pessoais e alertas.',
    guidance: 'Use get_owner_dashboard. Comece pelo alerta mais grave e diga a próxima ação. Para "posso retirar R$ X?", use get_pro_labore.',
  },
  '/dashboard/pro-labore': {
    key: 'pro_labore',
    label: 'Pró-labore',
    description: 'Pró-labore sustentável da empresa, quanto ainda dá para retirar no mês, definido x retiradas e alertas.',
    guidance:
      'Use get_pro_labore (com amount para "posso retirar R$ X?") e responda com o número devolvido. Definir pró-labore/reserva: set_pro_labore. Registrar retirada: record_owner_withdrawal. Sempre com confirmação.',
  },
  '/dashboard/configuracoes': {
    key: 'configuracoes',
    label: 'Configurações',
    description: 'Página de configurações da conta, métodos de pagamento (com vencimento da fatura), contas bancárias, fluxo PJ e assinatura.',
    guidance:
      'Priorize orientar sobre conta, métodos de pagamento, contas bancárias, fluxo PJ, assinatura e créditos de IA. Encaminhe suporte para cobrança.',
  },
  '/dashboard/assistente': {
    key: 'assistente',
    label: 'Assistente IA',
    description: 'Coach financeiro da Finzup com base nos dados do usuário.',
    guidance:
      'Priorize o Baby Step atual do usuário. Pergunte o foco antes de plano completo. Use % e R$ com dados reais.',
  },
};

export function getAssistantPageContext(pathname: string): AssistantPageContext {
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return {
      key: 'resumo',
      label: 'Resumo',
      description: 'Página de resumo financeiro do mês selecionado.',
      guidance:
        'Priorize o Baby Step atual, próxima ação do método, dívidas, saldo e orçamentos. Pergunte o foco se o pedido for amplo.',
    };
  }

  const match = Object.entries(PAGE_CONTEXTS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => pathname === path || pathname.startsWith(`${path}/`));

  return match ? match[1] : DEFAULT_CONTEXT;
}

export function buildPageContextPayload(
  pathname: string,
  overrides?: { pageKey?: PageKey; babyStep?: number },
): {
  pageKey: PageKey;
  pageLabel: string;
  pageContext: string;
} {
  const ctx = getAssistantPageContext(pathname);
  const pageKey = overrides?.pageKey ?? ctx.key;
  const label =
    pageKey === 'simulador_investimentos' && ctx.key === 'investimentos'
      ? 'Simulador de investimentos'
      : ctx.label;
  const description =
    pageKey === 'simulador_investimentos' && ctx.key === 'investimentos'
      ? 'Simulação de patrimônio com juros compostos, metas e projeção em 30 anos.'
      : ctx.description;
  let guidance =
    pageKey === 'simulador_investimentos' && ctx.key === 'investimentos'
      ? 'Intake primeiro: uma pergunta por vez. Plano com números só após entender finalidade, meta, prazo e aportes. Salvar simulação após confirmação.'
      : ctx.guidance;

  if (overrides?.babyStep) {
    // Lazy import avoided — guidance appended by caller via getBabyStepPageGuidance when available
    guidance += `\nBaby Step atual informado pelo app: ${overrides.babyStep}. Conecte a ajuda a este passo.`;
  }

  return {
    pageKey,
    pageLabel: label,
    pageContext: `${description}\n\nComo ajudar nesta tela: ${guidance}`,
  };
}
