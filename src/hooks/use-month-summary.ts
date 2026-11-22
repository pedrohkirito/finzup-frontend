'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMonthStore } from '@/hooks/use-month';
import { scopeQuery } from '@/hooks/use-finance-scope';
import type { MonthReport, MonthSummary, ScopeFilter } from '@/types';

export function useMonthSummary(monthId?: string | null, scope: ScopeFilter = 'all') {
  const { selectedMonthId } = useMonthStore();
  const id = monthId ?? selectedMonthId;

  return useQuery({
    queryKey: scope === 'all' ? ['months', id, 'summary'] : ['months', id, 'summary', scope],
    queryFn: () => api.get<MonthSummary>(`/months/${id}/summary${scopeQuery(scope)}`),
    enabled: !!id,
  });
}

export function useMonthReport(monthId?: string | null, scope: ScopeFilter = 'all') {
  const { selectedMonthId } = useMonthStore();
  const id = monthId ?? selectedMonthId;

  return useQuery({
    queryKey: scope === 'all' ? ['months', id, 'reports'] : ['months', id, 'reports', scope],
    queryFn: () => api.get<MonthReport>(`/months/${id}/reports${scopeQuery(scope)}`),
    enabled: !!id,
  });
}
