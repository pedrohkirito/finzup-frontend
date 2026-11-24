'use client';

import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { BillingHistoryItem, MyPlan, PlanCatalog, PlanFeature, PlanTier } from '@/types';

export const PLAN_QUERY_KEYS = {
  catalog: ['billing', 'catalog'] as const,
  myPlan: ['billing', 'my-plan'] as const,
  history: ['billing', 'history'] as const,
};

export function usePlanCatalog() {
  return useQuery({
    queryKey: PLAN_QUERY_KEYS.catalog,
    queryFn: () => api.get<PlanCatalog>('/billing/catalog'),
    staleTime: 5 * 60_000,
  });
}

export function useMyPlan(enabled = true) {
  return useQuery({
    queryKey: PLAN_QUERY_KEYS.myPlan,
    queryFn: () => api.get<MyPlan>('/billing/my-plan'),
    enabled,
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: PLAN_QUERY_KEYS.history,
    queryFn: () => api.get<BillingHistoryItem[]>('/billing/history'),
  });
}

/** O plano atual libera o recurso? (lê do /users/me, que já vem no layout). */
export function useHasFeature(feature: PlanFeature): boolean {
  const { data: user } = useAuth();
  return !!user?.plan?.features.includes(feature);
}

/** Erro 403 de plano: devolve o plano mínimo para liberar o recurso. */
export function planUpgradeInfo(error: unknown): { requiredTier: PlanTier | null; message: string } | null {
  if (!(error instanceof ApiError) || error.code !== 'PLAN_UPGRADE_REQUIRED') return null;
  const details = (error.details ?? {}) as { requiredTier?: PlanTier | null };
  return { requiredTier: details.requiredTier ?? null, message: error.message };
}

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: 'PF Grátis',
  essencial: 'PF Essencial',
  dono: 'Dono App',
  cfo: 'CFO de bolso',
  conselho: 'Conselho',
};
