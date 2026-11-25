'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OwnerWithdrawalKind, ProLaboreSettings, ProLaboreStatus, WithdrawalCheck } from '@/types';

export const PRO_LABORE_KEY = ['pro-labore'] as const;

const withMonth = (path: string, monthId?: string | null) => (monthId ? `${path}?monthId=${monthId}` : path);

export function useProLabore(monthId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: [...PRO_LABORE_KEY, monthId ?? 'default'],
    queryFn: () => api.get<ProLaboreStatus[]>(withMonth('/pro-labore', monthId)),
    enabled,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    for (const key of [PRO_LABORE_KEY, ['owner-dashboard'], ['months'], ['bank-accounts'], ['baby-steps']]) {
      void qc.invalidateQueries({ queryKey: key as readonly unknown[] });
    }
  };
}

export function useUpdateProLaboreSettings(monthId?: string | null) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ spaceId, ...data }: Partial<Omit<ProLaboreSettings, 'configured'>> & { spaceId: string }) =>
      api.put<ProLaboreStatus>(withMonth(`/pro-labore/${spaceId}/settings`, monthId), data),
    onSuccess: invalidate,
  });
}

export function useCheckWithdrawal() {
  return useMutation({
    mutationFn: ({ spaceId, amount, monthId }: { spaceId: string; amount: number; monthId?: string | null }) =>
      api.post<WithdrawalCheck>(`/pro-labore/${spaceId}/check`, { amount, monthId: monthId ?? null }),
  });
}

export function useRecordWithdrawal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ spaceId, ...data }: { spaceId: string; amount: number; kind: OwnerWithdrawalKind; monthId?: string | null; day?: number | null }) =>
      api.post<{ status: ProLaboreStatus; alert: { message: string } | null; check: WithdrawalCheck }>(`/pro-labore/${spaceId}/withdrawals`, data),
    onSuccess: invalidate,
  });
}
