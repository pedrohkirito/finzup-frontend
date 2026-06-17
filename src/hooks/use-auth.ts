'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

export function useAuth(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<User>('/users/me'),
    retry: false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      queryClient.clear();
      router.replace('/login');
    }
  };
}
