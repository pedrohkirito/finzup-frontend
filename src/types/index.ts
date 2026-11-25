export interface UserBilling {
  status: 'none' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  plan: 'monthly' | 'semester' | 'annual' | null;
  stripePriceId: string | null;
  billingProvider: 'stripe' | 'asaas' | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasAccess: boolean;
  hasActiveSubscription: boolean;
  inTrial: boolean;
  trialExpired: boolean;
  daysLeftInTrial: number;
  trialDays: number;
}

export interface User {
  id: string;
  name: string;
  cpf: string | null;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  /** Liga o fluxo PJ (separação PF/PJ) na interface. */
  businessEnabled?: boolean;
  billing: UserBilling;
  /** Plano do catálogo e recursos liberados agora. */
  plan?: PlanEntitlements & { name: string };
  /** Equipe Finzup: vê o painel interno. */
  isAdmin?: boolean;
  aiCredits?: {
    balance: number;
    included: number;
  };
}

export interface FinancialMonth {
  id: string;
  userId: string;
  year: number;
  month: number;
  status: 'open' | 'closed';
  closedAt: string | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'other';
  isDefault: boolean;
  /** Dia de vencimento da fatura (só cartão de crédito). */
  dueDay?: number | null;
  /** Dia de fechamento da fatura (só cartão de crédito). Compras depois entram no mês seguinte. */
  closingDay?: number | null;
}

/** PF (`personal`) ou PJ (`business`). */
export type FinanceScope = 'personal' | 'business';
/** Filtro de visão: consolidado (`all`), só PF ou só PJ. */
export type ScopeFilter = 'all' | FinanceScope;

/** Campos opcionais de todos os lançamentos: dia do mês, PF/PJ e conta bancária. */
export interface EntryExtras {
  day?: number | null;
  scope?: FinanceScope;
  /** Espaço (pessoal ou empresa). Manda no lugar do PF/PJ. */
  spaceId?: string;
  bankAccountId?: string | null;
}

/** Espaço financeiro: o pessoal (PF) ou uma empresa (PJ). */
export interface Space {
  id: string;
  kind: FinanceScope;
  name: string;
  cnpj: string | null;
  sortOrder: number;
  /** Empresa vinda do PJ antigo: continua liberada em qualquer plano. */
  grandfathered: boolean;
  archived: boolean;
  /** Acima do limite do plano: só leitura. */
  locked: boolean;
  createdAt: string;
}

export interface SpacesResponse {
  spaces: Space[];
  canCreateBusiness: boolean;
  maxBusinessSpaces: number;
  tier: string;
}

/** Espaço escolhido no topo: "all" (consolidado) ou o id de um espaço. */
export type SpaceSelection = 'all' | string;

export interface SpaceRef {
  id: string;
  name: string;
  kind: FinanceScope;
}

export interface SpaceTotals extends ScopeTotals {
  spaceId: string;
  name: string;
  kind: FinanceScope;
  archived?: boolean;
}

export type AccountKind = 'bank' | 'cash' | 'card' | 'other';

export interface BankAccount {
  id: string;
  name: string;
  /** Banco, dinheiro, cartão pré-pago/benefício ou outra carteira. */
  kind: AccountKind;
  /** Espaço dono da conta (pessoal ou empresa); null = sem espaço. */
  spaceId: string | null;
  initialBalance: number;
  /** AAAA-MM-DD; o saldo inicial vale do começo desse mês. */
  initialBalanceDate: string;
  /** Inicial + entradas − saídas na conta até hoje. */
  currentBalance: number;
  /** Inclui o resto do mês corrente e os meses futuros já criados. */
  projectedBalance: number;
  projectedUntil: { year: number; month: number };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Quantos lançamentos estão ligados à conta. */
  linkedCount: number;
}

export interface IncomeEntry extends EntryExtras {
  id: string;
  name: string;
  amount: string | number;
  carryForward: boolean;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
}

export interface ExpenseEntry extends EntryExtras {
  id: string;
  type: 'one_off' | 'fixed';
  name: string;
  amount: string | number;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  templateId?: string | null;
  template?: { isSystemSeeded: boolean } | null;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  paidAt?: string | null;
  notes?: string | null;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  defaultLimit: string | number;
  kind?: CategoryKind;
  scope?: FinanceScope;
  archivedAt?: string | null;
}

