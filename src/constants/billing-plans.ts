export type BillingPlanId = 'monthly' | 'annual';

export const BILLING_PLAN_ORDER: BillingPlanId[] = ['monthly', 'annual'];

export interface BillingPlanConfig {
  id: BillingPlanId;
  label: string;
  total: number;
  /** Preço de tabela riscado durante a promoção. */
  compareAt?: number;
  intervalMonths: number;
  aiCredits: number;
  description: string;
  icon: 'zap' | 'sparkles';
}

export const BLACK_FRIDAY_PROMO = {
  active: true,
  label: 'Black Friday',
} as const;

export const BILLING_PLANS: Record<BillingPlanId, BillingPlanConfig> = {
  monthly: {
    id: 'monthly',
    label: 'Mensal',
    total: 19.9,
    intervalMonths: 1,
    aiCredits: 250,
    description: 'Sem compromisso de longo prazo',
    icon: 'zap',
  },
  annual: {
    id: 'annual',
    label: 'Anual',
    total: 59.9,
    compareAt: 119.9,
    intervalMonths: 12,
    aiCredits: 750,
    description: 'Cobrado uma vez por ano',
    icon: 'sparkles',
  },
};

/**
 * Parcelamento no cartão do plano anual (compra única, sem renovação).
 * O total é igual ao PIX e ao cartão à vista; os juros já estão inclusos.
 * `value` é a parcela média (a última pode ajustar centavos para fechar o total).
 */
export const ANNUAL_INSTALLMENT = {
  count: 12,
  value: 4.99,
  total: 59.9,
} as const;

export type CardChargeMode = 'recurrent' | 'installment';

export const BILLING_FEATURES = [
  'Assistente de IA para suas finanças',
  'Controle de receitas ilimitadas',
  'Gestão de despesas por categoria',
  'Orçamentos mensais personalizados',
  'Acompanhamento de investimentos',
  'Relatórios mensais detalhados',
  'Acesso em todos os dispositivos',
  'Suporte por e-mail e WhatsApp',
] as const;

export function monthlyEquivalent(total: number, intervalMonths: number): number {
  return total / intervalMonths;
}

export function formatBRL(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export function formatPriceParts(value: number): { int: string; dec: string } {
  const [int, dec] = value.toFixed(2).split('.');
  return { int, dec };
}

export function planPriceIntervalSuffix(intervalMonths: number): '/mês' | '/ano' {
  if (intervalMonths === 1) return '/mês';
  return '/ano';
}

export function planBillingLabel(planId: BillingPlanId): string {
  const plan = BILLING_PLANS[planId];
  if (plan.intervalMonths === 1) return 'Cobrado mensalmente. Sem fidelidade.';
  const equiv = formatBRL(monthlyEquivalent(plan.total, plan.intervalMonths));
  return `Equivale a ~R$${equiv}/mês no ano`;
}

export function planDiscountPercent(planId: BillingPlanId): number | null {
  const plan = BILLING_PLANS[planId];
  if (plan.compareAt != null && plan.compareAt > plan.total) {
    return Math.round(((plan.compareAt - plan.total) / plan.compareAt) * 100);
  }
  const monthly = BILLING_PLANS.monthly.total;
  if (plan.intervalMonths === 1) return null;
  const equiv = monthlyEquivalent(plan.total, plan.intervalMonths);
  return Math.round(((monthly - equiv) / monthly) * 100);
}

/** Preço riscado do plano: tabela da promoção ou o equivalente no mensal. */
export function planCompareAtTotal(planId: BillingPlanId): number | null {
  const plan = BILLING_PLANS[planId];
  if (plan.compareAt != null && plan.compareAt > plan.total) return plan.compareAt;
  if (plan.intervalMonths === 1) return null;
  return BILLING_PLANS.monthly.total * plan.intervalMonths;
}
