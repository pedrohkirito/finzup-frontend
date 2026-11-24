'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, CategoryKind, FinanceScope } from '@/types';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

/** Tudo que mostra categorias ou orçamentos e precisa recarregar depois de mudar uma categoria. */
export const CATEGORY_RELATED_KEYS = [
  ['categories'],
  ['budget-templates'],
  ['budgets'],
  ['summary'],
  ['incomes'],
  ['expenses'],
  ['donations'],
  ['reports'],
];

export function useCategories(options: { includeArchived?: boolean; scope?: FinanceScope } = {}) {
  const params = new URLSearchParams();
  if (options.includeArchived) params.set('includeArchived', 'true');
  if (options.scope) params.set('scope', options.scope);
  const qs = params.toString();
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, options.scope ?? 'all', options.includeArchived ? 'archived' : 'active'],
    queryFn: () => api.get<Category[]>(`/categories${qs ? `?${qs}` : ''}`),
    staleTime: 60_000,
  });
}

export function filterCategories(list: Category[] | undefined, kind: CategoryKind, scope?: FinanceScope) {
  return (list ?? []).filter((c) => c.kind === kind && !c.archived && (!scope || c.scope === scope));
}

export function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => Promise.all(CATEGORY_RELATED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (data: { name: string; kind: CategoryKind; scope: FinanceScope; defaultLimit?: number }) =>
      api.post<Category>('/categories', data),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; defaultLimit?: number; archived?: boolean }) =>
      api.patch<Category>(`/categories/${id}`, data),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ archived: boolean; deleted: boolean; linkedEntries: number; message: string }>(`/categories/${id}`),
    onSuccess: () => invalidate(),
  });
}

export function useAddDefaultCategories() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (scope: FinanceScope) => api.post<{ created: number }>('/categories/defaults', { scope }),
    onSuccess: () => invalidate(),
  });
}
