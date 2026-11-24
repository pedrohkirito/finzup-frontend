'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { readSpaceSelection, subscribeSpaceSelection, writeSpaceSelection } from '@/lib/space-store';
import type { Space, SpaceSelection, SpacesResponse } from '@/types';

export const SPACES_QUERY_KEY = ['spaces'] as const;

export function useSpaces(options: { includeArchived?: boolean } = {}) {
  return useQuery({
    queryKey: [...SPACES_QUERY_KEY, options.includeArchived ? 'archived' : 'active'],
    queryFn: () => api.get<SpacesResponse>(`/spaces${options.includeArchived ? '?includeArchived=true' : ''}`),
    staleTime: 60_000,
  });
}

/** Lista só dos espaços ativos, com o pessoal primeiro. */
export function useActiveSpaces() {
  const { data, ...rest } = useSpaces();
  const spaces = useMemo(() => (data?.spaces ?? []).filter((s) => !s.archived), [data]);
  const personal = spaces.find((s) => s.kind === 'personal');
  const businesses = spaces.filter((s) => s.kind === 'business');
  return { data, spaces, personal, businesses, ...rest };
}

/**
 * Espaço escolhido no topo ("all" = consolidado). Trocar recarrega todas as telas,
 * porque a API filtra pelo header X-Finzup-Space.
 */
export function useSpaceSelection(): [SpaceSelection, (value: SpaceSelection) => void] {
  const queryClient = useQueryClient();
  const value = useSyncExternalStore(subscribeSpaceSelection, readSpaceSelection, () => 'all');
  const setValue = useCallback(
    (next: SpaceSelection) => {
      writeSpaceSelection(next);
      // Limpa os dados do espaço anterior (sem mostrar números de outro espaço enquanto carrega).
      void queryClient.resetQueries({ predicate: (q) => q.queryKey[0] !== 'auth' && q.queryKey[0] !== SPACES_QUERY_KEY[0] });
    },
    [queryClient],
  );
  return [value, setValue];
}

/** Espaço escolhido (objeto), ou null na visão consolidada / enquanto carrega. */
export function useSelectedSpace(): Space | null {
  const [selection] = useSpaceSelection();
  const { spaces } = useActiveSpaces();
  if (selection === 'all') return null;
  return spaces.find((s) => s.id === selection) ?? null;
}

/**
 * Espaço onde um lançamento novo vai cair: o do formulário, o escolhido no topo ou o pessoal.
 */
export function useEffectiveSpace(formSpaceId?: string | null): Space | undefined {
  const selected = useSelectedSpace();
  const { spaces, personal } = useActiveSpaces();
  if (formSpaceId) return spaces.find((s) => s.id === formSpaceId) ?? personal;
  return selected ?? personal;
}

function invalidateSpaces(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; cnpj?: string | null }) => api.post<Space>('/spaces', data),
    onSuccess: () => {
      void invalidateSpaces(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; cnpj?: string | null; archived?: boolean }) =>
      api.patch<Space>(`/spaces/${id}`, data),
    onSuccess: () => void invalidateSpaces(queryClient),
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/spaces/${id}`),
    onSuccess: () => void invalidateSpaces(queryClient),
  });
}

export function formatCnpj(value: string | null | undefined): string {
  const d = (value ?? '').replace(/\D/g, '');
  if (d.length !== 14) return value ?? '';
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
