export type PageKey =
  | 'resumo'
  | 'receitas'
  | 'despesas'
  | 'investimentos'
  | 'doacoes'
  | 'orcamentos'
  | 'planejamento'
  | 'relatorios'
  | 'configuracoes'
  | 'assistente'
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
  description: 'O usuário está no painel financeiro do Finzup.',
  guidance: 'Ajude com finanças pessoais e uso do app. Indique a página correta se precisar cadastrar algo.',
};

const PAGE_CONTEXTS: Record<string, AssistantPageContext> = {
  '/dashboard/receitas': {
    key: 'receitas',
    label: 'Receitas',
    description: 'Página de cadastro de receitas do mês selecionado.',
    guidance:
      'Priorize ajudar a cadastrar e organizar fontes de renda. Aceite listas. Pergunte "repetir todo mês" quando relevante.',
  },
  '/dashboard/despesas': {
    key: 'despesas',
    label: 'Despesas',
    description:
      'Página de despesas: avulsas, fixas, parcelamentos, assinaturas e financiamentos.',
    guidance:
      'Priorize cadastro de despesas (avulsas, fixas com valor 0, parcelamentos). Aceite listas livres.',
  },
  '/dashboard/orcamentos': {
    key: 'orcamentos',
    label: 'Orçamentos',
    description: 'Página de orçamentos por categoria com limites mensais.',
    guidance: 'Priorize definir limites por categoria e identificar estouros.',
  },
  '/dashboard/planejamento': {
    key: 'planejamento',
    label: 'Planejamento',
    description: 'Página de simulação com cenários de receitas, despesas, doações e investimentos.',
    guidance:
      'Priorize ajudar a montar e comparar cenários de planejamento. Não altera o mês real. Sugira nomes de cenários e distribuição por categoria.',
  },
  '/dashboard/investimentos': {
    key: 'investimentos',
    label: 'Investimentos',
    description: 'Página de meta mensal e aportes de investimento.',
    guidance: 'Priorize meta mensal e registro de aportes. Não recomende ativos específicos.',
  },
  '/dashboard/doacoes': {
    key: 'doacoes',
    label: 'Doações',
    description: 'Página de doações do mês selecionado.',
    guidance: 'Priorize cadastro de doações com nome e valor.',
  },
  '/dashboard/relatorios': {
    key: 'relatorios',
    label: 'Relatórios',
    description: 'Página de relatórios e análises financeiras detalhadas.',
    guidance:
      'Priorize explicar gráficos, categorias, tendências e comparativos com base nos dados. Não cadastre itens aqui.',
  },
  '/dashboard/configuracoes': {
    key: 'configuracoes',
    label: 'Configurações',
    description: 'Página de configurações da conta, métodos de pagamento e assinatura.',
    guidance:
      'Priorize orientar sobre conta, métodos de pagamento, assinatura e créditos de IA. Encaminhe suporte para cobrança.',
  },
  '/dashboard/assistente': {
    key: 'assistente',
    label: 'Assistente IA',
    description: 'Coach financeiro do Finzup com base nos dados do usuário.',
    guidance:
      'Priorize melhorar a situação financeira: quitar dívidas, organizar gastos, investir (reserva e metas). Pergunte o foco antes de plano completo. Use % e R$ com dados reais.',
  },
};

export function getAssistantPageContext(pathname: string): AssistantPageContext {
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return {
      key: 'resumo',
      label: 'Resumo',
      description: 'Página de resumo financeiro do mês selecionado.',
      guidance:
        'Priorize dívidas, saldo, orçamentos estourados e plano de quitação + investimento. Pergunte o foco se o pedido for amplo.',
    };
  }

  const match = Object.entries(PAGE_CONTEXTS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => pathname === path || pathname.startsWith(`${path}/`));

  return match ? match[1] : DEFAULT_CONTEXT;
}

export function buildPageContextPayload(pathname: string): {
  pageKey: PageKey;
  pageLabel: string;
  pageContext: string;
} {
  const ctx = getAssistantPageContext(pathname);
  return {
    pageKey: ctx.key,
    pageLabel: ctx.label,
    pageContext: `${ctx.description}\n\nComo ajudar nesta tela: ${ctx.guidance}`,
  };
}
