import { getAssistantPageContext, type PageKey } from '@/lib/assistant-page-context';

export type { PageKey };
export type FlowIntent = 'register' | 'suggest';

const REGISTRATION_PAGES: PageKey[] = [
  'receitas',
  'despesas',
  'investimentos',
  'doacoes',
  'orcamentos',
];

const PAGES_WITH_OPENING_FLOW: PageKey[] = [...REGISTRATION_PAGES, 'planejamento', 'relatorios', 'resumo', 'assistente'];

const SUGGEST_ONLY_PAGES: PageKey[] = ['relatorios', 'resumo'];

export type PageSnapshot = {
  incomeCount: number;
  expenseCount: number;
  filledExpenseCount: number;
  investmentCount: number;
  donationCount: number;
  budgetCount: number;
  investmentTarget: number;
};

export type PageFlowAction = {
  label: string;
  message: string;
  intent: FlowIntent | 'dismiss';
  variant?: 'primary' | 'outline';
};

export type PageFlow = {
  pageKey: PageKey;
  label: string;
  description: string;
  openingMessage: string;
  openingActions: PageFlowAction[];
  suggestionAction: { label: string; message: string } | null;
};

export function resolvePageKey(pathname: string): PageKey {
  return getAssistantPageContext(pathname).key;
}

function yesRegister(message: string): PageFlowAction {
  return { label: 'Sim, quero ajuda', message, intent: 'register', variant: 'primary' };
}

function noThanks(): PageFlowAction {
  return { label: 'Não, obrigado', message: '', intent: 'dismiss', variant: 'outline' };
}

function yesSuggest(label: string, message: string): PageFlowAction {
  return { label, message, intent: 'suggest', variant: 'primary' };
}

export function isSuggestOnlyPage(pageKey: PageKey): boolean {
  return SUGGEST_ONLY_PAGES.includes(pageKey);
}

export function pageSupportsRegistration(pageKey: PageKey): boolean {
  return REGISTRATION_PAGES.includes(pageKey);
}

