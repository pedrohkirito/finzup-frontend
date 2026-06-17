'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMonthStore } from '@/hooks/use-month';
import type { MonthReport, MonthSummary } from '@/types';

export function useMonthSummary(monthId?: string | null) {
  const { selectedMonthId } = useMonthStore();
  const id = monthId ?? selectedMonthId;

  return useQuery({
    queryKey: ['months', id, 'summary'],
    queryFn: () => api.get<MonthSummary>(`/months/${id}/summary`),
    enabled: !!id,
  });
}

export function useMonthReport(monthId?: string | null) {
  const { selectedMonthId } = useMonthStore();
  const id = monthId ?? selectedMonthId;

  return useQuery({
    queryKey: ['months', id, 'reports'],
    queryFn: () => api.get<MonthReport>(`/months/${id}/reports`),
    enabled: !!id,
  });
}
