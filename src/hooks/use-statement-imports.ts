'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  CategorizationRule,
  StatementBatch,
  StatementBatchCommitResult,
  StatementBatchListItem,
  StatementCommitResult,
  StatementImport,
  StatementImportListItem,
  StatementLineDecision,
  StatementLineKind,
  TransferKind,
} from '@/types';

export const IMPORTS_QUERY_KEY = ['statement-imports'] as const;
export const BATCHES_QUERY_KEY = ['statement-batches'] as const;
export const RULES_QUERY_KEY = ['categorization-rules'] as const;

/** Tudo que muda quando uma importação é confirmada ou desfeita. */
const ENTRY_KEYS = [['months'], ['summary'], ['expenses'], ['incomes'], ['transfers'], ['cash-flow'], ['reports'], ['bank-accounts'], ['baby-steps'], ['owner-dashboard'], ['pro-labore']];

export function useStatementImports() {
  return useQuery({ queryKey: IMPORTS_QUERY_KEY, queryFn: () => api.get<StatementImportListItem[]>('/statement-imports') });
}

export function useStatementImport(id: string | null) {
  return useQuery({
    queryKey: [...IMPORTS_QUERY_KEY, id],
    queryFn: () => api.get<StatementImport>(`/statement-imports/${id}`),
    enabled: !!id,
  });
}

/** Lê o arquivo como base64 (o backend detecta UTF-8 ou Latin-1). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useUploadStatement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { file: File; spaceId?: string | null; bankAccountId?: string | null }) =>
      api.post<StatementImport>('/statement-imports', {
        fileName: input.file.name,
        contentBase64: await fileToBase64(input.file),
        spaceId: input.spaceId ?? null,
        bankAccountId: input.bankAccountId ?? null,
      }),
    onSuccess: (data) => {
      qc.setQueryData([...IMPORTS_QUERY_KEY, data.id], data);
      void qc.invalidateQueries({ queryKey: IMPORTS_QUERY_KEY, exact: true });
    },
  });
}

export type LinePatch = {
  kind?: StatementLineKind;
  categoryId?: string | null;
  name?: string;
  transferKind?: TransferKind | null;
  createRule?: boolean;
  rulePattern?: string;
};

export function useUpdateLines(importId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineIds, ...patch }: LinePatch & { lineIds: string[] }) =>
      lineIds.length === 1
        ? api.patch<{ import: StatementImport; appliedToOthers: number }>(`/statement-imports/${importId}/lines/${lineIds[0]}`, patch)
        : api.post<{ import: StatementImport; appliedToOthers: number }>(`/statement-imports/${importId}/lines/bulk`, { lineIds, ...patch }),
    onSuccess: (data, vars) => {
      qc.setQueryData([...IMPORTS_QUERY_KEY, importId], data.import);
      if (vars.createRule) void qc.invalidateQueries({ queryKey: RULES_QUERY_KEY });
    },
  });
}

function useImportAction<T>(path: 'commit' | 'discard' | 'undo') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (importId: string) => api.post<T>(`/statement-imports/${importId}/${path}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: IMPORTS_QUERY_KEY });
      if (path !== 'discard') ENTRY_KEYS.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
    },
  });
}

export const useCommitImport = () => useImportAction<StatementCommitResult>('commit');
export const useDiscardImport = () => useImportAction<{ ok: boolean }>('discard');
export const useUndoImport = () => useImportAction<{ removed: number }>('undo');

export type BatchLinePatch = {
  decision?: StatementLineDecision | null;
  matchEntryId?: string | null;
  kind?: StatementLineKind;
  categoryId?: string | null;
  name?: string;
  transferKind?: TransferKind | null;
};

export function useStatementBatches() {
  return useQuery({ queryKey: BATCHES_QUERY_KEY, queryFn: () => api.get<StatementBatchListItem[]>('/statement-batches') });
}

export function useStatementBatch(id: string | null) {
  return useQuery({
    queryKey: [...BATCHES_QUERY_KEY, id],
    queryFn: () => api.get<StatementBatch>(`/statement-batches/${id}`),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: { file: File; bankAccountId: string }[]) =>
      api.post<StatementBatch>('/statement-batches', {
        files: await Promise.all(
          files.map(async (item) => ({
            fileName: item.file.name,
            contentBase64: await fileToBase64(item.file),
            bankAccountId: item.bankAccountId,
          })),
        ),
      }),
    onSuccess: (data) => {
      qc.setQueryData([...BATCHES_QUERY_KEY, data.id], data);
      void qc.invalidateQueries({ queryKey: BATCHES_QUERY_KEY, exact: true });
    },
  });
}

function rememberBatch(qc: ReturnType<typeof useQueryClient>, batchId: string, batch: StatementBatch) {
  qc.setQueryData([...BATCHES_QUERY_KEY, batchId], batch);
}

export function useUpdateBatchLine(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, ...patch }: BatchLinePatch & { lineId: string }) =>
      api.patch<StatementBatch>(`/statement-batches/${batchId}/lines/${lineId}`, patch),
    onSuccess: (data) => rememberBatch(qc, batchId, data),
  });
}

export function useUpdateBatchLines(batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineIds, ...patch }: BatchLinePatch & { lineIds: string[] }) =>
      api.post<StatementBatch>(`/statement-batches/${batchId}/lines/bulk`, { lineIds, ...patch }),
    onSuccess: (data) => rememberBatch(qc, batchId, data),
  });
}

function useBatchAction<T>(path: 'commit' | 'discard' | 'undo') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => api.post<T>(`/statement-batches/${batchId}/${path}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
      void qc.invalidateQueries({ queryKey: IMPORTS_QUERY_KEY });
      if (path !== 'discard') ENTRY_KEYS.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
    },
  });
}

export const useCommitBatch = () => useBatchAction<StatementBatchCommitResult>('commit');
export const useDiscardBatch = () => useBatchAction<{ ok: boolean }>('discard');
export const useUndoBatch = () => useBatchAction<{ removed: number }>('undo');

export function useCategorizationRules() {
  return useQuery({ queryKey: RULES_QUERY_KEY, queryFn: () => api.get<CategorizationRule[]>('/categorization-rules') });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categorization-rules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: RULES_QUERY_KEY }),
  });
}
