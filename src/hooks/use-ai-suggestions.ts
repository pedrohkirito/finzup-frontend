'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AiSuggestion = {
  id: string;
  triggerKey: string;
  tier: 'rule' | 'ai';
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  chatPrompt: string | null;
};

export function useAiSuggestions() {
  return useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: () => api.get<AiSuggestion[]>('/ai/suggestions'),
    staleTime: 60_000,
  });
}

export function useAiSuggestionActions() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ai', 'suggestions'] });

  const dismiss = async (id: string) => {
    await api.post(`/ai/suggestions/${id}/dismiss`);
    await invalidate();
  };

  const act = async (id: string) => {
    await api.post(`/ai/suggestions/${id}/act`);
    await invalidate();
  };

  return { dismiss, act };
}

export function useAiSuggestionByTrigger(triggerKey: string) {
  const { data: suggestions } = useAiSuggestions();
  return suggestions?.find((s) => s.triggerKey === triggerKey) ?? null;
}
