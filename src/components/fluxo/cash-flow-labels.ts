import type { CashFlowSource } from '@/types';

export const CASH_FLOW_SOURCE_LABELS: Record<CashFlowSource, string> = {
  income: 'Receita',
  expense: 'Despesa',
  fixed_expense: 'Despesa fixa',
  installment: 'Parcela',
  subscription: 'Assinatura',
  financing: 'Financiamento',
  donation: 'Doação',
  investment: 'Aporte',
  credit_card_bill: 'Fatura do cartão',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** "Seg, 05/12" a partir de "2026-12-05" (sem fuso: a data é só do calendário). */
export function formatFlowDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** Dia de hoje se o mês exibido for o mês corrente; senão `null`. */
export function todayInMonth(year: number, month: number, now = new Date()) {
  return now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : null;
}
