'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, Info, TrendingDown, Wallet } from 'lucide-react';
import { useMonthStore } from '@/hooks/use-month';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useCashFlow } from '@/hooks/use-cash-flow';
import { useBusinessEnabled, useScopeFilter, SCOPE_LONG_LABELS } from '@/hooks/use-finance-scope';
import { cn, formatCurrency, formatMonth } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScopeSwitch } from '@/components/finance/scope-switch';
import { CashFlowChart } from '@/components/fluxo/cash-flow-chart';
import { CashFlowMovementRow } from '@/components/fluxo/cash-flow-movement';
import { formatFlowDate, todayInMonth } from '@/components/fluxo/cash-flow-labels';
import type { CashFlow } from '@/types';

function balanceColor(value: number) {
  return value < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white';
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wallet;
  tone: 'green' | 'orange' | 'neutral' | 'red';
}) {
  const toneClass = {
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    neutral: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <div className="hidden sm:block">
          <div className={cn('icon-chip h-10 w-10', toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">{label}</p>
          <p className={cn('truncate text-base font-bold tabular-nums sm:text-xl', tone === 'red' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
            {value}
          </p>
          {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Breakdown({ flow, showScope }: { flow: CashFlow; showScope: boolean }) {
  const accounts = flow.byAccount.filter((a) => a.inflow !== 0 || a.outflow !== 0);
  const showAccounts = accounts.length > 1 || (accounts.length === 1 && accounts[0].bankAccountId !== null);
  if (!showAccounts && !showScope) return null;
  return (
    <div className={cn('grid gap-4', showAccounts && showScope && 'md:grid-cols-2')}>
      {showAccounts && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Por conta</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {accounts.map((a) => (
                <li key={a.bankAccountId ?? 'none'} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{a.name}</span>
                  <span className="shrink-0 text-right tabular-nums">
                    <span className={cn('font-semibold', balanceColor(a.net))}>{formatCurrency(a.net)}</span>
                    <span className="block text-xs text-slate-400">
                      +{formatCurrency(a.inflow)} / −{formatCurrency(a.outflow)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {showScope && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PF × PJ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {flow.byScope.map((s) => (
                <li key={s.scope} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{SCOPE_LONG_LABELS[s.scope]}</span>
                  <span className="shrink-0 text-right tabular-nums">
                    <span className={cn('font-semibold', balanceColor(s.net))}>{formatCurrency(s.net)}</span>
                    <span className="block text-xs text-slate-400">
                      +{formatCurrency(s.inflow)} / −{formatCurrency(s.outflow)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FluxoDeCaixaPage() {
  const { selectedMonthId } = useMonthStore();
  const [scope] = useScopeFilter();
  const businessEnabled = useBusinessEnabled();
  const [account, setAccount] = useState('all');
  const [showAllDays, setShowAllDays] = useState(false);
  const { data: accounts } = useBankAccounts();
  const { data: flow, isLoading, isError } = useCashFlow(selectedMonthId, scope, account);
  const accountNames = new Map((accounts ?? []).map((a) => [a.id, a.name]));

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !flow) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
        Não foi possível carregar o fluxo de caixa.
        {account !== 'all' && (
          <Button variant="outline" size="sm" className="ml-2" onClick={() => setAccount('all')}>
            Ver todas as contas
          </Button>
        )}
      </div>
    );
  }

  const today = todayInMonth(flow.year, flow.month);
  const { totals } = flow;
  const hasMovements = totals.datedCount + totals.undatedCount > 0;
  const visibleDays = showAllDays ? flow.days : flow.days.filter((d) => d.movements.length > 0 || d.day === today);
  const startBalance = flow.openingBalance + flow.undated.net;
  const scopeVisible = businessEnabled && scope === 'all';
  const filterLabel = [
    businessEnabled ? SCOPE_LONG_LABELS[scope] : null,
    account === 'all' ? null : account === 'none' ? 'Sem conta' : accountNames.get(account),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Fluxo de caixa</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Saldo previsto dia a dia em {formatMonth(flow.year, flow.month)}
            {filterLabel ? ` · ${filterLabel}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ScopeSwitch className="w-full sm:w-auto" />
          {accounts && accounts.length > 0 && (
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Filtrar por conta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">Sem conta</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {totals.firstNegativeDay && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/[0.08] dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            O saldo previsto fica negativo no <strong>dia {totals.firstNegativeDay}</strong>. O menor saldo é{' '}
            <strong>{formatCurrency(totals.lowestBalance)}</strong>
            {totals.lowestBalanceDay > 0 ? ` no dia ${totals.lowestBalanceDay}` : ''}. Veja se dá para adiantar uma entrada ou
            mudar a data de alguma saída.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Entradas" value={formatCurrency(totals.inflow)} icon={ArrowUpRight} tone="green" />
        <StatCard label="Saídas" value={formatCurrency(totals.outflow)} icon={ArrowDownRight} tone="orange" />
        <StatCard
          label="Saldo no fim do mês"
          value={formatCurrency(totals.closingBalance)}
          icon={Wallet}
          tone={totals.closingBalance < 0 ? 'red' : 'neutral'}
        />
        <StatCard
          label="Menor saldo"
          value={formatCurrency(totals.lowestBalance)}
          hint={totals.lowestBalanceDay > 0 ? `no dia ${totals.lowestBalanceDay}` : 'no início do mês'}
          icon={TrendingDown}
          tone={totals.lowestBalance < 0 ? 'red' : 'neutral'}
        />
      </div>

      {!hasMovements ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center dark:border-white/[0.08]">
          <div className="icon-chip mb-4 h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CalendarClock className="h-7 w-7" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200">Nada previsto para este filtro</p>
          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Cadastre receitas e despesas e, em “Mais detalhes”, informe o dia do mês para ver o saldo dia a dia.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Saldo previsto</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Saldo no fim de cada dia, considerando tudo o que está cadastrado no mês.</p>
            </CardHeader>
            <CardContent>
              <CashFlowChart flow={flow} today={today} />
            </CardContent>
          </Card>

          {flow.undated.movements.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Sem data · início do mês</CardTitle>
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Lançamentos sem dia contam no início do mês. Informe o dia em “Mais detalhes” para posicioná-los no fluxo.
                    </p>
                  </div>
                  <span className={cn('shrink-0 text-sm font-semibold tabular-nums', balanceColor(startBalance))}>
                    {formatCurrency(startBalance)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {flow.undated.movements.map((m) => (
                    <CashFlowMovementRow
                      key={m.id}
                      movement={m}
                      accountName={m.bankAccountId ? accountNames.get(m.bankAccountId) : undefined}
                      accountNames={accountNames}
                      showScope={scopeVisible}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-1">
              <CardTitle className="text-base">Dia a dia</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAllDays((v) => !v)}>
                {showAllDays ? 'Só dias com movimento' : 'Mostrar todos os dias'}
              </Button>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {visibleDays.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nenhum lançamento com data neste mês.
                </p>
              ) : (
                <ol className="space-y-2">
                  {visibleDays.map((d) => {
                    const isToday = d.day === today;
                    const isPast = today !== null && d.day < today;
                    return (
                      <li
                        key={d.day}
                        aria-current={isToday ? 'date' : undefined}
                        className={cn(
                          'rounded-xl border px-3 py-2.5',
                          isToday
                            ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-400/30 dark:bg-emerald-500/[0.06]'
                            : 'border-slate-100 dark:border-white/[0.06]',
                          isPast && 'opacity-70',
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatFlowDate(d.date)}</span>
                            {isToday && (
                              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-emerald-500">
                                Hoje
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={cn('text-sm font-bold tabular-nums', balanceColor(d.balance))}>{formatCurrency(d.balance)}</p>
                            {d.movements.some((m) => m.direction !== 'internal') && (
                              <p className={cn('text-xs tabular-nums', d.net < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400')}>
                                {d.net < 0 ? '−' : '+'} {formatCurrency(Math.abs(d.net))} no dia
                              </p>
                            )}
                          </div>
                        </div>
                        {d.movements.length > 0 && (
                          <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/[0.06]">
                            {d.movements.map((m) => (
                              <CashFlowMovementRow
                                key={m.id}
                                movement={m}
                                accountName={m.bankAccountId ? accountNames.get(m.bankAccountId) : undefined}
                                accountNames={accountNames}
                                showScope={scopeVisible}
                              />
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          <Breakdown flow={flow} showScope={scopeVisible} />
        </>
      )}

      <p className="text-xs text-slate-400">
        Compras no cartão de crédito entram como uma única saída no dia de vencimento da fatura (cadastre o vencimento em{' '}
        <Link href="/dashboard/configuracoes" className="underline hover:text-slate-600 dark:hover:text-slate-200">
          Configurações
        </Link>
        ). Por isso o saldo final aqui pode ser menor que o do Resumo, que deixa a fatura em aberto para o mês seguinte.
      </p>
    </div>
  );
}
