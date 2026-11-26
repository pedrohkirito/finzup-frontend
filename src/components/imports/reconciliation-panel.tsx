'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import {
  useCommitBatch,
  useDiscardBatch,
  useUpdateBatchLine,
  useUpdateBatchLines,
  type BatchLinePatch,
} from '@/hooks/use-statement-imports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
  Category,
  StatementBatch,
  StatementBatchCommitResult,
  StatementBatchEntry,
  StatementBatchLine,
  StatementLineKind,
  TransferKind,
} from '@/types';
import { formatShortDate } from './import-labels';

const NO_CATEGORY = 'none';
const KIND_LABEL: Record<StatementLineKind, string> = {
  expense: 'Despesa',
  income: 'Receita',
  transfer: 'Transferência',
  ignore: 'Ignorar',
};
const TRANSFER_OPTIONS: { value: TransferKind; label: string }[] = [
  { value: 'between_accounts', label: 'Entre minhas contas' },
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'withdrawal', label: 'Retirada' },
  { value: 'profit_distribution', label: 'Distribuição de lucros' },
  { value: 'capital_contribution', label: 'Aporte na empresa' },
  { value: 'other', label: 'Outra' },
];

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente de novo.';
}

function money(amount: number) {
  const sign = amount < 0 ? '−' : '+';
  return `${sign} ${formatCurrency(Math.abs(amount))}`;
}

function entryChoices(line: StatementBatchLine, entries: StatementBatchEntry[]) {
  const sameAccount = entries.filter((entry) => entry.accountId === line.bankAccountId);
  const pool = sameAccount.length ? sameAccount : entries;
  const byId = new Map<string, StatementBatchEntry>();
  for (const entry of pool) if (!byId.has(entry.id)) byId.set(entry.id, entry);
  return [...byId.values()].slice(0, 120);
}

function entryLabel(entry: Pick<StatementBatchEntry, 'date' | 'dayUnknown' | 'typeLabel' | 'name' | 'amount' | 'accountName'>) {
  const when = entry.dayUnknown ? 'sem dia' : formatShortDate(entry.date);
  return `${when} · ${entry.typeLabel} · ${entry.name} · ${formatCurrency(entry.amount)} · ${entry.accountName}`;
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.04]">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function LineMeta({ line }: { line: StatementBatchLine }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{line.description}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {formatShortDate(line.date)} · {line.bankAccountName}
        {line.fileName ? ` · ${line.fileName}` : ''}
      </p>
      {line.matchReason && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{line.matchReason}</p>}
      {line.matchEntryName && (
        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
          Lançamento: {line.matchEntryName}
          {line.matchEntryAmount != null ? ` · ${formatCurrency(line.matchEntryAmount)}` : ''}
        </p>
      )}
    </div>
  );
}

