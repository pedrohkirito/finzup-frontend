import type { PageKey } from './assistant-page-context';

/** Guidance extra por página × Baby Step (1–6). */
const STEP_PAGE_GUIDANCE: Partial<
  Record<PageKey, Partial<Record<1 | 2 | 3 | 4 | 5 | 6, string>>>
> = {
  resumo: {
    1: 'Prioridade: encher o fundo inicial de R$ 3–5 mil. Não foque em investimentos grandes.',
    2: 'Prioridade: dívida-alvo da bola de neve. Renda extra e cortes vão para ela.',
    3: 'Prioridade: completar a reserva de 3–6 meses do custo de vida.',
    4: 'Prioridade: fazer sobrar 15% da renda para investir sem cortar lazer/dízimo.',
    5: 'Prioridade: entrada da casa ou amortização do financiamento (após 15% investidos).',
    6: 'Prioridade: manter controle, investir e ser altamente generoso.',
  },
  receitas: {
    1: 'Renda extra deve ir prioritariamente para o fundo de R$ 3–5 mil.',
    2: 'Renda extra (após dízimo) deve atacar a menor dívida da bola de neve.',
    3: 'Renda extra deve encher a reserva de emergência.',
    4: 'Ajude a estruturar a renda para sobrar 15% investidos + 10% lazer + 10% dízimo.',
    5: 'Renda extra: complete 15% investidos; o restante amortiza a casa / junta entrada.',
    6: 'Organize renda para prosperidade sustentável e generosidade.',
  },
  despesas: {
    1: 'Corte gastos concretos para sobrar dinheiro ao fundo inicial.',
    2: 'Modo ataque: destaque parcelamentos/fatura; não use cartão para consumo novo.',
    3: 'Mantenha disciplina; priorize aportes à reserva sobre consumo.',
    4: 'Corte desperdício (não o lazer de 10%) para caber os 15% investidos.',
    5: 'Financiamentos de imóvel: oriente CET e amortização; sem novas dívidas de consumo.',
    6: 'Evite voltar ao cartão; gaste só o que já tem.',
  },
  investimentos: {
    1: 'Ainda não é o foco — oriente o fundo de R$ 3–5 mil em Investimentos → Reserva.',
    2: 'Não force aportes grandes com dívidas ativas; priorize a bola de neve.',
    3: 'Prioridade ainda é a reserva completa; aportes leves só se sobrar.',
    4: 'Meta mensal ≈ 15% da renda. Sem recomendar ativos específicos.',
    5: 'Mantenha o máximo possível em 15%; entrada da casa pode reduzir temporariamente.',
    6: 'Continue investindo ≥15% e projetando metas de longo prazo.',
  },
  doacoes: {
    1: 'Proteja o dízimo de 10% mesmo no Passo 1.',
    2: 'Dízimo 10% permanece — nunca sugerir reduzir para quitar dívida.',
    3: 'Mantenha 10% de dízimo enquanto enche a reserva.',
    4: 'Dízimo 10% + lazer 10% + investir 15% devem caber juntos.',
    5: 'Monte o plano da casa já descontando os 10% de dízimo.',
    6: 'Foque em generosidade alta e sustentável.',
  },
  orcamentos: {
    1: 'Encaixe a meta do fundo no orçamento mensal.',
    2: 'Lazer pode ficar temporariamente enxuto; deixe a temporariedade clara.',
    3: 'Priorize categorias essenciais e aporte à reserva.',
    4: 'Remonte o orçamento: contas + 10% lazer + 10% dízimo + 15% investir.',
    5: 'Reserve fatia para entrada/amortização sem quebrar a reserva.',
    6: 'Orçamento como controle absoluto da prosperidade.',
  },
  planejamento: {
    1: 'Sugira cenário “fechar o fundo de R$ 3–5 mil”.',
    2: 'Sugira cenário de bola de neve até zerar dívidas de consumo.',
    3: 'Sugira cenário para completar 3–6 meses de reserva.',
    4: 'Sugira cenário com 15% investidos cabendo no mês.',
    5: 'Sugira cenário de entrada da casa ou amortização.',
    6: 'Sugira cenário de crescimento patrimonial + generosidade.',
  },
  metodo: {
    1: 'Ajude a registrar e acompanhar o fundo inicial.',
    2: 'Explique a bola de neve com as dívidas listadas.',
    3: 'Calcule custo de vida × 3–6 e plano de aportes à reserva.',
    4: 'Mostre o gap até 15% da renda.',
    5: 'Ajude com entrada (~20%) + custos e CET — sem indicar imóvel/banco.',
    6: 'Celebre a base e oriente prosperidade + generosidade.',
  },
};

export function getBabyStepPageGuidance(
  pageKey: PageKey,
  step: 1 | 2 | 3 | 4 | 5 | 6,
): string | null {
  return STEP_PAGE_GUIDANCE[pageKey]?.[step] ?? null;
}
