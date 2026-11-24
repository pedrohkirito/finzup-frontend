'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WhatsAppLinkStart, WhatsAppLinkView, WhatsAppStatus } from '@/types';

export const WHATSAPP_KEY = ['whatsapp'] as const;

export function useWhatsApp() {
  return useQuery({
    queryKey: WHATSAPP_KEY,
    queryFn: () => api.get<WhatsAppStatus>('/whatsapp'),
    // Enquanto espera o código chegar pelo WhatsApp, confere a cada 4 s.
    refetchInterval: (query) => (query.state.data?.link?.status === 'pending' ? 4000 : false),
  });
}

export function useStartWhatsAppLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => api.post<WhatsAppLinkStart>('/whatsapp/link', { phone }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: WHATSAPP_KEY }),
  });
}

export function useUpdateWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pick<WhatsAppLinkView, 'alertsEnabled' | 'weeklyCheckinEnabled' | 'checkinWeekday' | 'checkinHour'>>) => api.patch<WhatsAppLinkView>('/whatsapp', data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: WHATSAPP_KEY }),
  });
}

export function useUnlinkWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ ok: boolean }>('/whatsapp'),
    onSuccess: () => void qc.invalidateQueries({ queryKey: WHATSAPP_KEY }),
  });
}
