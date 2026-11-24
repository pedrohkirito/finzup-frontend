'use client';

import { useAuth } from '@/hooks/use-auth';
import { useActiveSpaces, useSelectedSpace, useSpaceSelection } from '@/hooks/use-spaces';
import type { ScopeFilter, SpaceSelection } from '@/types';

/** O usuário separa empresa e vida pessoal? (fluxo PJ ligado ou alguma empresa cadastrada) */
export function useBusinessEnabled() {
  const { data: user } = useAuth({ refetchOnWindowFocus: false });
  const { businesses } = useActiveSpaces();
  return !!user?.businessEnabled || businesses.length > 0;
}

/**
 * Visão atual derivada do espaço escolhido no topo: consolidado ("all"), pessoal ("personal")
 * ou empresa ("business"). A troca é feita pelo seletor de espaço do topo.
 */
export function useScopeFilter(): [ScopeFilter, (selection: SpaceSelection) => void] {
  const [, setSelection] = useSpaceSelection();
  const selected = useSelectedSpace();
  return [selected ? selected.kind : 'all', setSelection];
}

/** Nome da visão atual para subtítulos: o espaço escolhido ou "Tudo (pessoal + empresas)". */
export function useScopeLabel(): string | null {
  const businessEnabled = useBusinessEnabled();
  const selected = useSelectedSpace();
  if (!businessEnabled) return null;
  return selected ? selected.name : 'Tudo (pessoal + empresas)';
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
