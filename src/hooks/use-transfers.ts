'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TransferEntry } from '@/types';

export function useTransfers(monthId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['months', monthId, 'transfers'],
    queryFn: () => api.get<TransferEntry[]>(`/months/${monthId}/transfers`),
    enabled: !!monthId && enabled,
  });
}
