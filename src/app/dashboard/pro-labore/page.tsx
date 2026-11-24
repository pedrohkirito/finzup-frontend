'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Calculator, HandCoins, History, Loader2, Plus, Settings2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { cn, formatCurrency, formatMonth } from '@/lib/utils';
import { useMonthStore } from '@/hooks/use-month';
import { useHasFeature } from '@/hooks/use-plan';
import { useCheckWithdrawal, useProLabore, useRecordWithdrawal, useUpdateProLaboreSettings } from '@/hooks/use-pro-labore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { ProLaboreAlerts } from '@/components/pro-labore/pro-labore-alerts';
import { WithdrawalHero } from '@/components/pro-labore/withdrawal-hero';
import type { OwnerWithdrawalKind, ProLaboreStatus, WithdrawalCheck } from '@/types';

const KIND_LABEL: Record<OwnerWithdrawalKind, string> = {
  pro_labore: 'Pró-labore',
  withdrawal: 'Retirada extra',
  profit_distribution: 'Distribuição de lucros',
};

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Não deu certo. Tente de novo.');

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'red' | 'amber' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn('mt-0.5 truncate text-lg font-bold tabular-nums', tone === 'red' ? 'text-red-600 dark:text-red-400' : tone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>{value}</p>
      {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function CheckCard({ status, monthId }: { status: ProLaboreStatus; monthId: string | null }) {
  const [amount, setAmount] = useState(0);
  const [result, setResult] = useState<WithdrawalCheck | null>(null);
  const check = useCheckWithdrawal();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-slate-400" /> Posso fazer essa retirada?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (amount <= 0) return;
            setResult(await check.mutateAsync({ spaceId: status.space.id, amount, monthId }));
          }}
        >
          <CurrencyInput value={amount} onChange={(v) => { setAmount(v); setResult(null); }} aria-label="Valor da retirada" className="flex-1" />
          <Button type="submit" disabled={amount <= 0 || check.isPending}>
            {check.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ver'}
          </Button>
        </form>
        {result && (
          <p className={cn('rounded-xl px-3 py-2 text-sm', result.allowed ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300')}>
            {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WithdrawalDialog({ status, monthId, open, onOpenChange }: { status: ProLaboreStatus; monthId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [amount, setAmount] = useState(status.definedAmount ?? 0);
  const [kind, setKind] = useState<OwnerWithdrawalKind>('pro_labore');
  const [day, setDay] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const record = useRecordWithdrawal();
  const monthClosed = status.month?.status === 'closed';
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setAlert(null); setError(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar retirada</DialogTitle>
          <DialogDescription>
            Dinheiro que saiu de {status.space.name} para o Pessoal{status.month ? ` em ${formatMonth(status.month.year, status.month.month)}` : ''}. Vira uma transferência (não é receita nem despesa).
          </DialogDescription>
        </DialogHeader>
        {alert ? (
          <div className="space-y-3">
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">Registrada. {alert}</p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Entendi</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                const r = await record.mutateAsync({ spaceId: status.space.id, amount, kind, monthId, day: day ? Number(day) : null });
                if (r.alert) setAlert(r.alert.message);
                else onOpenChange(false);
              } catch (err) {
                setError(errMsg(err));
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <CurrencyInput value={amount} onChange={setAmount} aria-label="Valor" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as OwnerWithdrawalKind)}>
                  <SelectTrigger aria-label="Tipo da retirada">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_LABEL) as OwnerWithdrawalKind[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {KIND_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wd-day">Dia (opcional)</Label>
                <Input id="wd-day" inputMode="numeric" placeholder="Ex.: 5" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))} />
              </div>
            </div>
            {amount > status.remaining && amount > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Esse valor passa do que cabe este mês ({formatCurrency(status.remaining)}).</p>
            )}
            {monthClosed && <p className="text-sm text-red-500">Este mês está fechado. Escolha um mês aberto no topo.</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={amount <= 0 || record.isPending || monthClosed}>
                {record.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ status, monthId, open, onOpenChange }: { status: ProLaboreStatus; monthId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const s = status.settings;
  const [defined, setDefined] = useState(s.definedAmount ?? 0);
  const [reserveMode, setReserveMode] = useState<'months' | 'amount'>(s.minReserveAmount != null ? 'amount' : 'months');
  const [reserveMonths, setReserveMonths] = useState(String(s.minReserveMonths));
  const [reserveAmount, setReserveAmount] = useState(s.minReserveAmount ?? 0);
  const [lookback, setLookback] = useState(String(s.lookbackMonths));
  const [payDay, setPayDay] = useState(s.payDay ? String(s.payDay) : '');
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateProLaboreSettings(monthId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pró-labore de {status.space.name}</DialogTitle>
          <DialogDescription>Defina quanto você quer tirar por mês e quanto a empresa precisa guardar de reserva.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await update.mutateAsync({
                spaceId: status.space.id,
                definedAmount: defined > 0 ? defined : null,
                minReserveMonths: Math.max(0, Number(reserveMonths.replace(',', '.')) || 0),
                minReserveAmount: reserveMode === 'amount' && reserveAmount > 0 ? reserveAmount : null,
                lookbackMonths: Math.min(12, Math.max(1, Number(lookback) || 3)),
                payDay: payDay ? Math.min(31, Math.max(1, Number(payDay))) : null,
              });
              onOpenChange(false);
            } catch (err) {
              setError(errMsg(err));
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Pró-labore mensal</Label>
              <CurrencyInput value={defined} onChange={setDefined} aria-label="Pró-labore mensal" />
              <p className="text-xs text-slate-400">Sustentável hoje: {formatCurrency(status.sustainable)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-day">Dia do pagamento</Label>
              <Input id="pl-day" inputMode="numeric" placeholder="Ex.: 5" value={payDay} onChange={(e) => setPayDay(e.target.value.replace(/\D/g, '').slice(0, 2))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reserva mínima da empresa</Label>
            <div className="flex gap-2">
              <Select value={reserveMode} onValueChange={(v) => setReserveMode(v as 'months' | 'amount')}>
                <SelectTrigger className="w-40" aria-label="Tipo da reserva">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Meses de custo</SelectItem>
                  <SelectItem value="amount">Valor fixo</SelectItem>
                </SelectContent>
              </Select>
              {reserveMode === 'months' ? (
                <Input inputMode="decimal" aria-label="Meses de reserva" value={reserveMonths} onChange={(e) => setReserveMonths(e.target.value.replace(/[^\d,.]/g, '').slice(0, 4))} className="flex-1" />
              ) : (
                <CurrencyInput value={reserveAmount} onChange={setReserveAmount} aria-label="Reserva em reais" className="flex-1" />
              )}
            </div>
            <p className="text-xs text-slate-400">
              {reserveMode === 'months' ? `Custo médio: ${formatCurrency(status.avgCosts)}/mês.` : 'Valor que fica sempre na empresa.'}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Meses na média do lucro</Label>
            <Select value={lookback} onValueChange={setLookback}>
              <SelectTrigger aria-label="Meses na média">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 6, 12].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'mês' : 'meses'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HistoryCard({ status }: { status: ProLaboreStatus }) {
  const max = Math.max(1, ...status.history.map((h) => Math.max(h.profit, h.proLabore + h.extra, h.defined ?? 0)));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-slate-400" /> Definido x retirado
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">Lucro do mês da empresa e o que saiu para você.</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {status.history.map((h) => {
            const total = h.proLabore + h.extra;
            const over = h.defined != null && total > h.defined + 0.009;
            return (
              <li key={`${h.year}-${h.month}`} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatMonth(h.year, h.month)}</span>
                  <span className="text-right text-xs text-slate-500 dark:text-slate-400">
                    lucro <span className={cn('font-semibold tabular-nums', h.profit < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200')}>{formatCurrency(h.profit)}</span> · retirado{' '}
                    <span className={cn('font-semibold tabular-nums', over ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200')}>{formatCurrency(total)}</span>
                    {h.extra > 0 && <span className="text-amber-600 dark:text-amber-400"> (extra {formatCurrency(h.extra)})</span>}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 dark:bg-white/[0.06]">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-sky-500/40" style={{ width: `${(Math.max(0, h.profit) / max) * 100}%` }} title="Lucro" />
                  <div className={cn('absolute inset-y-0 left-0 rounded-full', over ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${(total / max) * 100}%` }} title="Retirado" />
                  {h.defined != null && <div className="absolute -inset-y-0.5 w-0.5 bg-white/80" style={{ left: `${(h.defined / max) * 100}%` }} title="Definido" />}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-sky-500/40" /> Lucro</span>
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" /> Retirado</span>
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-amber-500" /> Acima do definido</span>
          {status.definedAmount != null && <span className="flex items-center gap-1"><span className="h-3 w-0.5 bg-white/80" /> Definido</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyView({ status, monthId }: { status: ProLaboreStatus; monthId: string | null }) {
  const [recording, setRecording] = useState(false);
  const [editing, setEditing] = useState(false);
  const basis = status.basis === 'history' ? `média de ${status.monthsUsed} ${status.monthsUsed === 1 ? 'mês' : 'meses'}` : status.basis === 'current_month' ? 'previsto do mês' : 'sem dados ainda';
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <WithdrawalHero status={status} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setRecording(true)}>
              <Plus className="h-4 w-4" /> Registrar retirada
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Settings2 className="h-4 w-4" /> {status.settings.definedAmount != null ? 'Ajustar pró-labore' : 'Definir pró-labore'}
            </Button>
          </div>
          <ProLaboreAlerts alerts={status.alerts} />
        </div>
        <CheckCard status={status} monthId={monthId} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Sustentável" value={formatCurrency(status.sustainable)} hint={basis} />
        <Stat label="Definido" value={status.definedAmount != null ? formatCurrency(status.definedAmount) : '—'} hint={status.definedAmount != null && status.definedAmount > status.sustainable ? 'acima do sustentável' : 'por mês'} tone={status.definedAmount != null && status.definedAmount > status.sustainable ? 'amber' : undefined} />
        <Stat label="Lucro médio" value={formatCurrency(status.avgProfit)} hint={`custo ${formatCurrency(status.avgCosts)}/mês`} tone={status.avgProfit < 0 ? 'red' : undefined} />
        <Stat label="Caixa hoje" value={status.cashCurrent != null ? formatCurrency(status.cashCurrent) : '—'} hint={status.cashProjectedEnd != null ? `fim do mês ${formatCurrency(status.cashProjectedEnd)}` : 'sem contas da empresa'} />
        <Stat label="Dias de caixa" value={status.daysOfCash != null ? `${status.daysOfCash} dias` : '—'} hint="no custo médio" tone={status.daysOfCash != null && status.daysOfCash < 30 ? 'red' : undefined} />
        <Stat label="Reserva mínima" value={formatCurrency(status.minReserve)} hint={status.settings.minReserveAmount != null ? 'valor fixo' : `${status.settings.minReserveMonths} meses de custo`} />
      </div>
      {status.accountsCount === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dica: em <Link href="/dashboard/configuracoes" className="text-emerald-600 underline dark:text-emerald-400">Configurações → Contas</Link>, ligue as contas da empresa a {status.space.name} com o saldo, para o limite considerar o caixa.
        </p>
      )}
      {status.history.length > 0 && <HistoryCard status={status} />}
      <WithdrawalDialog key={`w-${recording}`} status={status} monthId={monthId} open={recording} onOpenChange={setRecording} />
      <SettingsDialog key={`s-${editing}`} status={status} monthId={monthId} open={editing} onOpenChange={setEditing} />
    </div>
  );
}

export default function ProLaborePage() {
  const canUse = useHasFeature('owner_dashboard');
  const { selectedMonthId } = useMonthStore();
  const { data, isLoading } = useProLabore(selectedMonthId, canUse);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const status = data?.find((s) => s.space.id === spaceId) ?? data?.[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <HandCoins className="h-6 w-6 text-brand-500" aria-hidden /> Pró-labore
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quanto dá para tirar da empresa sem apertar o caixa{status?.month ? ` em ${formatMonth(status.month.year, status.month.month)}` : ''}.
          </p>
        </div>
        {data && data.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Empresa">
            {data.map((s) => (
              <button
                key={s.space.id}
                type="button"
                role="tab"
                aria-selected={s.space.id === status?.space.id}
                onClick={() => setSpaceId(s.space.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  s.space.id === status?.space.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]',
                )}
              >
                <Building2 className="h-3.5 w-3.5" /> {s.space.name}
                {s.alerts.some((a) => a.level === 'danger') && <span className="h-2 w-2 rounded-full bg-red-500" aria-label="com alerta" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {!canUse ? (
        <UpgradePrompt title="Pró-labore faz parte do Dono App" description="Saiba quanto dá para retirar da empresa todo mês sem apertar o caixa." />
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : !status ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="text-slate-700 dark:text-slate-200">Cadastre sua empresa para calcular o pró-labore.</p>
            <Button asChild>
              <Link href="/dashboard/empresas">Criar empresa</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CompanyView key={status.space.id} status={status} monthId={selectedMonthId} />
      )}
    </div>
  );
}
