'use client';

import Link from 'next/link';
import { AlertTriangle, Briefcase, Building2, ChevronRight, Gauge, HandCoins, Info, Landmark, Loader2, OctagonAlert, PiggyBank, TrendingDown, TrendingUp, User, Wallet } from 'lucide-react';
import { cn, formatCurrency, formatMonth } from '@/lib/utils';
import { useMonthStore } from '@/hooks/use-month';
import { useHasFeature } from '@/hooks/use-plan';
import { useOwnerDashboard } from '@/hooks/use-owner-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import type { OwnerDashboard, OwnerDashboardAlert, OwnerDashboardCompany } from '@/types';

const ALERT_STYLE = {
  danger: { icon: OctagonAlert, cls: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  warning: { icon: AlertTriangle, cls: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  info: { icon: Info, cls: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
} as const;

function Kpi({ label, value, hint, icon: Icon, tone = 'neutral', href }: { label: string; value: string; hint?: string; icon: typeof Wallet; tone?: 'green' | 'red' | 'amber' | 'neutral'; href?: string }) {
  const chip = {
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    neutral: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  }[tone];
  const body = (
    <Card className={cn('h-full', href && 'transition-colors hover:border-emerald-400/50')}>
      <CardContent className="flex items-start gap-3 p-3 sm:p-4">
        <div className={cn('icon-chip hidden h-9 w-9 shrink-0 sm:flex', chip)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className={cn('truncate text-lg font-bold tabular-nums sm:text-xl', tone === 'red' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>{value}</p>
          {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function AlertsCard({ alerts }: { alerts: OwnerDashboardAlert[] }) {
  if (!alerts.length) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          <Gauge className="h-5 w-5" /> Tudo em ordem: nenhum alerta neste mês.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <ul>
          {alerts.map((a, i) => {
            const { icon: Icon, cls } = ALERT_STYLE[a.level];
            const inner = (
              <>
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cls)} aria-hidden />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{a.message}</span>
                {a.href && <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
              </>
            );
            return (
              <li key={i} className="border-t border-slate-100 first:border-t-0 dark:border-white/[0.06]">
                {a.href ? (
                  <Link href={a.href} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-start gap-2.5 px-4 py-2.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function CompanyCard({ c }: { c: OwnerDashboardCompany }) {
  const exceeded = c.exceededBy > 0;
  const pct = c.monthLimit > 0 ? Math.min(100, (c.withdrawnTotal / c.monthLimit) * 100) : c.withdrawnTotal > 0 ? 100 : 0;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Building2 className="h-4 w-4 text-slate-400" /> {c.name}
          </p>
          <Link href="/dashboard/pro-labore" className="text-xs text-emerald-600 hover:underline dark:text-emerald-400">
            Pró-labore →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Caixa</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{c.cashCurrent != null ? formatCurrency(c.cashCurrent) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dias de caixa</p>
            <p className={cn('font-semibold tabular-nums', c.daysOfCash != null && c.daysOfCash < 30 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>{c.daysOfCash != null ? c.daysOfCash : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lucro do mês</p>
            <p className={cn('font-semibold tabular-nums', c.monthProfit < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>{formatCurrency(c.monthProfit)}</p>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Retirado <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(c.withdrawnTotal)}</span>
              {c.definedAmount != null && <> de {formatCurrency(c.definedAmount)} definido</>}
            </span>
            <span className={cn('font-semibold', exceeded ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
              {exceeded ? `+${formatCurrency(c.exceededBy)} do limite` : `cabe ${formatCurrency(c.remaining)}`}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className={cn('h-full rounded-full', exceeded ? 'bg-red-500' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalCard({ p }: { p: OwnerDashboard['personal'] }) {
  const reservePct = p.emergencyFund.target > 0 ? Math.min(100, (p.emergencyFund.balance / p.emergencyFund.target) * 100) : 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-slate-400" /> Pessoal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Renda do mês</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(p.monthIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Custo de vida</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(p.monthCostOfLiving)}</p>
          </div>
          {p.cashCurrent != null && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saldo nas contas</p>
              <p className={cn('font-semibold tabular-nums', p.cashCurrent < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>{formatCurrency(p.cashCurrent)}</p>
            </div>
          )}
          {p.homeFinancing > 0 && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Financiamento da casa</p>
              <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(p.homeFinancing)}</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <TrendingDown className="h-4 w-4 text-red-500" /> Dívidas
            </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{p.consumerDebt.total > 0 ? formatCurrency(p.consumerDebt.total) : 'Nenhuma'}</span>
          </div>
          {p.consumerDebt.next && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Próxima a quitar: {p.consumerDebt.next.name} ({formatCurrency(p.consumerDebt.next.remainingBalance)})</p>}
        </div>
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <PiggyBank className="h-4 w-4 text-emerald-500" /> Reserva
            </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(p.emergencyFund.balance)} <span className="text-xs font-normal text-slate-400">de {formatCurrency(p.emergencyFund.target)}</span>
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${reservePct}%` }} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Cobre {p.emergencyFund.months.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {p.emergencyFund.months === 1 ? 'mês' : 'meses'} de custo de vida
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PainelDonoPage() {
  const canUse = useHasFeature('owner_dashboard');
  const { selectedMonthId } = useMonthStore();
  const { data, isLoading } = useOwnerDashboard(selectedMonthId, canUse);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Briefcase className="h-6 w-6 text-brand-500" aria-hidden /> Painel do dono
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Empresa e pessoal numa tela só{data?.month ? ` · ${formatMonth(data.month.year, data.month.month)}` : ''}.
        </p>
      </div>

      {!canUse ? (
        <UpgradePrompt title="Painel do dono faz parte do Dono App" description="Caixa da empresa, pró-labore, dívidas e reserva pessoais e alertas numa tela só." />
      ) : isLoading || !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Caixa das empresas"
              value={data.totals.cashCurrent != null ? formatCurrency(data.totals.cashCurrent) : '—'}
              hint={data.totals.daysOfCash != null ? `${data.totals.daysOfCash} dias de caixa` : 'ligue as contas às empresas'}
              icon={Landmark}
              tone={data.totals.daysOfCash != null && data.totals.daysOfCash < 30 ? 'red' : 'neutral'}
            />
            <Kpi
              label="Pode retirar"
              value={formatCurrency(data.totals.remaining)}
              hint={`já retirou ${formatCurrency(data.totals.withdrawnTotal)}`}
              icon={HandCoins}
              tone={data.companies.some((c) => c.exceededBy > 0) ? 'red' : 'green'}
              href="/dashboard/pro-labore"
            />
            <Kpi
              label="Lucro do mês"
              value={formatCurrency(data.totals.monthProfit)}
              hint="empresas, previsto"
              icon={data.totals.monthProfit < 0 ? TrendingDown : TrendingUp}
              tone={data.totals.monthProfit < 0 ? 'red' : 'green'}
            />
            <Kpi
              label="Dívidas pessoais"
              value={data.personal.consumerDebt.total > 0 ? formatCurrency(data.personal.consumerDebt.total) : 'Nenhuma'}
              hint={`reserva ${data.personal.emergencyFund.months.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de ${data.personal.emergencyFund.targetMonths} meses`}
              icon={Wallet}
              tone={data.personal.consumerDebt.total > 0 ? 'amber' : 'green'}
              href="/dashboard/metodo"
            />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              <AlertsCard alerts={data.alerts} />
              {data.companies.length ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {data.companies.map((c) => (
                    <CompanyCard key={c.spaceId} c={c} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-slate-600 dark:text-slate-300">
                    Cadastre sua empresa para ver caixa e pró-labore.
                    <Button asChild size="sm">
                      <Link href="/dashboard/empresas">Criar empresa</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            <PersonalCard p={data.personal} />
          </div>
        </>
      )}
    </div>
  );
}
