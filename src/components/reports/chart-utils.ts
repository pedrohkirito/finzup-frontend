export const BRAND_CYAN = '#03b6e6';
export const BRAND_GREEN = '#22bd7b';

export const CHART_COLORS = [
  BRAND_GREEN,
  '#f97316',
  '#8b5cf6',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  BRAND_CYAN,
  '#14b8a6',
];

// slate-400: legível tanto no fundo claro quanto no dark
export const CHART_AXIS_TICK_FILL = '#94a3b8';

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 12px 32px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#e2e8f0',
  },
  labelStyle: { color: '#f8fafc', fontWeight: 700, marginBottom: 2 },
  itemStyle: { color: '#e2e8f0' },
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

export const EXPENSE_CATEGORY_ORDER = ['avulsa', 'fixa', 'parcelamento', 'assinatura', 'financiamento'] as const;

export const EXPENSE_BREAKDOWN_TYPES = ['fixa', 'assinatura', 'parcelamento', 'financiamento'] as const;
