import type { CategorySuggestionSource, StatementLine, StatementLineKind, TransferKind } from '@/types';

export const LINE_KIND_LABEL: Record<StatementLineKind, string> = {
  expense: 'Despesa',
  income: 'Receita',
  transfer: 'Transferência PF ↔ empresa',
  ignore: 'Ignorar',
};

export const SOURCE_LABEL: Record<CategorySuggestionSource, string> = {
  rule: 'Regra',
  history: 'Histórico',
  ai: 'IA sugeriu',
  keyword: 'Sugestão',
  manual: 'Você',
};

export const IMPORT_TRANSFER_KINDS: { value: TransferKind; label: string }[] = [
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'withdrawal', label: 'Retirada' },
  { value: 'profit_distribution', label: 'Distribuição de lucros' },
  { value: 'capital_contribution', label: 'Aporte na empresa' },
  { value: 'other', label: 'Outra' },
];

export function formatShortDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

/** Linha que pede atenção: sem categoria, parecida com um lançamento já existente, ou transferência. */
export function needsAttention(l: StatementLine) {
  if (l.status !== 'pending') return false;
  return ((l.kind === 'expense' || l.kind === 'income') && !l.categoryId) || !!l.possibleDuplicate || l.kind === 'transfer';
}
