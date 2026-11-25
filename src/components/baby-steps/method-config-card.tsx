'use client';

import { useState } from 'react';
import { Check, Loader2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useUpdateMethodConfig } from '@/hooks/use-baby-steps';
import { ApiError } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { cn } from '@/lib/utils';
import type { BabyStepState, MethodConfigInput, MethodItemView, MethodParamView } from '@/types';

type Bucket = 'steps' | 'principles';

const SUFFIX: Record<string, string> = { percent: '%', months: 'meses', int: '' };

function NumberParam({ param, onCommit, disabled }: { param: MethodParamView; onCommit: (v: number) => void; disabled?: boolean }) {
  const value = Number(param.value);
  // O valor salvo entra pela key do componente (remonta quando muda), sem efeito para sincronizar.
  const [draft, setDraft] = useState(String(value));
  const commit = () => {
    const n = Number(draft.replace(',', '.'));
    if (!Number.isFinite(n)) return setDraft(String(value));
    const clamped = Math.min(param.max ?? Infinity, Math.max(param.min ?? -Infinity, n));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };
  return (
    <div className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-within:ring-2 focus-within:ring-emerald-500 dark:border-white/10 dark:bg-white/[0.05]">
      <input
        inputMode="decimal"
        aria-label={param.label}
        disabled={disabled}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d,.]/g, '').slice(0, 9))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
      />
      {SUFFIX[param.type] && <span className="shrink-0 text-slate-400">{SUFFIX[param.type]}</span>}
    </div>
  );
}

function MoneyParam({ param, onCommit, disabled }: { param: MethodParamView; onCommit: (v: number) => void; disabled?: boolean }) {
  const value = Number(param.value);
  const [draft, setDraft] = useState(value);
  return (
    <div className="min-w-0" onBlur={() => draft !== value && onCommit(Math.min(param.max ?? Infinity, Math.max(param.min ?? 0, draft)))}>
      <CurrencyInput value={draft} onChange={setDraft} aria-label={param.label} disabled={disabled} />
    </div>
  );
}

function ItemRow({ item, bucket, save, busy }: { item: MethodItemView; bucket: Bucket; save: (input: MethodConfigInput) => void; busy: boolean }) {
  const change = (patch: { enabled?: boolean; params?: Record<string, number | boolean> }) => save({ [bucket]: [{ key: item.key, ...patch }] });
  const nonBool = item.params.filter((p) => p.type !== 'boolean');
  const bools = item.params.filter((p) => p.type === 'boolean');
  return (
    <div className={cn('rounded-xl border p-3 transition-colors sm:p-4', item.enabled ? 'border-slate-200 dark:border-white/10' : 'border-dashed border-slate-200 opacity-70 dark:border-white/[0.08]')}>
      <div className="flex items-start gap-3">
        <Switch checked={item.enabled} onCheckedChange={(v) => change({ enabled: v })} disabled={busy} aria-label={`${item.enabled ? 'Desligar' : 'Ligar'} ${item.shortTitle ?? item.title}`} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 dark:text-white">
            {item.step ? <span className="mr-1.5 text-slate-400">{item.step}.</span> : null}
            {item.title}
            {!item.enabled && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">Desligado</span>}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
        </div>
      </div>
      {item.enabled && item.params.length > 0 && (
        <div className="mt-3 space-y-3 sm:pl-14">
          {nonBool.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {nonBool.map((p) => (
                <label key={p.key} className="block min-w-0 space-y-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{p.label}</span>
                  {p.type === 'money' ? (
                    <MoneyParam key={`${p.key}:${String(p.value)}`} param={p} disabled={busy} onCommit={(v) => change({ params: { [p.key]: v } })} />
                  ) : (
                    <NumberParam key={`${p.key}:${String(p.value)}`} param={p} disabled={busy} onCommit={(v) => change({ params: { [p.key]: v } })} />
                  )}
                  {p.help && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{p.help}</span>}
                </label>
              ))}
            </div>
          )}
          {bools.map((p) => (
            <div key={p.key} className="flex items-start gap-2.5">
              <Switch checked={Boolean(p.value)} onCheckedChange={(v) => change({ params: { [p.key]: v } })} disabled={busy} aria-label={p.label} className="scale-90" />
              <span className="text-sm">
                <span className="text-slate-700 dark:text-slate-200">{p.label}</span>
                {p.help && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{p.help}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Configurar o Método": tudo opcional, salva a cada mudança e o Método se recalcula na hora. */
export function MethodConfigCard({ state }: { state: BabyStepState }) {
  const update = useUpdateMethodConfig();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = (input: MethodConfigInput) => {
    setError(null);
    setSaved(false);
    update.mutate(input, {
      onSuccess: () => setSaved(true),
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.'),
    });
  };

  return (
    <Card id="configurar" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="icon-chip bg-brand-500/15 text-brand-600 dark:text-brand-400">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            Configurar o Método
          </CardTitle>
          <span className="flex h-6 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            {update.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando…
              </>
            ) : saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Salvo · metas recalculadas
              </>
            ) : null}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tudo aqui é opcional: ligue só o que faz sentido para você e ajuste os valores. A etapa atual e as metas do mês se recalculam na hora, e a IA segue a sua configuração.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Princípios</h3>
          {state.config.principles.map((item) => (
            <ItemRow key={item.key} item={item} bucket="principles" save={save} busy={update.isPending} />
          ))}
        </section>
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Etapas</h3>
          {state.config.steps.map((item) => (
            <ItemRow key={item.key} item={item} bucket="steps" save={save} busy={update.isPending} />
          ))}
        </section>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" disabled={update.isPending} onClick={() => window.confirm('Voltar o Método ao padrão do Finzup?') && save({ reset: true })}>
            <RotateCcw className="h-4 w-4" /> Voltar ao padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
