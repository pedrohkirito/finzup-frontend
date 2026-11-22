'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BankAccount } from '@/types';

export const BANK_ACCOUNTS_QUERY_KEY = ['bank-accounts'] as const;

export function useBankAccounts() {
  return useQuery({
    queryKey: BANK_ACCOUNTS_QUERY_KEY,
    queryFn: () => api.get<BankAccount[]>('/bank-accounts'),
    staleTime: 60_000,
  });
}
