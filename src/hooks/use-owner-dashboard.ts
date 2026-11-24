'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OwnerDashboard } from '@/types';

export function useOwnerDashboard(monthId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['owner-dashboard', monthId ?? 'default'],
    queryFn: () => api.get<OwnerDashboard>(monthId ? `/owner-dashboard?monthId=${monthId}` : '/owner-dashboard'),
    enabled,
    staleTime: 30_000,
  });
}
