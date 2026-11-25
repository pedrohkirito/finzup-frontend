'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Copy, Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { useActiveSpaces } from '@/hooks/use-spaces';
import { useCommitImport, useDiscardImport, useUpdateLines, type LinePatch } from '@/hooks/use-statement-imports';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Category, StatementCommitResult, StatementImport, StatementLine, StatementLineKind, TransferKind } from '@/types';
import { IMPORT_TRANSFER_KINDS, LINE_KIND_LABEL, SOURCE_LABEL, formatShortDate, needsAttention } from './import-labels';

type Filter = 'attention' | 'all' | 'expense' | 'income' | 'transfer' | 'ignore' | 'duplicate';
const NO_CATEGORY = 'none';

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente de novo.';
}

function KindSelect({
  value,
  onChange,
  allowTransfer,
  className,
}: {
  value: StatementLineKind | '';
  onChange: (v: StatementLineKind) => void;
  allowTransfer: boolean;
  className?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={(v) => onChange(v as StatementLineKind)}>
      <SelectTrigger aria-label="Tipo" className={cn('h-9 text-xs', className)}>
        <SelectValue placeholder="Tipo" />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(LINE_KIND_LABEL) as StatementLineKind[])
          .filter((k) => k !== 'transfer' || allowTransfer || value === 'transfer')
          .map((k) => (
            <SelectItem key={k} value={k}>
              {LINE_KIND_LABEL[k]}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

function CategorySelect({
  value,
  categories,
  onChange,
  className,
  placeholder = 'Sem categoria',
}: {
  value: string | null;
  categories: Category[];
  onChange: (id: string | null) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Select value={value ?? NO_CATEGORY} onValueChange={(v) => onChange(v === NO_CATEGORY ? null : v)}>
      <SelectTrigger aria-label="Categoria" className={cn('h-9 text-xs', !value && 'text-amber-600 dark:text-amber-400', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={NO_CATEGORY}>{placeholder}</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TransferKindSelect({ value, onChange }: { value: TransferKind | null; onChange: (v: TransferKind) => void }) {
  return (
    <Select value={value ?? 'other'} onValueChange={(v) => onChange(v as TransferKind)}>
      <SelectTrigger aria-label="Tipo de transferência" className="h-9 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {IMPORT_TRANSFER_KINDS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LineRow({
  line,
  selected,
  onSelect,
  categoriesFor,
  allowTransfer,
  onPatch,
  onRule,
  disabled,
}: {
  line: StatementLine;
  selected: boolean;
  onSelect: (v: boolean) => void;
  categoriesFor: (kind: StatementLineKind) => Category[];
  allowTransfer: boolean;
  onPatch: (patch: LinePatch) => void;
  onRule: () => void;
  disabled: boolean;
}) {
  const editable = line.status === 'pending' || line.status === 'duplicate';
  const isOut = line.amount < 0;
  return (
    <li
      className={cn(
        'grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 px-3 py-3 lg:grid-cols-[auto_4.5rem_minmax(0,1fr)_10rem_12rem_7.5rem_auto] lg:items-center',
        (line.kind === 'ignore' || line.status !== 'pending') && 'opacity-60',
        selected && 'bg-emerald-50/60 dark:bg-emerald-500/[0.06]',
      )}
    >
      <Checkbox checked={selected} onCheckedChange={(v) => onSelect(!!v)} disabled={!editable} aria-label={`Selecionar ${line.name}`} className="mt-1 lg:mt-0" />
      <span className="hidden text-xs tabular-nums text-slate-500 lg:block">{formatShortDate(line.date)}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white" title={line.name}>
          <span className="mr-1.5 text-xs font-normal tabular-nums text-slate-500 lg:hidden">{formatShortDate(line.date)}</span>
          {line.name}
        </p>
        <p className="truncate text-[11px] text-slate-400" title={line.description}>
          {line.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {line.status === 'duplicate' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">
              <Copy className="h-3 w-3" /> Já importada antes
            </span>
          )}
          {line.possibleDuplicate && line.status === 'pending' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3" /> Parece com &quot;{line.possibleDuplicate.name}&quot; já lançado
            </span>
          )}
          {line.categorySource && line.status === 'pending' && line.kind !== 'ignore' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              {line.categorySource === 'ai' && <Sparkles className="h-3 w-3" />}
              {SOURCE_LABEL[line.categorySource]}
            </span>
          )}
        </div>
      </div>
      <span className={cn('text-right text-sm font-semibold tabular-nums lg:order-last lg:hidden', isOut ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400')}>
        {isOut ? '−' : '+'}
        {formatCurrency(Math.abs(line.amount))}
      </span>
      <div className="col-span-3 grid grid-cols-2 gap-2 lg:col-span-1 lg:contents">
        <KindSelect value={line.kind} allowTransfer={allowTransfer} onChange={(kind) => onPatch({ kind })} className={cn(!editable && 'pointer-events-none')} />
        {line.kind === 'transfer' ? (
          <TransferKindSelect value={line.transferKind} onChange={(transferKind) => onPatch({ transferKind })} />
        ) : line.kind === 'ignore' ? (
          <span className="flex h-9 items-center text-xs text-slate-400">Não vira lançamento</span>
        ) : (
          <CategorySelect value={line.categoryId} categories={categoriesFor(line.kind)} onChange={(categoryId) => onPatch({ categoryId })} />
        )}
      </div>
      <span className={cn('hidden text-right text-sm font-semibold tabular-nums lg:block', isOut ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400')}>
        {isOut ? '−' : '+'}
        {formatCurrency(Math.abs(line.amount))}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="hidden h-8 w-8 lg:inline-flex"
        aria-label={`Criar regra para ${line.name}`}
        title="Sempre categorizar assim"
        onClick={onRule}
        disabled={disabled || !editable}
      >
        <Wand2 className="h-4 w-4" />
      </Button>
      <button type="button" onClick={onRule} disabled={!editable} className="col-span-3 -mt-1 justify-self-start text-[11px] font-medium text-emerald-600 lg:hidden dark:text-emerald-400">
        <Wand2 className="mr-1 inline h-3 w-3" />
        Sempre categorizar assim
      </button>
    </li>
  );
}

function RuleDialog({
  line,
  open,
  onClose,
  categoriesFor,
  allowTransfer,
  onSave,
}: {
  line: StatementLine | null;
  open: boolean;
  onClose: () => void;
  categoriesFor: (kind: StatementLineKind) => Category[];
  allowTransfer: boolean;
  onSave: (patch: LinePatch) => Promise<void>;
}) {
  const [pattern, setPattern] = useState('');
  const [kind, setKind] = useState<StatementLineKind>('expense');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [transferKind, setTransferKind] = useState<TransferKind | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  if (line && line.id !== lastId) {
    setLastId(line.id);
    setPattern(line.suggestedPattern);
    setKind(line.kind === 'ignore' ? (line.amount < 0 ? 'expense' : 'income') : line.kind);
    setCategoryId(line.categoryId);
    setTransferKind(line.transferKind);
    setName(line.name);
    setError(null);
  }
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ kind, categoryId: kind === 'expense' || kind === 'income' ? categoryId : null, ...(kind === 'transfer' && { transferKind: transferKind ?? 'other' }), name, createRule: true, rulePattern: pattern });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sempre categorizar assim</DialogTitle>
          <DialogDescription>A regra vale para as outras linhas desta importação e para as próximas. Tem prioridade sobre a IA.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rule-pattern">Quando a descrição tiver</Label>
            <Input id="rule-pattern" value={pattern} maxLength={80} onChange={(e) => setPattern(e.target.value)} />
            {line && <p className="truncate text-[11px] text-slate-400">Ex.: {line.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Vira</Label>
              <KindSelect value={kind} allowTransfer={allowTransfer} onChange={(k) => { setKind(k); setCategoryId(null); }} />
            </div>
            <div className="space-y-1.5">
              <Label>{kind === 'transfer' ? 'Tipo' : 'Categoria'}</Label>
              {kind === 'transfer' ? (
                <TransferKindSelect value={transferKind} onChange={setTransferKind} />
              ) : kind === 'ignore' ? (
                <span className="flex h-9 items-center text-xs text-slate-400">—</span>
              ) : (
                <CategorySelect value={categoryId} categories={categoriesFor(kind)} onChange={setCategoryId} />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rule-name">Nome do lançamento</Label>
            <Input id="rule-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || pattern.trim().length < 3}>
            {saving ? 'Salvando…' : 'Salvar regra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewPanel({ data, onClose }: { data: StatementImport; onClose: () => void }) {
  const { spaces, businesses } = useActiveSpaces();
  const space = spaces.find((s) => s.id === data.spaceId);
  const allowTransfer = businesses.length > 0;
  const { data: categories } = useCategories({ spaceId: data.spaceId });
  const update = useUpdateLines(data.id);
  const commit = useCommitImport();
  const discard = useDiscardImport();
  const [filter, setFilter] = useState<Filter>(data.summary.uncategorized + data.summary.possibleDuplicates + data.summary.transfers > 0 ? 'attention' : 'all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ruleLine, setRuleLine] = useState<StatementLine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<StatementCommitResult | null>(null);

  const categoriesFor = useMemo(() => {
    const active = (categories ?? []).filter((c) => !c.archived);
    return (kind: StatementLineKind) => active.filter((c) => c.kind === (kind === 'income' ? 'income' : 'expense'));
  }, [categories]);

  const counts: Record<Filter, number> = {
    attention: data.lines.filter(needsAttention).length,
    all: data.lines.length,
    expense: data.lines.filter((l) => l.status === 'pending' && l.kind === 'expense').length,
    income: data.lines.filter((l) => l.status === 'pending' && l.kind === 'income').length,
    transfer: data.lines.filter((l) => l.status === 'pending' && l.kind === 'transfer').length,
    ignore: data.lines.filter((l) => l.status === 'pending' && l.kind === 'ignore').length,
    duplicate: data.lines.filter((l) => l.status === 'duplicate').length,
  };
  const visible = data.lines.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'attention') return needsAttention(l);
    if (filter === 'duplicate') return l.status === 'duplicate';
    return l.status === 'pending' && l.kind === filter;
  });
  const reviewing = data.status === 'review';

  const patch = async (lineIds: string[], p: LinePatch) => {
    setError(null);
    setNotice(null);
    try {
      const r = await update.mutateAsync({ lineIds, ...p });
      if (p.createRule) setNotice(r.appliedToOthers ? `Regra salva e aplicada em mais ${r.appliedToOthers} linha(s).` : 'Regra salva. Ela vale para as próximas importações.');
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const toggle = (id: string, value: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  const selectedLines = data.lines.filter((l) => selected.has(l.id));
  const bulkKind = selectedLines.length && selectedLines.every((l) => l.kind === selectedLines[0].kind) ? selectedLines[0].kind : '';

  const toCreate = data.summary.expenses + data.summary.incomes + data.summary.transfers;

  if (result) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Extrato importado</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {result.expenses} despesa(s), {result.incomes} receita(s)
              {result.transfers + result.transfersLinked > 0 && `, ${result.transfers + result.transfersLinked} transferência(s)`}
              {result.transfersLinked > 0 && ` (${result.transfersLinked} já estava(m) registrada(s))`}. {result.ignored} linha(s) ignorada(s).
            </p>
            {result.monthsCreated.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Criamos {result.monthsCreated.length === 1 ? 'o mês' : 'os meses'} {result.monthsCreated.join(', ')} como histórico (fechados).
              </p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/dashboard/despesas">Ver despesas</Link>
            </Button>
            <Button onClick={onClose}>Importar outro extrato</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-white">{data.fileName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.bankLabel ? `${data.bankLabel} · ` : ''}
              {data.periodStart && data.periodEnd && `${formatShortDate(data.periodStart)} a ${formatShortDate(data.periodEnd)} · `}
              {space ? space.name : ''} · {data.totalLines} linhas
            </p>
            {reviewing && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A categoria já vem preenchida. Troque no seletor se quiser outra — isso não gasta créditos.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-white/[0.07]">Saídas {formatCurrency(data.summary.totalOut)}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Entradas {formatCurrency(data.summary.totalIn)}
            </span>
            {data.summary.uncategorized > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{data.summary.uncategorized} sem categoria</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filtrar linhas">
        {(
          [
            ['attention', 'Pedem atenção'],
            ['all', 'Todas'],
            ['expense', 'Despesas'],
            ['income', 'Receitas'],
            ['transfer', 'Transferências'],
            ['ignore', 'Ignoradas'],
            ['duplicate', 'Já importadas'],
          ] as [Filter, string][]
        )
          .filter(([f]) => f === 'all' || f === 'attention' || counts[f] > 0)
          .map(([f, label]) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]',
              )}
            >
              {label} <span className="opacity-70">{counts[f]}</span>
            </button>
          ))}
      </div>

      {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{error}</p>}

      {selected.size > 0 && reviewing && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-emerald-500/30 dark:bg-slate-900/95">
          <span className="px-1 text-xs font-medium text-slate-700 dark:text-slate-200">{selected.size} selecionada(s)</span>
          <KindSelect value={bulkKind} allowTransfer={allowTransfer} onChange={(kind) => void patch([...selected], { kind })} className="w-40" />
          {(bulkKind === 'expense' || bulkKind === 'income') && (
            <CategorySelect value={null} placeholder="Definir categoria" categories={categoriesFor(bulkKind)} onChange={(categoryId) => categoryId && void patch([...selected], { categoryId })} className="w-48" />
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            <X className="h-4 w-4" /> Limpar
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        {visible.length > 0 && reviewing && (
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-white/[0.06]">
            <Checkbox
              checked={visible.every((l) => selected.has(l.id))}
              onCheckedChange={(v) => setSelected(v ? new Set([...selected, ...visible.filter((l) => l.status !== 'imported').map((l) => l.id)]) : new Set())}
              aria-label="Selecionar todas as visíveis"
            />
            Selecionar todas as visíveis
          </div>
        )}
        {visible.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {visible.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                selected={selected.has(line.id)}
                onSelect={(v) => toggle(line.id, v)}
                categoriesFor={categoriesFor}
                allowTransfer={allowTransfer}
                disabled={!reviewing}
                onPatch={(p) => void patch([line.id], p).catch(() => undefined)}
                onRule={() => setRuleLine(line)}
              />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {filter === 'attention' ? 'Nada pedindo atenção. Confira e confirme a importação.' : 'Nenhuma linha aqui.'}
          </p>
        )}
      </Card>

      {reviewing && (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-64 md:pr-56 dark:border-white/10 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
              Vai criar {data.summary.expenses} despesa(s), {data.summary.incomes} receita(s)
              {data.summary.transfers > 0 && ` e ${data.summary.transfers} transferência(s)`} nos meses das datas.
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={discard.isPending || commit.isPending}
                onClick={async () => {
                  if (!window.confirm('Descartar esta importação? Nenhum lançamento será criado.')) return;
                  await discard.mutateAsync(data.id);
                  onClose();
                }}
              >
                Descartar
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                disabled={commit.isPending || toCreate === 0}
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
                Confirmar {toCreate} lançamento{toCreate === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <RuleDialog
        line={ruleLine}
        open={!!ruleLine}
        onClose={() => setRuleLine(null)}
        categoriesFor={categoriesFor}
        allowTransfer={allowTransfer}
        onSave={(p) => patch([ruleLine!.id], p)}
      />
    </div>
  );
}
