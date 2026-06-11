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
  notes?: string | null;
}

export interface FixedExpenseTemplate {
  id: string;
  name: string;
  defaultAmount: string | number;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  isSystemSeeded: boolean;
}

export interface InstallmentPlan {
  id: string;
  name: string;
  totalInstallments: number;
  installmentAmount: string | number;
  totalAmount: string | number;
  installmentsPaid: number;
  active: boolean;
  paymentMethod: PaymentMethod;
}

export interface Subscription {
  id: string;
  name: string;
  amount: string | number;
  active: boolean;
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
  };
  investment: { targetAmount: number; totalInvested: number; progress: number };
}