export function getPageFlow(pathname: string, snapshot: PageSnapshot): PageFlow | null {
  const pageKey = resolvePageKey(pathname);
  if (!PAGES_WITH_OPENING_FLOW.includes(pageKey)) return null;

  const ctx = getAssistantPageContext(pathname);
  const base = {
    pageKey,
    label: ctx.label,
    description: ctx.description,
  };

  switch (pageKey) {
    case 'despesas':
      return {
        ...base,
        openingMessage: 'Quer que eu te ajude a cadastrar suas despesas?',
        openingActions: [
          yesRegister('Sim, quero ajuda para cadastrar minhas despesas.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Pedir sugestão à IA',
          message:
            'Analise minhas despesas e sugira onde posso economizar ou o que falta cadastrar.',
        },
      };
    case 'doacoes':
      return {
        ...base,
        openingMessage: 'Quer ajuda para cadastrar suas doações?',
        openingActions: [
          yesRegister('Sim, quero ajuda para cadastrar minhas doações.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Pedir sugestão à IA',
          message: 'Sugira como organizar minhas doações neste mês.',
        },
      };
    case 'orcamentos':
      return {
        ...base,
        openingMessage: 'Quer ajuda para cadastrar seus orçamentos?',
        openingActions: [
          yesRegister('Sim, quero ajuda para cadastrar meus orçamentos.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Pedir sugestão à IA',
          message:
            'Sugira orçamentos ideais com base nas minhas receitas e despesas, incluindo lazer.',
        },
      };
    case 'planejamento':
      return {
        ...base,
        openingMessage: 'Quer ajuda para montar um cenário de planejamento financeiro?',
        openingActions: [
          yesSuggest(
            'Sim, montar cenário',
            'Me ajude a montar um cenário de planejamento com receitas, despesas por categoria, doações e caixinhas de investimento.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Comparar cenários',
          message:
            'Sugira dois cenários de planejamento (conservador e ideal) para eu comparar antes de decidir.',
        },
      };
    case 'receitas':
      if (snapshot.incomeCount === 0) {
        return {
          ...base,
          openingMessage: 'Quer ajuda para cadastrar suas receitas?',
          openingActions: [
            yesRegister('Sim, quero ajuda para cadastrar minhas receitas.'),
            noThanks(),
          ],
          suggestionAction: null,
        };
      }
      return {
        ...base,
        openingMessage:
          'Você já tem receitas cadastradas. Quer cadastrar mais ou pedir sugestões de renda e planejamento?',
        openingActions: [
          yesRegister('Sim, quero cadastrar mais receitas.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Pedir sugestão à IA',
          message:
            'Sugira outras fontes de renda e um planejamento ideal com base nas minhas finanças, incluindo orçamento de lazer.',
        },
      };
    case 'investimentos':
      if (snapshot.investmentCount === 0) {
        return {
          ...base,
          openingMessage: 'Quer ajuda para cadastrar seus investimentos?',
          openingActions: [
            yesRegister('Sim, quero ajuda para cadastrar meus investimentos.'),
            noThanks(),
          ],
          suggestionAction: {
            label: 'Pedir sugestão à IA',
            message: 'Me ajude a definir quanto devo investir por mês com base na minha renda.',
          },
        };
      }
      return {
        ...base,
        openingMessage: 'Quer cadastrar novos aportes ou montar um plano de investimentos?',
        openingActions: [
          yesRegister('Sim, quero cadastrar novos aportes ou ajustar minha meta.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Pedir sugestão à IA',
          message: 'Me ajude a montar um plano de investimentos.',
        },
      };
    case 'relatorios':
      return {
        ...base,
        openingMessage:
          'Deseja que eu analise seus gastos e veja possíveis pontos de melhoria?',
        openingActions: [
          yesSuggest(
            'Sim, analisar gastos',
            'Sim, analise meus gastos e indique possíveis pontos de melhoria com base nos relatórios.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Analisar meus gastos',
          message:
            'Analise meus gastos e indique possíveis pontos de melhoria com base nos relatórios do mês.',
        },
      };
    case 'resumo':
      return {
        ...base,
        openingMessage:
          'Posso te ajudar a melhorar suas finanças: quitar dívidas, organizar gastos ou investir. O que você quer trabalhar?',
        openingActions: [
          yesSuggest(
            'Quitar dívidas',
            'Quero um plano para quitar minhas dívidas e organizar meu dinheiro com base no meu resumo do mês.',
          ),
          yesSuggest(
            'Investir e reserva',
            'Quero sugestões para investir e criar reserva de emergência com base no meu mês.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Analisar meu mês',
          message:
            'Analise meu resumo financeiro: dívidas, saldo, orçamentos e o que priorizar neste mês.',
        },
      };
    case 'assistente':
      return {
        ...base,
        openingMessage:
          'Sou seu coach financeiro no Finzup — foco em sair das dívidas, investir e ter controle do seu dinheiro. Como posso ajudar?',
        openingActions: [
          yesSuggest(
            'Quitar dívidas',
            'Me ajude a montar um plano para quitar minhas dívidas e organizar meus gastos.',
          ),
          yesSuggest(
            'Investir e reserva',
            'Quero orientação para investir, criar reserva de emergência e metas de longo prazo.',
          ),
          yesSuggest(
            'Distribuir renda extra',
            'Tenho uma renda extra chegando (13º, bônus etc.) — me ajude a distribuir em % e valores.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Ver o que você pode fazer por mim',
          message:
            'Com base nos meus dados no Finzup, o que você pode me ajudar a fazer? Liste opções concretas.',
        },
      };
    default:
      return null;
  }
}

export function buildAnotherSuggestionMessage(pageKey: PageKey): string {
  const avoidRepeat =
    'Analise meus números e sugira algo prático e personalizado para esta tela. Evite repetir o que já comentou nesta conversa.';

  switch (pageKey) {
    case 'resumo':
      return `${avoidRepeat} Traga novos insights sobre saldo, cadastros pendentes, orçamentos estourados, economia ou metas do mês.`;
    case 'relatorios':
      return `${avoidRepeat} Traga novos insights sobre gastos, categorias, tendências ou oportunidades de melhoria.`;
    case 'despesas':
      return `${avoidRepeat} Pense em economia, categorias relevantes ou despesas que possam estar faltando.`;
    case 'receitas':
      return `${avoidRepeat} Pense em renda, planejamento e equilíbrio financeiro do mês.`;
    case 'investimentos':
      return `${avoidRepeat} Pense em metas, aportes e hábito de guardar dinheiro com base na minha renda.`;
    case 'doacoes':
      return `${avoidRepeat} Pense em como organizar doações de forma equilibrada neste mês.`;
    case 'orcamentos':
      return `${avoidRepeat} Pense em limites por categoria que façam sentido para as minhas finanças.`;
    case 'planejamento':
      return `${avoidRepeat} Pense em cenários de planejamento, distribuição por categoria e caixinhas de investimento.`;
    case 'assistente':
      return `${avoidRepeat} Foque em dívidas, organização de gastos, investimentos ou distribuição de renda extra.`;
    default:
      return avoidRepeat;
  }
}

export function buildSnapshotFromSummary(summary: {
  items: {
    incomes: unknown[];
    expenses: unknown[];
    donations: unknown[];
    investments: unknown[];
  };
  investment: { targetAmount: number };
  budgets: unknown[];
}): PageSnapshot {
  const filledExpenseCount = summary.items.expenses.filter(
    (e) => (e as { amount: number }).amount > 0,
  ).length;

  return {
    incomeCount: summary.items.incomes.length,
    expenseCount: summary.items.expenses.length,
    filledExpenseCount,
    investmentCount: summary.items.investments.length,
    donationCount: summary.items.donations.length,
    budgetCount: summary.budgets.length,
    investmentTarget: summary.investment.targetAmount,
  };
}

export function isAwaitingConfirmation(assistantContent: string): boolean {
  const trimmed = assistantContent.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();

  if (
    /cadastrar o seguinte|vou cadastrar|posso cadastrar|posso registrar|deseja confirmar|quer confirmar|confirmar o cadastro|confirmar\?\s*$|confirma\?\s*$|confirme\b|confirma para|pode cadastrar|posso prosseguir|está correto|está certo|esta correto|esta certo|posso adicionar|deseja adicionar|quer adicionar|posso incluir|para eu registrar|para registrar/i.test(
      lower,
    )
  ) {
    return true;
  }

  const hasResumoHeading =
    /\*\*resumo\*\*|^#{1,3}\s*resumo\b|^resumo\b/m.test(lower);

  const asksToProceed =
    /cadastrar|registrar|registre|confirmar|confirme|confirma|prosseguir|registro|adicionar|incluir|correto|certo|aporte|aportes/i.test(
      lower,
    );

  if (hasResumoHeading && asksToProceed) return true;

  const hasMoneyAmount = /\br\$\s*[\d.,]+/i.test(trimmed);
  const endsWithQuestion = /\?\s*$/.test(trimmed);
  const hasMoneyList = /(?:^|\n)\s*[-*•]\s+.+\br\$\s*[\d.,]+/im.test(trimmed);

  if (hasMoneyAmount && endsWithQuestion && asksToProceed && (hasMoneyList || hasResumoHeading)) {
    return true;
  }

  const hasListItem = /(?:^|\n)\s*[-*•]\s+.+/m.test(trimmed);
  if (
    hasListItem &&
    endsWithQuestion &&
    /correto|certo|confirm|cadastr|registr|adicion|incluir|aporte/i.test(lower)
  ) {
    return true;
  }

  return false;
}

export function invalidateQueriesForPage(pageKey: PageKey): string[][] {
  switch (pageKey) {
    case 'receitas':
      return [['months'], ['incomes']];
    case 'despesas':
      return [
        ['months'],
        ['expenses'],
        ['fixed-templates'],
        ['installments'],
        ['subscriptions'],
        ['financings'],
        ['payment-methods'],
      ];
    case 'investimentos':
      return [['months'], ['investments'], ['investment-goal']];
    case 'doacoes':
      return [['months'], ['donations']];
    case 'orcamentos':
      return [['months'], ['budgets'], ['budget-templates']];
    case 'planejamento':
      return [['plans']];
    default:
      return [['months']];
  }
}

export type AiExecutedAction = {
  type: string;
  name: string;
  amount?: number;
};

const ACTION_QUERY_KEYS: Record<string, string[][]> = {
  create_expense: [['expenses'], ['fixed-templates'], ['months']],
  update_expense: [['expenses'], ['fixed-templates'], ['months']],
  create_fixed_expense: [['fixed-templates'], ['expenses'], ['months']],
  create_installment_plan: [['installments'], ['expenses'], ['months']],
  create_subscription: [['subscriptions'], ['months']],
  create_financing: [['financings'], ['months']],
  create_income: [['incomes'], ['months']],
  create_donation: [['donations'], ['months']],
  create_investment: [['investments'], ['months']],
  set_investment_goal: [['investment-goal'], ['months']],
  create_budget: [['budgets'], ['budget-templates'], ['months']],
};

function dedupeQueryKeys(keys: string[][]): string[][] {
  const seen = new Set<string>();
  const result: string[][] = [];
  for (const key of keys) {
    const serialized = JSON.stringify(key);
    if (!seen.has(serialized)) {
      seen.add(serialized);
      result.push(key);
    }
  }
  return result;
}

export function invalidateQueriesAfterAiActions(
  pageKey: PageKey,
  actions: AiExecutedAction[],
): string[][] {
  const keys = [...invalidateQueriesForPage(pageKey)];
  for (const action of actions) {
    const actionKeys = ACTION_QUERY_KEYS[action.type];
    if (actionKeys) keys.push(...actionKeys);
  }
  return dedupeQueryKeys(keys);
}
