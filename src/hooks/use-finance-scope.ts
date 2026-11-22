'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { ScopeFilter } from '@/types';

const STORAGE_KEY = 'finzup:scope-filter';
const CHANGE_EVENT = 'finzup:scope-filter-change';

function isScopeFilter(value: unknown): value is ScopeFilter {
  return value === 'all' || value === 'personal' || value === 'business';
}

function readScope(): ScopeFilter {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isScopeFilter(stored) ? stored : 'all';
  } catch {
    return 'all';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** O fluxo PJ está ligado no perfil do usuário? */
export function useBusinessEnabled() {
  const { data: user } = useAuth({ refetchOnWindowFocus: false });
  return !!user?.businessEnabled;
}

/**
 * Visão escolhida (Consolidado, PF ou PJ), compartilhada entre Visão geral,
 * Relatórios e Fluxo de caixa e lembrada no navegador.
 * Com o PJ desligado, a visão é sempre o consolidado.
 */
export function useScopeFilter(): [ScopeFilter, (scope: ScopeFilter) => void] {
  const businessEnabled = useBusinessEnabled();
  const stored = useSyncExternalStore(subscribe, readScope, () => 'all' as ScopeFilter);
  const setScope = useCallback((scope: ScopeFilter) => {
    try {
      localStorage.setItem(STORAGE_KEY, scope);
    } catch {
      // sem localStorage: a escolha vale só até recarregar
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [businessEnabled ? stored : 'all', setScope];
}

export const SCOPE_LABELS: Record<ScopeFilter, string> = {
  all: 'Consolidado',
  personal: 'PF',
  business: 'PJ',
};

export const SCOPE_LONG_LABELS: Record<ScopeFilter, string> = {
  all: 'PF + PJ',
  personal: 'Pessoa física',
  business: 'Empresa (PJ)',
};

export function scopeQuery(scope: ScopeFilter) {
  return scope === 'all' ? '' : `?scope=${scope}`;
}
