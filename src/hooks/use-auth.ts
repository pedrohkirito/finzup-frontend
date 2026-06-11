'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<User>('/users/me'),
    retry: false,
  });
}
