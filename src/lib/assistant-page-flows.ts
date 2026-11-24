import { getAssistantPageContext, type PageKey } from '@/lib/assistant-page-context';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

export type { PageKey };
export type FlowIntent = 'register' | 'suggest';

const REGISTRATION_PAGES: PageKey[] = [
  'receitas',
  'despesas',
  'investimentos',
  'simulador_investimentos',
  'doacoes',
  'orcamentos',
];

const PAGES_WITH_OPENING_FLOW: PageKey[] = [
  ...REGISTRATION_PAGES,
  'planejamento',
  'relatorios',
  'fluxo',
  'importar',
  'pro_labore',
  'painel_dono',
  'resumo',
  'assistente',
  'metodo',
];

const SUGGEST_ONLY_PAGES: PageKey[] = ['relatorios', 'fluxo', 'importar', 'pro_labore', 'painel_dono', 'resumo', 'metodo'];

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

export function resolvePageKey(pathname: string, investmentTab?: string): PageKey {
  if (pathname.startsWith('/dashboard/investimentos') && investmentTab === 'simulador') {
    return 'simulador_investimentos';
  }
  return getAssistantPageContext(pathname).key;
}

function yesRegister(labelOrMessage: string, message?: string): PageFlowAction {
  if (message) {
    return { label: labelOrMessage, message, intent: 'register', variant: 'primary' };
  }
  return { label: 'Sim, quero ajuda', message: labelOrMessage, intent: 'register', variant: 'primary' };
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

export function getPageFlow(
  pathname: string,
  snapshot: PageSnapshot,
  investmentTab?: string,
): PageFlow | null {
  const pageKey = resolvePageKey(pathname, investmentTab);
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
    case 'simulador_investimentos':
      return {
        ...base,
        openingMessage: 'Quer planejar uma meta de investimento? Vou te fazer algumas perguntas para entender seu objetivo.',
        openingActions: [
          yesRegister(
            'Sim, planejar meta',
            'Quero planejar uma meta de investimento. Me faça perguntas para entender meu objetivo antes de montar o plano.',
          ),
          yesRegister(
            'Ajustar simulação',
            'Quero ajustar a simulação atual. Me pergunte o que ainda falta definir antes de recalcular.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Planejar meta com IA',
          message:
            'Quero planejar uma meta de investimento. Me faça perguntas uma de cada vez para entender meu objetivo antes de montar o plano.',
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
    case 'fluxo':
      return {
        ...base,
        openingMessage: 'Quer que eu veja os dias de aperto do seu fluxo de caixa?',
        openingActions: [
          yesSuggest(
            'Sim, analisar o fluxo',
            'Analise meu fluxo de caixa deste mês: em que dia o saldo fica mais baixo, se fica negativo e o que posso mudar de data para evitar aperto.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Analisar meu fluxo',
          message:
            'Analise meu fluxo de caixa do mês e diga os dias de aperto e o que mudar de data.',
        },
      };
    case 'painel_dono':
      return {
        ...base,
        openingMessage: 'Quer que eu leia o painel e diga o que merece atenção primeiro?',
        openingActions: [
          yesSuggest('Sim, o que fazer primeiro?', 'Leia meu painel do dono e diga o que merece atenção primeiro e a próxima ação.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Ler meu painel',
          message: 'Leia meu painel do dono: alertas, caixa da empresa, retiradas e lado pessoal.',
        },
      };
    case 'pro_labore':
      return {
        ...base,
        openingMessage: 'Quer saber quanto dá para tirar da empresa este mês sem apertar o caixa?',
        openingActions: [
          yesSuggest('Sim, quanto posso retirar?', 'Quanto posso retirar da empresa este mês? Explique o limite, o pró-labore sustentável e os alertas.'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Analisar meu pró-labore',
          message: 'Analise meu pró-labore: sustentável x definido, retiradas extras e o caixa da empresa.',
        },
      };
    case 'importar':
      return {
        ...base,
        openingMessage: 'Posso revisar o extrato com você: o que ficou sem categoria, o que parece duplicado e o que vale virar regra.',
        openingActions: [
          yesSuggest('Sim, revisar comigo', 'Revise a importação de extrato em andamento: o que pede atenção e o que você sugere ajustar ou virar regra?'),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Revisar o extrato',
          message: 'Revise a importação de extrato em andamento e diga o que ajustar antes de confirmar.',
        },
      };
    case 'resumo':
      return {
        ...base,
        openingMessage: BABY_STEPS_ENABLED
          ? 'Posso te orientar pelo Método Finzup: seu Baby Step atual, dívidas, reserva ou investimentos. O que você quer trabalhar?'
          : 'Posso te ajudar a melhorar suas finanças: quitar dívidas, organizar gastos ou investir. O que você quer trabalhar?',
        openingActions: BABY_STEPS_ENABLED
          ? [
              yesSuggest(
                'Meu Baby Step',
                'Em qual Baby Step estou e o que devo fazer agora com base nos meus dados?',
              ),
              yesSuggest(
                'Quitar dívidas',
                'Quero um plano para quitar minhas dívidas (bola de neve) com base no meu resumo do mês.',
              ),
              yesSuggest(
                'Reserva e investir',
                'Quero sugestões para reserva de emergência e investir conforme o meu Baby Step.',
              ),
              noThanks(),
            ]
          : [
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
          message: BABY_STEPS_ENABLED
            ? 'Analise meu resumo financeiro alinhado ao meu Baby Step: dívidas, saldo, orçamentos e o que priorizar.'
            : 'Analise meu resumo financeiro: dívidas, saldo, orçamentos e o que priorizar neste mês.',
        },
      };
    case 'assistente':
      return {
        ...base,
        openingMessage:
          'Sou seu coach financeiro na Finzup — foco em sair das dívidas, investir e ter controle do seu dinheiro. Como posso ajudar?',
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
            'Com base nos meus dados na Finzup, o que você pode me ajudar a fazer? Liste opções concretas.',
        },
      };
    case 'metodo':
      return {
        ...base,
        openingMessage:
          'Quer que eu explique seu Baby Step atual e monte o próximo passo do Método Finzup?',
        openingActions: [
          yesSuggest(
            'Sim, me oriente',
            'Com base no meu Baby Step atual, me diga exatamente o que fazer agora com números reais.',
          ),
          noThanks(),
        ],
        suggestionAction: {
          label: 'Plano do meu passo',
          message:
            'Estou na tela do Método Finzup. Monte um plano curto para o meu Baby Step atual com R$ e %.',
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
    case 'painel_dono':
      return `${avoidRepeat} Use o painel do dono: alertas, dias de caixa, retiradas x limite, dívidas e reserva pessoais.`;
    case 'pro_labore':
      return `${avoidRepeat} Olhe o pró-labore: limite do mês, sustentável x definido, retiradas extras e dias de caixa da empresa.`;
    case 'importar':
      return `${avoidRepeat} Olhe a importação em revisão: linhas sem categoria, duplicadas e regras que valem a pena.`;
    case 'fluxo':
      return `${avoidRepeat} Use o fluxo de caixa diário: dias de aperto, saldo por conta ou PF/PJ e datas que valem mudar.`;
    case 'despesas':
      return `${avoidRepeat} Pense em economia, categorias relevantes ou despesas que possam estar faltando.`;
    case 'receitas':
      return `${avoidRepeat} Pense em renda, planejamento e equilíbrio financeiro do mês.`;
    case 'investimentos':
      return `${avoidRepeat} Pense em metas, aportes e hábito de guardar dinheiro com base na minha renda.`;
    case 'simulador_investimentos':
      return `${avoidRepeat} Pense em metas de longo prazo, aportes mensais, rentabilidade educativa (mín. 12% a.a.) e tempo para atingir a meta.`;
    case 'doacoes':
      return `${avoidRepeat} Pense em como organizar doações de forma equilibrada neste mês.`;
    case 'metodo':
      return `${avoidRepeat} Foque no meu Baby Step atual, progresso e próxima ação do método.`;
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
    /cadastrar o seguinte|vou cadastrar|posso cadastrar|posso registrar|deseja confirmar|quer confirmar|confirmar o cadastro|confirmar\?\s*$|confirma\?\s*$|confirme\b|confirma para|pode cadastrar|posso prosseguir|está correto|está certo|esta correto|esta certo|posso adicionar|deseja adicionar|quer adicionar|posso incluir|para eu registrar|para registrar|salvar a simula|salvar simula|deseja salvar|quer salvar/i.test(
      lower,
    )
  ) {
    return true;
  }

  const hasResumoHeading =
    /\*\*resumo\*\*|^#{1,3}\s*resumo\b|^resumo\b/m.test(lower);

  const asksToProceed =
    /cadastrar|registrar|registre|confirmar|confirme|confirma|prosseguir|registro|adicionar|incluir|correto|certo|salvar simula|salvar a simula/i.test(
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
    /correto|certo|confirm|cadastr|registr|adicion|incluir|salvar simula/i.test(lower)
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
    case 'simulador_investimentos':
      return [['investment-simulations']];
    case 'doacoes':
      return [['months'], ['donations']];
    case 'orcamentos':
      return [['months'], ['budgets'], ['budget-templates']];
    case 'planejamento':
      return [['plans']];
    case 'metodo':
      return [['baby-steps']];
    default:
      return [['months'], ['baby-steps']];
  }
}

export type AiExecutedAction = {
  type: string;
  name: string;
  amount?: number;
  simulationId?: string;
};

const ACTION_QUERY_KEYS: Record<string, string[][]> = {
  // Transferências ficam em ['months', id, 'transfers'] e mudam resumo e fluxo do mês.
  create_transfer: [['months'], ['bank-accounts'], ['auth', 'me'], ['baby-steps'], ['pro-labore'], ['owner-dashboard']],
  update_transfer: [['months'], ['bank-accounts'], ['baby-steps']],
  delete_transfer: [['months'], ['bank-accounts'], ['baby-steps']],
  create_bank_account: [['bank-accounts']],
  update_bank_account: [['bank-accounts'], ['months']],
  delete_bank_account: [
    ['bank-accounts'],
    ['months'],
    ['incomes'],
    ['expenses'],
    ['fixed-templates'],
    ['installments'],
    ['subscriptions'],
    ['financings'],
    ['investments'],
    ['donations'],
  ],
  set_entry_details: [
    ['categories'],
    ['budgets'],
    ['months'],
    ['incomes'],
    ['expenses'],
    ['fixed-templates'],
    ['installments'],
    ['subscriptions'],
    ['financings'],
    ['investments'],
    ['donations'],
    ['bank-accounts'],
    ['auth', 'me'],
  ],
  create_expense: [['categories'], ['budgets'], ['expenses'], ['fixed-templates'], ['months']],
  update_expense: [['expenses'], ['fixed-templates'], ['months']],
  create_fixed_expense: [['categories'], ['budgets'], ['fixed-templates'], ['expenses'], ['months']],
  create_installment_plan: [['categories'], ['budgets'], ['installments'], ['expenses'], ['months'], ['baby-steps']],
  create_subscription: [['categories'], ['budgets'], ['subscriptions'], ['months']],
  create_financing: [['financings'], ['months'], ['baby-steps']],
  create_income: [['categories'], ['budgets'], ['incomes'], ['months'], ['baby-steps']],
  create_donation: [['categories'], ['budgets'], ['donations'], ['months'], ['baby-steps']],
  create_investment: [['investments'], ['months'], ['baby-steps']],
  set_investment_goal: [['investment-goal'], ['months'], ['baby-steps']],
  create_budget: [['budgets'], ['budget-templates'], ['categories'], ['months']],
  create_category: [['categories'], ['budgets'], ['budget-templates']],
  update_category: [['categories'], ['budgets'], ['budget-templates'], ['expenses'], ['incomes'], ['donations'], ['months']],
  create_investment_simulation: [['investment-simulations']],
  update_investment_simulation: [['investment-simulations']],
  create_company: [['spaces'], ['auth']],
  categorize_statement_lines: [['statement-imports'], ['categorization-rules'], ['categories']],
  create_categorization_rule: [['categorization-rules'], ['categories']],
  delete_categorization_rule: [['categorization-rules']],
  set_pro_labore: [['pro-labore'], ['owner-dashboard']],
  record_owner_withdrawal: [['pro-labore'], ['owner-dashboard'], ['months'], ['bank-accounts'], ['baby-steps']],
  commit_statement_import: [['statement-imports'], ['months'], ['bank-accounts'], ['baby-steps'], ['incomes'], ['expenses']],
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
  // Cadastros pela IA podem criar uma conta bancária pelo nome ou ligar o fluxo PJ.
  if (actions.some((action) => action.type.startsWith('create_') && !action.type.includes('simulation'))) {
    keys.push(['bank-accounts'], ['auth', 'me']);
  }
  if (
    actions.some(
      (action) =>
        action.type === 'create_investment_simulation' ||
        action.type === 'update_investment_simulation',
    )
  ) {
    keys.push(['investment-simulations']);
  }
  return dedupeQueryKeys(keys);
}
