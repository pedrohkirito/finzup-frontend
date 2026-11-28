'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { resetAssistantChatSession } from '@/lib/assistant-chat-session';
import { resetMixpanel } from '@/lib/mixpanel';
import type { User } from '@/types';

export function useAuth(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<User>('/users/me'),
    retry: false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  });
}

/** A conta atual pode ver o Open Finance. Em produção o backend só marca o e-mail liberado. */
export function useOpenFinance() {
  const { data: user } = useAuth();
  return user?.openFinance === true;
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      queryClient.clear();
      resetAssistantChatSession();
      resetMixpanel();
      router.replace('/login');
    }
  };
}
