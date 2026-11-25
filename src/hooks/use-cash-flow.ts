'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CashFlow, ScopeFilter } from '@/types';

/** Filtro de conta: id de uma conta, `none` (sem conta) ou `all`. */
export type AccountFilter = string;

export function useCashFlow(monthId: string | null | undefined, scope: ScopeFilter, account: AccountFilter) {
  const params = new URLSearchParams();
  if (scope !== 'all') params.set('scope', scope);
  if (account !== 'all') params.set('bankAccountId', account);
  const qs = params.toString();

  return useQuery({
    queryKey: ['months', monthId, 'cash-flow', scope, account],
    queryFn: () => api.get<CashFlow>(`/months/${monthId}/cash-flow${qs ? `?${qs}` : ''}`),
    enabled: !!monthId,
    // Ao trocar filtros no mesmo mês, mantém o fluxo na tela até chegar o novo.
    placeholderData: (prev) => (prev?.monthId === monthId ? prev : undefined),
  });
}
