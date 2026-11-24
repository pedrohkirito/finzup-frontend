'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BankAccount } from '@/types';

export const BANK_ACCOUNTS_QUERY_KEY = ['bank-accounts'] as const;

/**
 * Contas com saldo. `fresh` refaz a busca ao montar (os saldos mudam com qualquer lançamento ligado);
 * os formulários usam a lista em cache.
 */
export function useBankAccounts(options: { fresh?: boolean } = {}) {
  return useQuery({
    queryKey: BANK_ACCOUNTS_QUERY_KEY,
    queryFn: () => api.get<BankAccount[]>('/bank-accounts'),
    staleTime: 60_000,
    ...(options.fresh && { refetchOnMount: 'always' as const }),
  });
}