export type CategoryKind = 'expense' | 'income';

/** Categoria independente (despesa ou receita, PF ou PJ). Despesa com limite > 0 é um orçamento. */
export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  scope: FinanceScope;
  spaceId?: string;
  defaultLimit: number;
  sortOrder: number;
  isDefault: boolean;
  archived: boolean;
}

export interface MonthBudget {
  templateId: string;
  name: string;
  scope?: FinanceScope;
  spaceId?: string;
  isDefault?: boolean;
  archived?: boolean;
  /** Tem limite definido (> 0). Sem limite a categoria só acompanha o gasto. */
  hasLimit?: boolean;
  defaultLimit: number;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;
  overBudget: boolean;
  entries: { id: string; name: string; amount: number }[];
}

export interface SummaryItem {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

export interface BudgetSummary {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;
  overBudget: boolean;
  entries?: { id: string; name: string; amount: number }[];
}

export interface FixedExpenseTemplate extends EntryExtras {
  id: string;
  name: string;
  defaultAmount: string | number;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  isSystemSeeded: boolean;
}

export interface InstallmentEntry {
  id: string;
  financialMonthId: string;
  installmentNumber: number;
  amount: string | number;
  paidAt?: string | null;
}

export interface InstallmentPlan extends EntryExtras {
  id: string;
  name: string;
  totalInstallments: number;
  installmentAmount: string | number;
  totalAmount: string | number;
  installmentsPaid: number;
  active: boolean;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  paymentMethod: PaymentMethod;
  installmentEntries?: InstallmentEntry[];
}

export interface SubscriptionEntry {
  id: string;
  financialMonthId: string;
  amount: string | number;
  paidAt?: string | null;
}

export interface Subscription extends EntryExtras {
  id: string;
  name: string;
  amount: string | number;
  active: boolean;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  paymentMethod: PaymentMethod;
  subscriptionEntries?: SubscriptionEntry[];
}

export interface FinancingEntry {
  id: string;
  financialMonthId: string;
  installmentNumber: number;
  amount: string | number;
  discountApplied: boolean;
}

export interface Financing extends EntryExtras {
  id: string;
  name: string;
  totalAmount: string | number;
  totalInstallments: number;
  installmentAmount: string | number;
  installmentsPaid: number;
  earlyPaymentAmount: string | number;
  active: boolean;
  paymentMethod: PaymentMethod;
  financingEntries?: FinancingEntry[];
}

export interface InvestmentEntry extends EntryExtras {
  id: string;
  name: string;
  amount: string | number;
  notes?: string | null;
  /** Aporte recorrente: repete no mês seguinte ao fechar o mês. */
  carryForward?: boolean;
}

export interface DonationEntry extends EntryExtras {
  id: string;
  name: string;
  amount: string | number;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  notes?: string | null;
  carryForward: boolean;
}

export interface ScopeTotals {
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  totalInvested: number;
  /** Transferências PF ↔ PJ recebidas/enviadas pelo lado (não são receita nem despesa). */
  transfersIn?: number;
  transfersOut?: number;
  /** Já considera as transferências do lado. */
  balance: number;
}

/** Totais de transferências do resumo; `in`/`out`/`net` valem 0 no consolidado. */
export interface TransferTotals {
  count: number;
  total: number;
  in: number;
  out: number;
  net: number;
}

export type TransferKind = 'pro_labore' | 'profit_distribution' | 'capital_contribution' | 'between_accounts' | 'withdrawal' | 'other';

export interface TransferEntry {
  id: string;
  financialMonthId: string;
  name: string;
  kind: TransferKind;
  amount: string | number;
  day: number | null;
  fromScope: FinanceScope;
  toScope: FinanceScope;
  fromSpaceId?: string;
  toSpaceId?: string;
  fromBankAccountId: string | null;
  toBankAccountId: string | null;
  carryForward: boolean;
  notes?: string | null;
  sortOrder: number;
}

export interface ScopeBreakdown {
  personal: ScopeTotals;
  business: ScopeTotals;
}

export interface MonthSummary {
  month: FinancialMonth;
  scope?: ScopeFilter;
  /** Espaço filtrado (null = consolidado). */
  space?: SpaceRef | null;
  /** Só no consolidado: totais de PF e PJ separados. */
  scopeBreakdown?: ScopeBreakdown | null;
  /** Só no consolidado: totais por espaço (pessoal + cada empresa). */
  spaceBreakdown?: SpaceTotals[] | null;
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  /** No PF/PJ, já inclui `transfers.net`. */
  balance: number;
  transfers?: TransferTotals;
  creditCardBill: {
    total: number;
    breakdown: { expenses: number; installments: number; subscriptions: number; financings: number; donations: number };
    items: SummaryItem[];
  };
  investment: { targetAmount: number; totalInvested: number; progress: number };
  budgets: BudgetSummary[];
  items: {
    incomes: SummaryItem[];
    expenses: SummaryItem[];
    donations: SummaryItem[];
    investments: SummaryItem[];
    transfers?: (SummaryItem & { fromScope: FinanceScope; toScope: FinanceScope })[];
  };
}

export interface MonthReport {
  month: FinancialMonth;
  scope?: ScopeFilter;
  space?: SpaceRef | null;
  scopeBreakdown?: ScopeBreakdown | null;
  spaceBreakdown?: SpaceTotals[] | null;
  transfers?: TransferTotals;
  overview: {
    totalIncome: number;
    totalExpenses: number;
    totalDonations: number;
    balance: number;
    savingsRate: number;
    expenseRatio: number;
    committedAmount: number;
    commitmentRate: number;
  };
  expenseByType: { key: string; label: string; amount: number; percentage: number }[];
  fixedVsVariable: {
    fixed: { amount: number; percentage: number };
    variable: { amount: number; percentage: number };
  };
  paretoExpenses: { id: string; name: string; amount: number; cumulativePercentage: number }[];
  monthlyTrend: {
    monthId: string;
    year: number;
    month: number;
    label: string;
    totalIncome: number;
    totalExpenses: number;
    totalDonations: number;
    totalInvested: number;
  }[];
  budgetByCategory: {
    id: string;
    name: string;
    limit: number;
    spent: number;
    remaining: number;
    progress: number;
    overBudget: boolean;
  }[];
  paymentMethods: { id: string; name: string; type: string; amount: number; percentage: number }[];
  topExpenses: { id: string; name: string; amount: number; category?: string }[];
  creditCardBill: MonthSummary['creditCardBill'];
  investment: MonthSummary['investment'];
  alerts: { type: string; message: string; budgetId?: string }[];
  items: MonthSummary['items'];
}

export interface FinancialPlan {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanIncomeItem {
  id: string;
  planId: string;
  name: string;
  amount: string | number;
  sortOrder: number;
}

export interface PlanDonationItem {
  id: string;
  planId: string;
  name: string;
  amount: string | number;
  sortOrder: number;
}

export interface PlanInvestmentItem {
  id: string;
  planId: string;
  name: string;
  amount: string | number;
  notes?: string | null;
  sortOrder: number;
}

export interface PlanBudgetAllocation {
  templateId: string;
  name: string;
  defaultLimit: number;
  estimatedAmount: number;
}

export type PlanExpenseType =
  | 'fixed'
  | 'installment'
  | 'subscription'
  | 'variable'
  | 'financing'
  | 'debt';

export interface PlanExpenseItem {
  id: string;
  planId: string;
  type: PlanExpenseType;
  name: string;
  amount: string | number;
  notes?: string | null;
  sortOrder: number;
}

export interface PlanSummary {
  plan: { id: string; name: string; description?: string | null };
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  totalInvestments: number;
  balance: number;
  savingsRate: number;
  expenseRatio: number;
  investmentRatio: number;
  expensesByType: {
    type: PlanExpenseType;
    total: number;
    items: { id: string; name: string; amount: number; notes?: string | null; incomeShare: number }[];
  }[];
  investmentsByBox: { id: string; name: string; amount: number; notes?: string | null; incomeShare: number }[];
  alerts: { type: string; message: string }[];
}

export interface InvestmentSimulation {
  id: string;
  userId: string;
  name: string;
  purpose: string | null;
  initialAmount: number;
  monthlyContribution: number;
  annualYieldPercent: number;
  annualContributionIncreasePercent: number;
  annualAdditionalContribution: number;
  goalAmount: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationYearProjection {
  year: number;
  balance: number;
  totalContributed: number;
  interestEarned: number;
  monthlyContribution: number;
  monthlyInterest: number;
}

export interface SimulationMonthProjection {
  month: number;
  balance: number;
  monthlyInterest: number;
}

export interface SimulationProjection {
  yearly: SimulationYearProjection[];
  monthly: SimulationMonthProjection[];
  monthsToGoal: number | null;
  goalReachedLabel: string | null;
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
}

export interface InvestmentSimulationDetail {
  simulation: InvestmentSimulation;
  projection: SimulationProjection;
}

export interface SimulationSuggestions {
  suggestedInitialAmount: number;
  suggestedMonthlyContribution: number;
}

/** Número da etapa do Método (1–6 hoje; 0 = todas desligadas). */
export type BabyStepNumber = number;

export interface BabyStepDebtItem {
  id: string;
  name: string;
  kind: 'installment' | 'credit_card' | 'financing_consumer';
  remainingBalance: number;
  installmentAmount: number;
  remainingInstallments: number;
}

export interface BabyStepNextAction {
  label: string;
  href: string;
  chatPrompt?: string;
}

export interface BabyStepDefinition {
  key: string;
  step: BabyStepNumber;
  title: string;
  shortTitle: string;
  description: string;
  enabled: boolean;
  status: 'completed' | 'current' | 'locked' | 'disabled';
  progressPercent: number;
}

export interface MethodParamView {
  key: string;
  label: string;
  type: 'money' | 'percent' | 'months' | 'int' | 'boolean';
  default: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  value: number | boolean;
}

export interface MethodItemView {
  key: string;
  step?: number;
  title: string;
  shortTitle?: string;
  description: string;
  enabled: boolean;
  params: MethodParamView[];
}

export interface MethodGoals {
  income: number;
  items: Array<{ key: string; label: string; percent: number; amount: number; source: 'principle' | 'step' }>;
  committedPercent: number;
  freePercent: number;
  freeAmount: number;
}

export interface MethodConfigItemInput {
  key: string;
  enabled?: boolean;
  params?: Record<string, number | boolean>;
}

export interface MethodConfigInput {
  steps?: MethodConfigItemInput[];
  principles?: MethodConfigItemInput[];
  reset?: boolean;
}

export interface BabyStepState {
  currentStep: BabyStepNumber;
  currentKey: string | null;
  goals: MethodGoals;
  config: { steps: MethodItemView[]; principles: MethodItemView[] };
  progressPercent: number;
  nextAction: BabyStepNextAction;
  steps: BabyStepDefinition[];
  metrics: {
    emergencyFundBalance: number;
    emergencyFundTarget: number;
    step1Min: number;
    step1Ideal: number;
    monthlyCostOfLiving: number;
    reserveMonths: number;
    reserveTargetMonths: number;
    hasConsumerDebt: boolean;
    totalConsumerDebt: number;
    snowballDebts: BabyStepDebtItem[];
    targetDebt: BabyStepDebtItem | null;
    totalIncome: number;
    totalInvested: number;
    investmentPercentOfIncome: number;
    investTargetPercent: number | null;
    investmentTarget15: number;
    donationsTotal: number;
    tithePercentOfIncome: number;
    titheTargetPercent: number | null;
    houseDownPaymentTarget: number | null;
    houseDownPaymentSaved: number;
    houseDownPaymentProgress: number;
    hasHomeFinancing: boolean;
    homeFinancings: Array<{
      id: string;
      name: string;
      remainingBalance: number;
      installmentAmount: number;
    }>;
    needsDataSetup: boolean;
  };
  blockers: string[];
}

export interface BabyStepSettingsInput {
  emergencyFundBalance?: number;
  emergencyFundTarget?: number | null;
  houseDownPaymentTarget?: number | null;
  houseDownPaymentSaved?: number;
}

export type CashFlowSource =
  | 'income'
  | 'expense'
  | 'fixed_expense'
  | 'installment'
  | 'subscription'
  | 'financing'
  | 'donation'
  | 'investment'
  | 'credit_card_bill'
  | 'transfer';

/** `internal`: transferência com origem e destino dentro do filtro — não muda o saldo. */
export type CashFlowDirection = 'in' | 'out' | 'internal';

export interface TransferInfo {
  fromScope: FinanceScope;
  toScope: FinanceScope;
  fromBankAccountId: string | null;
  toBankAccountId: string | null;
}

export interface CashFlowMovement {
  id: string;
  source: CashFlowSource;
  name: string;
  amount: number;
  direction: CashFlowDirection;
  day: number | null;
  scope: FinanceScope | 'mixed';
  bankAccountId: string | null;
  paid?: boolean;
  creditCardId?: string;
  items?: CashFlowMovement[];
  transfer?: TransferInfo;
}

export interface CashFlowDay {
  day: number;
  date: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
  movements: CashFlowMovement[];
}

export interface CashFlow {
  monthId: string;
  status: 'open' | 'closed';
  year: number;
  month: number;
  daysInMonth: number;
  undatedRule: 'start_of_month';
  filter: { scope: ScopeFilter; spaceId?: string | null; bankAccountId: string | null };
  space?: SpaceRef | null;
  openingBalance: number;
  undated: { inflow: number; outflow: number; net: number; movements: CashFlowMovement[] };
  days: CashFlowDay[];
  totals: {
    inflow: number;
    outflow: number;
    net: number;
    closingBalance: number;
    lowestBalance: number;
    lowestBalanceDay: number;
    firstNegativeDay: number | null;
    datedCount: number;
    undatedCount: number;
  };
  byAccount: { bankAccountId: string | null; name: string; inflow: number; outflow: number; net: number }[];
  byScope: { scope: FinanceScope; inflow: number; outflow: number; net: number }[];
  bySpace?: { spaceId: string; name: string; kind: FinanceScope; inflow: number; outflow: number; net: number }[];
}

// ---------- Planos (catálogo, recursos e upgrade) ----------

export type PlanTier = 'free' | 'essencial' | 'dono' | 'cfo' | 'conselho';
export type PlanCycle = 'monthly' | 'annual';
export type PlanFeature =
  | 'core_finance'
  | 'ai_assistant'
  | 'business_spaces'
  | 'multiple_companies'
  | 'statement_import'
  | 'owner_dashboard'
  | 'whatsapp_ai'
  | 'export'
  | 'human_review'
  | 'council';

export interface PlanPrice {
  value: number;
  monthlyEquivalent: number;
  intervalMonths: number;
  aiCreditsIncluded: number;
  compareAt?: number;
}

export interface PlanCatalogEntry {
  tier: PlanTier;
  name: string;
  audience: 'pf' | 'dono';
  tagline: string;
  checkout: 'self_service' | 'contact' | 'none';
  available: boolean;
  prices: Partial<Record<PlanCycle, PlanPrice>>;
  setupFee: number | null;
  minimumMonths: number | null;
  features: PlanFeature[];
  limits: { maxBusinessSpaces: number };
  highlights: string[];
}

export interface PlanCatalog {
  plans: PlanCatalogEntry[];
  salesContactUrl: string;
}

export interface PlanEntitlements {
  tier: PlanTier;
  effectiveTier: PlanTier;
  features: PlanFeature[];
  limits: { maxBusinessSpaces: number };
}

export interface MyPlan extends PlanEntitlements {
  planName: string;
  cycle: PlanCycle | null;
  hasAccess: boolean;
  provider: 'asaas' | 'stripe' | null;
  pendingUpgrade: { id: string; planTier: PlanTier; plan: string; paymentMethod: string; createdAt: string } | null;
}

export interface UpgradeStartResponse {
  orderId: string;
  status: 'paid' | 'awaiting_payment';
  tier: PlanTier;
  amount: number;
  checkoutUrl?: string;
  pix?: { encodedImage: string; payload: string; expirationDate: string };
}

export interface UpgradeStatus {
  orderId: string;
  status: 'pending' | 'awaiting_payment' | 'paid' | 'expired' | 'canceled';
  tier: PlanTier;
  paidAt: string | null;
}

export interface BillingHistoryItem {
  id: string;
  provider: string;
  planTier: PlanTier | null;
  planName: string | null;
  billingPlan: 'monthly' | 'semester' | 'annual' | null;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'refunded' | 'canceled';
  billingType: string | null;
  description: string | null;
  dueDate: string | null;
  paidAt: string | null;
  invoiceUrl: string | null;
  createdAt: string;
}

// ---------- Painel interno (equipe) ----------

export interface ValidationSignal {
  key: string;
  label: string;
  target: string;
  value: number | null;
  unit: 'count' | 'percent';
  status: 'ok' | 'attention' | 'no_data';
  detail: string;
}

export interface AdminMetrics {
  generatedAt: string;
  signals: ValidationSignal[];
  users: {
    total: number;
    new7d: number;
    new30d: number;
    new90d: number;
    withBusiness: number;
    byEffectiveTier: Partial<Record<PlanTier, number>>;
    payingDono: number;
  };
  engagement: {
    wau: number;
    mau: number;
    retentionD7: { eligible: number; retained: number; rate: number | null };
    retentionD30: { eligible: number; retained: number; rate: number | null };
    activationRate30d: number | null;
    activatedTotal: number;
  };
  ai: {
    messages7d: number;
    messages30d: number;
    users30d: number;
    messagesPerUser30d: number | null;
    entriesByAiShare30d: number | null;
  };
  activity: {
    entries30d: number;
    imports30d: number;
    checkinsSent30d: number;
    checkinsAnswered30d: number;
    checkinResponseRate30d: number | null;
    upgrades30d: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  planTier: PlanTier;
  effectiveTier: PlanTier;
  billingStatus: string;
  currentPeriodEnd: string | null;
}

// ---------------------------------------------------------------- Importação de extrato (fase 2, item 5)

export type StatementLineKind = 'expense' | 'income' | 'transfer' | 'ignore';
export type StatementLineStatus = 'pending' | 'imported' | 'duplicate' | 'ignored';
export type CategorySuggestionSource = 'rule' | 'history' | 'ai' | 'keyword' | 'manual';
export type StatementImportStatus = 'review' | 'committed' | 'discarded';

export interface StatementLine {
  id: string;
  date: string;
  amount: number;
  description: string;
  name: string;
  kind: StatementLineKind;
  status: StatementLineStatus;
  categoryId: string | null;
  categoryName: string | null;
  categorySource: CategorySuggestionSource | null;
  transferKind: TransferKind | null;
  possibleDuplicate: { type: string; id: string; name: string } | null;
  entryType: string | null;
  entryId: string | null;
  suggestedPattern: string;
}

export interface StatementImportSummary {
  pending: number;
  expenses: number;
  incomes: number;
  transfers: number;
  ignored: number;
  uncategorized: number;
  possibleDuplicates: number;
  duplicates: number;
  totalOut: number;
  totalIn: number;
}

export interface StatementImportListItem {
  id: string;
  spaceId: string;
  bankAccountId: string | null;
  fileName: string;
  format: 'ofx' | 'csv';
  bankLabel: string | null;
  status: StatementImportStatus;
  periodStart: string | null;
  periodEnd: string | null;
  totalLines: number;
  duplicateLines: number;
  importedLines: number;
  createdAt: string;
  committedAt: string | null;
  pendingLines?: number;
}

export interface StatementImport extends StatementImportListItem {
  summary: StatementImportSummary;
  lines: StatementLine[];
}

export interface StatementCommitResult {
  expenses: number;
  incomes: number;
  transfers: number;
  transfersLinked: number;
  ignored: number;
  monthsCreated: string[];
  import: StatementImport;
}

export interface CategorizationRule {
  id: string;
  spaceId: string | null;
  pattern: string;
  kind: StatementLineKind;
  categoryId: string | null;
  categoryName: string | null;
  transferKind: TransferKind | null;
  renameTo: string | null;
  matchCount: number;
}

// ── Pró-labore (item 6) ──
export type ProLaboreAlertCode =
  | 'limit_exceeded'
  | 'extra_withdrawal'
  | 'defined_above_sustainable'
  | 'cash_below_reserve'
  | 'negative_profit'
  | 'cash_unknown'
  | 'no_history';

export interface ProLaboreAlert {
  code: ProLaboreAlertCode;
  level: 'danger' | 'warning' | 'info';
  message: string;
}

export interface ProLaboreSettings {
  definedAmount: number | null;
  payDay: number | null;
  minReserveMonths: number;
  minReserveAmount: number | null;
  lookbackMonths: number;
  configured: boolean;
}

export type OwnerWithdrawalKind = 'pro_labore' | 'withdrawal' | 'profit_distribution';

export interface ProLaboreStatus {
  basis: 'history' | 'current_month' | 'none';
  monthsUsed: number;
  avgRevenue: number;
  avgCosts: number;
  avgProfit: number;
  sustainable: number;
  minReserve: number;
  cashCurrent: number | null;
  cashProjectedEnd: number | null;
  daysOfCash: number | null;
  definedAmount: number | null;
  monthLimit: number;
  withdrawnProLabore: number;
  withdrawnExtra: number;
  withdrawnTotal: number;
  remaining: number;
  exceededBy: number;
  alerts: ProLaboreAlert[];
  space: { id: string; name: string };
  month: { id: string; year: number; month: number; status: 'open' | 'closed' } | null;
  settings: ProLaboreSettings;
  accountsCount: number;
  history: Array<{ year: number; month: number; revenue: number; costs: number; profit: number; proLabore: number; extra: number; defined: number | null }>;
}

export interface WithdrawalCheck {
  amount: number;
  allowed: boolean;
  remainingBefore: number;
  remainingAfter: number;
  exceedBy: number;
  message: string;
}

// ── Painel do dono (item 7) ──
export interface OwnerDashboardAlert {
  level: 'danger' | 'warning' | 'info';
  area: 'company' | 'personal';
  message: string;
  href?: string;
  spaceName?: string;
}

export interface OwnerDashboardCompany {
  spaceId: string;
  name: string;
  cashCurrent: number | null;
  cashProjectedEnd: number | null;
  daysOfCash: number | null;
  avgCosts: number;
  monthRevenue: number;
  monthCosts: number;
  monthProfit: number;
  sustainable: number;
  definedAmount: number | null;
  monthLimit: number;
  remaining: number;
  withdrawnTotal: number;
  withdrawnProLabore: number;
  withdrawnExtra: number;
  exceededBy: number;
}

export interface OwnerDashboard {
  month: { id: string; year: number; month: number; status: 'open' | 'closed' } | null;
  companies: OwnerDashboardCompany[];
  totals: { cashCurrent: number | null; cashKnownFor: number; daysOfCash: number | null; remaining: number; withdrawnTotal: number; monthProfit: number };
  personal: {
    cashCurrent: number | null;
    emergencyFund: { balance: number; target: number; months: number; targetMonths: number };
    consumerDebt: { total: number; count: number; next: { name: string; remainingBalance: number } | null };
    homeFinancing: number;
    monthIncome: number;
    monthCostOfLiving: number;
    firstNegativeDay: number | null;
  };
  alerts: OwnerDashboardAlert[];
  generatedInMs: number;
}

// ── WhatsApp (item 8) ──
export interface WhatsAppLinkView {
  phoneMasked: string;
  status: 'pending' | 'verified';
  verifiedAt: string | null;
  codeExpiresAt: string | null;
  alertsEnabled: boolean;
  weeklyCheckinEnabled: boolean;
  checkinWeekday: number;
  checkinHour: number;
}

export interface WhatsAppStatus {
  configured: boolean;
  businessNumber: string | null;
  featureEnabled: boolean;
  link: WhatsAppLinkView | null;
}

export interface WhatsAppLinkStart {
  code: string;
  expiresAt: string;
  messageText: string;
  waLink: string | null;
  link: WhatsAppLinkView | null;
}
