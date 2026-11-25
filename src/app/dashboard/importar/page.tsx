'use client';

import { useRef, useState } from 'react';
import { FileUp, History, Loader2, Trash2, Undo2, Upload, Wand2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useActiveSpaces, useSelectedSpace } from '@/hooks/use-spaces';
import { useHasFeature } from '@/hooks/use-plan';
import {
  useCategorizationRules,
  useDeleteRule,
  useStatementImport,
  useStatementImports,
  useUndoImport,
  useUploadStatement,
} from '@/hooks/use-statement-imports';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { ReviewPanel } from '@/components/imports/review-panel';
import { LINE_KIND_LABEL, formatShortDate } from '@/components/imports/import-labels';
import type { StatementImportListItem } from '@/types';

const NO_ACCOUNT = 'none';
const STATUS_LABEL: Record<StatementImportListItem['status'], string> = { review: 'Em revisão', committed: 'Importado', discarded: 'Descartado' };

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Não foi possível ler o arquivo. Tente de novo.';
}

function UploadCard({ onUploaded }: { onUploaded: (id: string) => void }) {
  const { spaces, businesses } = useActiveSpaces();
  const selected = useSelectedSpace();
  const { data: accounts } = useBankAccounts();
  const upload = useUploadStatement();
  const inputRef = useRef<HTMLInputElement>(null);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string>(NO_ACCOUNT);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const effectiveSpace = spaceId ?? selected?.id ?? spaces.find((s) => s.kind === 'personal')?.id ?? null;

  const send = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > 4 * 1024 * 1024) {
      setError('Arquivo grande demais (máx. 4 MB). Exporte um período menor.');
      return;
    }
    try {
      const data = await upload.mutateAsync({ file, spaceId: effectiveSpace, bankAccountId: accountId === NO_ACCOUNT ? null : accountId });
      onUploaded(data.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="icon-chip bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <FileUp className="h-4 w-4" aria-hidden />
          </div>
          Enviar extrato
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          OFX ou CSV exportado do app do banco (Nubank, Inter, Itaú, Bradesco, BB, Santander, C6…). Nada é lançado antes da sua revisão.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn('grid gap-3', businesses.length > 0 && 'sm:grid-cols-2')}>
          {businesses.length > 0 && (
            <div className="space-y-1.5">
              <Label>Espaço</Label>
              <Select value={effectiveSpace ?? undefined} onValueChange={setSpaceId}>
                <SelectTrigger aria-label="Espaço do extrato">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  {spaces.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Conta do extrato</Label>
            <Select
              value={accountId}
              onValueChange={(v) => {
                setAccountId(v);
                const acc = accounts?.find((a) => a.id === v);
                if (acc?.spaceId) setSpaceId(acc.spaceId);
              }}
            >
              <SelectTrigger aria-label="Conta do extrato">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ACCOUNT}>Sem conta (não mexe em saldos)</SelectItem>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void send(e.dataTransfer.files?.[0]);
          }}
          disabled={upload.isPending}
          className={cn(
            'flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors',
            dragging
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.03]',
          )}
        >
          {upload.isPending ? <Loader2 className="h-7 w-7 animate-spin text-emerald-500" /> : <Upload className="h-7 w-7 text-emerald-500" />}
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{upload.isPending ? 'Lendo e categorizando…' : 'Escolher arquivo ou arrastar aqui'}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">.ofx ou .csv · até 4 MB · dá para mandar 3 meses de uma vez</span>
        </button>
        <input ref={inputRef} type="file" accept=".ofx,.csv,.txt,text/csv,application/x-ofx" className="hidden" aria-label="Arquivo do extrato" onChange={(e) => void send(e.target.files?.[0])} />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}

function RecentImports({ onOpen }: { onOpen: (id: string) => void }) {
  const { data } = useStatementImports();
  const undo = useUndoImport();
  if (!data?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-slate-400" /> Importações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {data.map((imp) => (
            <li key={imp.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{imp.fileName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {imp.bankLabel ? `${imp.bankLabel} · ` : ''}
                  {imp.periodStart && imp.periodEnd ? `${formatShortDate(imp.periodStart)}–${formatShortDate(imp.periodEnd)} · ` : ''}
                  {STATUS_LABEL[imp.status]}
                  {imp.status === 'review' && imp.pendingLines ? ` · ${imp.pendingLines} linhas` : ''}
                  {imp.status === 'committed' ? ` · ${imp.importedLines} lançamentos` : ''}
                </p>
              </div>
              {imp.status === 'review' && (
                <Button size="sm" onClick={() => onOpen(imp.id)}>
                  Revisar
                </Button>
              )}
              {imp.status === 'committed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={undo.isPending}
                  onClick={async () => {
                    if (!window.confirm(`Desfazer "${imp.fileName}"? Os ${imp.importedLines} lançamentos criados por esta importação serão apagados.`)) return;
                    await undo.mutateAsync(imp.id);
                  }}
                >
                  <Undo2 className="h-4 w-4" /> Desfazer
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RulesCard() {
  const { data } = useCategorizationRules();
  const remove = useDeleteRule();
  if (!data?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-4 w-4 text-slate-400" /> Suas regras
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">Têm prioridade sobre o histórico e a IA nas próximas importações.</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {data.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">&quot;{r.pattern}&quot;</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {' '}
                  → {LINE_KIND_LABEL[r.kind]}
                  {r.categoryName ? ` · ${r.categoryName}` : ''}
                  {r.renameTo ? ` · "${r.renameTo}"` : ''}
                </span>
                {r.matchCount > 0 && <span className="ml-1 text-xs text-slate-400">({r.matchCount} uso{r.matchCount === 1 ? '' : 's'})</span>}
              </div>
              <Button size="icon" variant="ghost" aria-label={`Apagar regra ${r.pattern}`} onClick={() => remove.mutate(r.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ImportarPage() {
  const canImport = useHasFeature('statement_import');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: active } = useStatementImport(activeId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <FileUp className="h-6 w-6 text-brand-500" aria-hidden /> Importar extrato
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Envie o extrato. A IA sugere a categoria de cada lançamento, sem gastar créditos, e você troca o que não estiver certo. Duplicadas ficam de fora; pagamento de fatura e aplicações não contam como gasto.
        </p>
      </div>

      {!canImport ? (
        <UpgradePrompt title="Importação de extrato faz parte do Dono App" description="Importe extratos OFX/CSV com categorização automática e regras suas." />
      ) : activeId && active ? (
        <>
          <Button variant="ghost" size="sm" onClick={() => setActiveId(null)}>
            ← Voltar
          </Button>
          <ReviewPanel key={active.id} data={active} onClose={() => setActiveId(null)} />
        </>
      ) : (
        <>
          <UploadCard onUploaded={setActiveId} />
          <RecentImports onOpen={setActiveId} />
          <RulesCard />
        </>
      )}
    </div>
  );
}
