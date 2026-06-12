export interface User {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
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

export interface Subscription {
  id: string;
  name: string;
  amount: string | number;
  active: boolean;
  budgetTemplateId?: string | null;
  budgetTemplate?: BudgetTemplate | null;
  paymentMethod: PaymentMethod;
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
