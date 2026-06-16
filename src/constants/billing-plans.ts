export type BillingPlanId = 'monthly' | 'semester' | 'annual';

export const BILLING_PLAN_ORDER: BillingPlanId[] = ['monthly', 'semester', 'annual'];

export interface BillingPlanConfig {
  id: BillingPlanId;
  label: string;
  total: number;
  intervalMonths: number;
  description: string;
  icon: 'zap' | 'star' | 'sparkles';
}

export const BILLING_PLANS: Record<BillingPlanId, BillingPlanConfig> = {
  monthly: {
    id: 'monthly',
    label: 'Mensal',
    total: 13.9,
    intervalMonths: 1,
    description: 'Sem compromisso de longo prazo',
    icon: 'zap',
  },
  semester: {
    id: 'semester',
    label: 'Semestral',
    total: 71.4,
    intervalMonths: 6,
    description: 'Cobrado a cada 6 meses',
    icon: 'star',
  },
  annual: {
    id: 'annual',
    label: 'Anual',
    total: 106.8,
    intervalMonths: 12,
    description: 'Cobrado uma vez por ano',
    icon: 'sparkles',
  },
};

export const BILLING_FEATURES = [
  'Controle de receitas ilimitadas',
  'Gestão de despesas por categoria',
  'Orçamentos mensais personalizados',
  'Acompanhamento de investimentos',
  'Gestão de doações',
  'Relatórios mensais detalhados',
  'Acesso em todos os dispositivos',
  'Suporte por e-mail',
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

export function planDiscountPercent(planId: BillingPlanId): number | null {
  const monthly = BILLING_PLANS.monthly.total;
  const plan = BILLING_PLANS[planId];
  if (plan.intervalMonths === 1) return null;
  const equiv = monthlyEquivalent(plan.total, plan.intervalMonths);
  return Math.round(((monthly - equiv) / monthly) * 100);
}

export function planSavingsVsMonthly(planId: BillingPlanId): number {
  const monthly = BILLING_PLANS.monthly;
  const plan = BILLING_PLANS[planId];
  return monthly.total * plan.intervalMonths - plan.total;
}
