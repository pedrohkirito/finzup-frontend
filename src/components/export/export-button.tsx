'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useHasFeature } from '@/hooks/use-plan';
import { useMonthStore } from '@/hooks/use-month';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type ExportKind = 'month' | 'entries' | 'report' | 'owner_dashboard';
type Format = 'pdf' | 'csv';

const OPTIONS: { kind: ExportKind; title: string; description: string }[] = [
  { kind: 'month', title: 'Fechamento do mês', description: 'Resumo, relatório, painel do dono e todos os lançamentos.' },
  { kind: 'entries', title: 'Lançamentos', description: 'Receitas, despesas, parcelas, doações, aportes e transferências.' },
  { kind: 'report', title: 'Relatório', description: 'Totais, categorias, orçamentos, formas de pagamento e 6 meses.' },
  { kind: 'owner_dashboard', title: 'Painel do dono', description: 'Caixa das empresas, pró-labore x retiradas, pessoal e alertas.' },
];

export function exportPath(kind: ExportKind, format: Format, monthId: string | null) {
  return `/exports/${kind}?format=${format}${monthId ? `&monthId=${monthId}` : ''}`;
}

/** "Exportar mês" baixa o fechamento em PDF num clique; a seta abre os outros arquivos e formatos. */
export function ExportButton({ primary = 'month', className }: { primary?: ExportKind; className?: string }) {
  const canExport = useHasFeature('export');
  const hasOwner = useHasFeature('owner_dashboard');
  const { selectedMonthId } = useMonthStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const run = async (kind: ExportKind, format: Format) => {
    const key = `${kind}:${format}`;
    setBusy(key);
    setError(null);
    setDone(null);
    try {
      setDone(await api.download(exportPath(kind, format, selectedMonthId)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível exportar.');
    } finally {
      setBusy(null);
    }
  };

  if (!canExport) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href="/dashboard/planos">
          <Download className="h-4 w-4" /> Exportar
        </Link>
      </Button>
    );
  }

  const primaryLabel = primary === 'month' ? 'Exportar mês' : primary === 'owner_dashboard' ? 'Exportar painel' : primary === 'report' ? 'Exportar relatório' : 'Exportar lançamentos';
  const options = OPTIONS.filter((o) => o.kind !== 'owner_dashboard' || hasOwner);

  return (
    <div className={cn('flex flex-col items-start gap-1 sm:items-end', className)}>
      <div className="inline-flex">
        <Button size="sm" variant="outline" className="rounded-r-none" disabled={!!busy} onClick={() => void run(primary, 'pdf')} title="Baixa em PDF">
          {busy === `${primary}:pdf` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {primaryLabel}
        </Button>
        <Button size="sm" variant="outline" className="-ml-px rounded-l-none px-2" aria-label="Mais opções de exportação" onClick={() => setOpen(true)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      {error && !open && <p className="text-xs text-red-500">{error}</p>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Exportar</DialogTitle>
            <DialogDescription>PDF para ler ou enviar ao contador; CSV para abrir no Excel ou Google Planilhas. Usa o mês e o espaço escolhidos no topo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {options.map((o) => (
              <div key={o.kind} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{o.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{o.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {(['pdf', 'csv'] as const).map((f) => (
                    <Button key={f} size="sm" variant={f === 'pdf' ? 'default' : 'outline'} disabled={!!busy} onClick={() => void run(o.kind, f)} aria-label={`${o.title} em ${f.toUpperCase()}`}>
                      {busy === `${o.kind}:${f}` ? <Loader2 className="h-4 w-4 animate-spin" /> : f === 'pdf' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                      {f.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {done && <p className="text-sm text-emerald-600 dark:text-emerald-400">Baixado: {done}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