function DecideRow({
  line,
  entries,
  categories,
  disabled,
  onPatch,
}: {
  line: StatementBatchLine;
  entries: StatementBatchEntry[];
  categories: Category[];
  disabled: boolean;
  onPatch: (patch: BatchLinePatch) => Promise<void>;
}) {
  const [name, setName] = useState(line.name);
  useEffect(() => setName(line.name), [line.name]);
  const choices = entryChoices(line, entries);
  const cats = categories.filter(
    (c) => !c.archived && c.kind === (line.kind === 'income' ? 'income' : 'expense') && (!c.spaceId || c.spaceId === line.spaceId),
  );
  const launchKind: StatementLineKind = line.kind === 'ignore' ? (line.amount < 0 ? 'expense' : 'income') : line.kind;

  return (
    <li className="space-y-3 px-4 py-3">
      <div className="flex items-start gap-3">
        <LineMeta line={line} />
        <p className={cn('shrink-0 text-sm font-semibold', line.amount < 0 ? 'text-red-600' : 'text-emerald-600')}>{money(line.amount)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={line.decision === 'link' ? 'default' : 'outline'}
          disabled={disabled || (!line.matchEntryId && choices.length === 0)}
          onClick={() => void onPatch({ decision: 'link', ...(line.matchEntryId ? { matchEntryId: line.matchEntryId } : { matchEntryId: choices[0]?.id }) })}
        >
          Vincular
        </Button>
        <Button size="sm" variant={line.decision === 'create' ? 'default' : 'outline'} disabled={disabled} onClick={() => void onPatch({ decision: 'create', kind: launchKind })}>
          Lançar
        </Button>
        <Button size="sm" variant={line.decision === 'ignore' ? 'secondary' : 'outline'} disabled={disabled} onClick={() => void onPatch({ decision: 'ignore' })}>
          Ignorar
        </Button>
      </div>
      {line.decision === 'link' && (
        <Select value={line.matchEntryId ?? undefined} onValueChange={(id) => void onPatch({ decision: 'link', matchEntryId: id })} disabled={disabled}>
          <SelectTrigger aria-label="Lançamento correspondente">
            <SelectValue placeholder="Escolha o lançamento" />
          </SelectTrigger>
          <SelectContent>
            {line.matchEntryId && !choices.some((choice) => choice.id === line.matchEntryId) && (
              <SelectItem value={line.matchEntryId}>{line.matchEntryName ?? 'Lançamento vinculado'}</SelectItem>
            )}
            {choices.map((choice) => (
              <SelectItem key={choice.id} value={choice.id}>
                {entryLabel(choice)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {line.decision === 'create' && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            aria-label="Nome do lançamento"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name.trim() !== line.name) void onPatch({ decision: 'create', name: name.trim() });
            }}
          />
          <Select value={line.kind} onValueChange={(kind) => void onPatch({ decision: 'create', kind: kind as StatementLineKind })} disabled={disabled}>
            <SelectTrigger aria-label="Tipo do lançamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KIND_LABEL) as StatementLineKind[])
                .filter((kind) => kind !== 'ignore')
                .map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {KIND_LABEL[kind]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {(line.kind === 'expense' || line.kind === 'income') && (
            <Select
              value={line.categoryId ?? NO_CATEGORY}
              onValueChange={(id) => void onPatch({ decision: 'create', categoryId: id === NO_CATEGORY ? null : id })}
              disabled={disabled}
            >
              <SelectTrigger aria-label="Categoria">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Sem categoria</SelectItem>
                {cats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {line.kind === 'transfer' && (
            <Select
              value={line.transferKind ?? 'between_accounts'}
              onValueChange={(kind) => void onPatch({ decision: 'create', transferKind: kind as TransferKind })}
              disabled={disabled}
            >
              <SelectTrigger aria-label="Tipo da transferência">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </li>
  );
}

export function ReconciliationPanel({ data, onClose }: { data: StatementBatch; onClose: () => void }) {
  const spaceIds = useMemo(() => [...new Set(data.toDecide.map((line) => line.spaceId).filter(Boolean))], [data.toDecide]);
  const categoryQueries = useQueries({
    queries: spaceIds.map((spaceId) => ({
      queryKey: ['categories', spaceId, 'active'],
      queryFn: () => api.get<Category[]>(`/categories?spaceId=${spaceId}`),
      staleTime: 60_000,
    })),
  });
  const categories = categoryQueries.flatMap((query) => query.data ?? []);
  const updateLine = useUpdateBatchLine(data.id);
  const updateLines = useUpdateBatchLines(data.id);
  const commit = useCommitBatch();
  const discard = useDiscardBatch();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatementBatchCommitResult | null>(null);
  const busy = updateLine.isPending || updateLines.isPending || commit.isPending || discard.isPending;

  const save = async (lineId: string, patch: BatchLinePatch) => {
    setError(null);
    try {
      await updateLine.mutateAsync({ lineId, ...patch });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (result) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="text-base font-semibold text-slate-900 dark:text-white">Conferência confirmada</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {result.linked} já estavam lançados
            {result.expenses + result.incomes + result.transfers > 0
              ? ` · ${result.expenses} despesa(s), ${result.incomes} receita(s) e ${result.transfers} transferência(s) criadas`
              : ''}
            {result.ignored ? ` · ${result.ignored} ignoradas` : ''}.
          </p>
          <Button onClick={onClose}>Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  const undecidedIds = data.toDecide.filter((line) => !line.decision).map((line) => line.id);

  return (
    <div className="space-y-4 pb-24">
      <Card>
        <CardContent className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {data.files.map((file) => file.bankAccountName || file.fileName).join(' · ')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.periodStart && data.periodEnd ? `${formatShortDate(data.periodStart)} – ${formatShortDate(data.periodEnd)} · ` : ''}
              {data.files.length} arquivo{data.files.length === 1 ? '' : 's'}
              {data.summary.duplicates ? ` · ${data.summary.duplicates} já conferidas antes` : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryChip label="Já lançados" value={data.summary.matched} />
            <SummaryChip label="Para decidir" value={data.summary.toDecide} />
            <SummaryChip label="Serão criados" value={data.summary.toCreate} />
            <SummaryChip label="Fora dos extratos" value={data.summary.outside} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Para decidir</h2>
          {undecidedIds.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={async () => {
                setError(null);
                try {
                  await updateLines.mutateAsync({ lineIds: undecidedIds, decision: 'ignore' });
                } catch (err) {
                  setError(errorMessage(err));
                }
              }}
            >
              Ignorar as sem decisão
            </Button>
          )}
        </div>
        <Card>
          {data.toDecide.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {data.toDecide.map((line) => (
                <DecideRow
                  key={line.id}
                  line={line}
                  entries={data.openEntries}
                  categories={categories}
                  disabled={busy}
                  onPatch={(patch) => save(line.id, patch)}
                />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Nada pendente. Tudo que veio nos extratos já tinha lançamento.</p>
          )}
        </Card>
      </section>

      <details className="rounded-2xl border border-slate-200 dark:border-white/10" open={data.matched.length > 0 && data.matched.length <= 8}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Já lançado ({data.matched.length})</summary>
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {data.matched.map((line) => (
            <li key={line.id} className="flex items-start gap-3 px-4 py-3">
              <LineMeta line={line} />
              <p className={cn('shrink-0 text-sm font-semibold', line.amount < 0 ? 'text-red-600' : 'text-emerald-600')}>{money(line.amount)}</p>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => void save(line.id, { decision: null })}>
                Não é este
              </Button>
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-2xl border border-slate-200 dark:border-white/10">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
          Na Finzup e fora dos extratos ({data.outside.length})
        </summary>
        {data.outside.length ? (
          <ul className="divide-y divide-slate-100 px-4 dark:divide-white/[0.06]">
            {data.outside.map((entry) => (
              <li key={`${entry.id}:${entry.accountId}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{entry.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.dayUnknown ? 'sem dia' : formatShortDate(entry.date)} · {entry.typeLabel} · {entry.accountName}
                  </p>
                </div>
                <span className="shrink-0 text-slate-700 dark:text-slate-200">{formatCurrency(entry.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">Nenhum lançamento dessas contas ficou de fora dos arquivos.</p>
        )}
      </details>

      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-64 md:pr-56 dark:border-white/10 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            {data.summary.undecided > 0
              ? `${data.summary.undecided} linha(s) ainda sem decisão.`
              : `Vai criar ${data.summary.toCreate} e vincular ${data.summary.toLink}.`}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={busy}
              onClick={async () => {
                if (!window.confirm('Descartar esta conferência? Nenhum lançamento será criado.')) return;
                await discard.mutateAsync(data.id);
                onClose();
              }}
            >
              Descartar
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              disabled={busy || data.summary.undecided > 0}
              onClick={async () => {
                setError(null);
                try {
                  setResult(await commit.mutateAsync(data.id));
                } catch (err) {
                  setError(errorMessage(err));
                }
              }}
            >
              {commit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
