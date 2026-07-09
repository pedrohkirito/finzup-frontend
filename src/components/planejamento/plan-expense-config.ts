import type { PlanExpenseType } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Receipt,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';

export const EXPENSE_TYPE_CONFIG: Record<
  PlanExpenseType,
  { label: string; color: string; dot: string; chartColor: string; icon: LucideIcon }
> = {
  fixed: {
    label: 'Fixas',
    color: 'text-red-500 dark:text-red-400',
    dot: 'bg-red-400',
    chartColor: '#f87171',
    icon: Receipt,
  },
  installment: {
    label: 'Parceladas',
    color: 'text-orange-500 dark:text-orange-400',
    dot: 'bg-orange-400',
    chartColor: '#fb923c',
    icon: CalendarClock,
  },
  subscription: {
    label: 'Assinaturas',
    color: 'text-amber-500 dark:text-amber-400',
    dot: 'bg-amber-400',
    chartColor: '#fbbf24',
    icon: RefreshCw,
  },
  variable: {
    label: 'Variáveis',
    color: 'text-rose-500 dark:text-rose-400',
    dot: 'bg-rose-400',
    chartColor: '#fb7185',
    icon: TrendingDown,
  },
  financing: {
    label: 'Financiamentos',
    color: 'text-pink-500 dark:text-pink-400',
    dot: 'bg-pink-400',
    chartColor: '#f472b6',
    icon: CreditCard,
  },
  debt: {
    label: 'Dívidas',
    color: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500',
    chartColor: '#64748b',
    icon: AlertTriangle,
  },
};

export const EXPENSE_TYPE_ORDER: PlanExpenseType[] = [
  'fixed',
  'installment',
  'subscription',
  'variable',
  'financing',
  'debt',
];

export const DONATION_CHART_COLOR = '#38bdf8';
export const INVESTMENT_CHART_COLOR = '#a78bfa';
