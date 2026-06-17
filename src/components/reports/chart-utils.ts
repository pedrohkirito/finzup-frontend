export const CHART_COLORS = [
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
  '#14b8a6',
];

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(15, 23, 42, 0.88)',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    padding: '8px 12px',
    fontSize: '15px',
    color: '#ffffff',
    backdropFilter: 'blur(4px)',
  },
  labelStyle: { color: '#ffffff', fontWeight: 700, marginBottom: 2 },
  itemStyle: { color: '#ffffff' },
  cursor: { fill: 'rgba(148,163,184,0.08)' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
  pix: 'PIX',
  transfer: 'Transferência',
  other: 'Outro',
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  avulsa: 'Avulsas',
  fixa: 'Fixas',
  parcelamento: 'Parceladas',
  assinatura: 'Assinaturas',
  financiamento: 'Financiamentos',
};
