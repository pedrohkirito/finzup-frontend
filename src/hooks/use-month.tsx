'use client';

import { createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FinancialMonth } from '@/types';

const MonthContext = createContext<{
  selectedMonthId: string | null;
  setSelectedMonthId: (id: string) => void;
}>({ selectedMonthId: null, setSelectedMonthId: () => {} });

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  return (
    <MonthContext.Provider value={{ selectedMonthId, setSelectedMonthId }}>
      {children}
    </MonthContext.Provider>
  );
}

export const useMonthStore = () => useContext(MonthContext);

export function useCurrentMonth() {
  return useQuery({
    queryKey: ['months', 'current'],
    queryFn: () => api.get<FinancialMonth>('/months/current'),
  });
}

export function useMonths() {
  return useQuery({
    queryKey: ['months'],
    queryFn: () => api.get<FinancialMonth[]>('/months'),
  });
}
