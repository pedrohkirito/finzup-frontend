export type BillingPlanId = 'monthly' | 'semester' | 'annual';

export const BILLING_PLAN_ORDER: BillingPlanId[] = ['monthly', 'semester', 'annual'];

export interface BillingPlanConfig {
  id: BillingPlanId;
  label: string;
  total: number;
  intervalMonths: number;
  aiCredits: number;
  description: string;
  icon: 'zap' | 'star' | 'sparkles';
}

export const BILLING_PLANS: Record<BillingPlanId, BillingPlanConfig> = {
  monthly: {
    id: 'monthly',
    label: 'Mensal',
    total: 67.9,
    intervalMonths: 1,
    aiCredits: 250,
    description: 'Sem compromisso de longo prazo',
    icon: 'zap',
  },
  semester: {
    id: 'semester',
    label: 'Semestral',
    total: 197.9,
    intervalMonths: 6,
    aiCredits: 500,
    description: 'Cobrado a cada 6 meses',
    icon: 'star',
  },
  annual: {
    id: 'annual',
    label: 'Anual',
    total: 297.9,
    intervalMonths: 12,
    aiCredits: 750,
    description: 'Cobrado uma vez por ano',
    icon: 'sparkles',
  },
};

/** Parcelamento no cartão do plano anual (compra única, sem renovação). */
export const ANNUAL_INSTALLMENT = {
  count: 12,
  value: 29.9,
  total: 358.8,
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

export function planPriceIntervalSuffix(intervalMonths: number): '/mês' | '/semestre' | '/ano' {
  if (intervalMonths === 1) return '/mês';
  if (intervalMonths === 6) return '/semestre';
  return '/ano';
}

export function planBillingLabel(planId: BillingPlanId): string {
  const plan = BILLING_PLANS[planId];
  if (plan.intervalMonths === 1) return 'Cobrado mensalmente. Sem fidelidade.';
  const equiv = formatBRL(monthlyEquivalent(plan.total, plan.intervalMonths));
  if (plan.intervalMonths === 6) return `Equivale a ~R$${equiv}/mês no semestre`;
  return `Equivale a ~R$${equiv}/mês no ano`;
}

export function planDiscountPercent(planId: BillingPlanId): number | null {
  const monthly = BILLING_PLANS.monthly.total;
  const plan = BILLING_PLANS[planId];
  if (plan.intervalMonths === 1) return null;
  const equiv = monthlyEquivalent(plan.total, plan.intervalMonths);
  return Math.round(((monthly - equiv) / monthly) * 100);
}

/** Total que o usuário pagaria no mesmo período escolhendo o plano mensal. */
export function planMonthlyEquivalentTotal(planId: BillingPlanId): number | null {
  const plan = BILLING_PLANS[planId];
  if (plan.intervalMonths === 1) return null;
  return BILLING_PLANS.monthly.total * plan.intervalMonths;
}
