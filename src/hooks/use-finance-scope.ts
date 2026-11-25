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

/** Está vendo uma empresa? No lado do dono usamos linguagem gerencial (sem termos contábeis do CRC). */
export function useBusinessView(): boolean {
  return useSelectedSpace()?.kind === 'business';
}

/** Nomes do lado do dono: "orçamento" vira "limite de gasto" e "relatórios" vira "painel gerencial do dono". */
export const BUSINESS_NAV_LABELS: Record<string, string> = {
  '/dashboard/relatorios': 'Painel do dono',
};

export function useNavLabel() {
  const business = useBusinessView();
  return (href: string, label: string) => (business ? (BUSINESS_NAV_LABELS[href] ?? label) : label);
}

export function budgetTerms(business: boolean) {
  return business
    ? {
        title: 'Categorias',
        singular: 'limite de gasto',
        newLabel: 'Novo limite de gasto',
        planned: 'Limites planejados',
        firstLabel: 'Criar primeiro limite de gasto',
        description:
          'Um teto de gasto por categoria da empresa. As despesas lançadas na categoria somam aqui e mostram o que ainda cabe no mês.',
      }
    : {
        title: 'Categorias',
        singular: 'orçamento',
        newLabel: 'Novo orçamento',
        planned: 'Orçamentos planejados',
        firstLabel: 'Criar primeiro orçamento',
        description:
          'Um teto de gasto por categoria. As despesas lançadas na categoria somam aqui e mostram o que ainda cabe no mês.',
      };
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
