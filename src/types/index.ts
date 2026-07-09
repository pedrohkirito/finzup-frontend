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
  billing: UserBilling;
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
}

export interface IncomeEntry {
  id: string;
  name: string;
  amount: string | number;
  carryForward: boolean;
}

export interface ExpenseEntry {
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
}

export interface MonthBudget {
  templateId: string;
  name: string;
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

export interface FixedExpenseTemplate {
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

export interface InstallmentPlan {
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

export interface Subscription {
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

export interface Financing {
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

export interface InvestmentEntry {
  id: string;
  name: string;
  amount: string | number;
  notes?: string | null;
}

export interface DonationEntry {
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

export interface MonthSummary {
  month: FinancialMonth;
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  balance: number;
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
  };
}

export interface MonthReport {
  month: FinancialMonth;
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
