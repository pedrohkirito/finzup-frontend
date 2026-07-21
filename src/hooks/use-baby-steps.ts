'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';
import type { BabyStepSettingsInput, BabyStepState } from '@/types';

export function useBabySteps() {
  return useQuery({
    queryKey: ['baby-steps'],
    queryFn: () => api.get<BabyStepState>('/baby-steps'),
    enabled: BABY_STEPS_ENABLED,
    staleTime: 30_000,
  });
}

export function useUpdateBabyStepSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BabyStepSettingsInput) =>
      api.patch<BabyStepState>('/baby-steps/settings', input),
    onSuccess: (data) => {
      queryClient.setQueryData(['baby-steps'], data);
      void queryClient.invalidateQueries({ queryKey: ['ai', 'suggestions'] });
    },
  });
}
