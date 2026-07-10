import type { InvestmentTab } from '@/providers/investment-page-provider';

type InvestmentPageBridgeState = {
  activeTab: InvestmentTab;
  selectedSimulationId: string | null;
};

type Listener = () => void;

const defaultState: InvestmentPageBridgeState = {
  activeTab: 'aportes',
  selectedSimulationId: null,
};

let state: InvestmentPageBridgeState = { ...defaultState };
const listeners = new Set<Listener>();

export function getInvestmentPageBridgeState(): InvestmentPageBridgeState {
  return state;
}

export function syncInvestmentPageBridgeState(partial: Partial<InvestmentPageBridgeState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

export function subscribeInvestmentPageBridgeState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resolveInvestmentTabFromUrl(
  pathname: string,
  tabParam: string | null,
): InvestmentTab | undefined {
  if (!pathname.startsWith('/dashboard/investimentos')) return undefined;
  if (tabParam === 'simulador') return 'simulador';
  if (tabParam === 'aportes') return 'aportes';
  return undefined;
}
