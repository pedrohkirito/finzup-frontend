'use client';

import { createContext, useContext, useEffect } from 'react';
import { syncInvestmentPageBridgeState } from '@/lib/investment-page-bridge';

export type InvestmentTab = 'reserva' | 'aportes' | 'casa' | 'simulador';

type InvestmentPageContextValue = {
  activeTab: InvestmentTab;
  selectedSimulationId: string | null;
};

const InvestmentPageContext = createContext<InvestmentPageContextValue>({
  activeTab: 'aportes',
  selectedSimulationId: null,
});

export function InvestmentPageProvider({
  activeTab,
  selectedSimulationId,
  children,
}: {
  activeTab: InvestmentTab;
  selectedSimulationId: string | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    syncInvestmentPageBridgeState({ activeTab, selectedSimulationId });
  }, [activeTab, selectedSimulationId]);

  return (
    <InvestmentPageContext.Provider value={{ activeTab, selectedSimulationId }}>
      {children}
    </InvestmentPageContext.Provider>
  );
}

export function useInvestmentPage() {
  return useContext(InvestmentPageContext);
}

export function useInvestmentPageOptional() {
  return useContext(InvestmentPageContext);
}
