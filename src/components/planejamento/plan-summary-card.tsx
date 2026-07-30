'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { PlanSummary } from '@/types';
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSummaryCardProps {
  summary: PlanSummary;
  compact?: boolean;
}

export function PlanSummaryCard({ summary, compact }: PlanSummaryCardProps) {
  const balancePositive = summary.balance >= 0;

  if (compact) {
    return (
      <div className="space-y-3">
        {summary.alerts.length > 0 && (
          <div className="space-y-2">
            {summary.alerts.map((alert) => (
              <div
                key={alert.type}
                className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const metrics = [
    { label: 'Receita', value: summary.totalIncome, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Despesas', value: summary.totalExpenses, color: 'text-red-600 dark:text-red-400' },
    { label: 'Doações', value: summary.totalDonations, color: 'text-sky-600 dark:text-sky-400' },
    { label: 'Investimentos', value: summary.totalInvestments, color: 'text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              <p className={cn('mt-1 text-xl font-bold tabular-nums', color)}>{formatCurrency(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        className={cn(
          'border-2',
          balancePositive
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10'
            : 'border-red-200 bg-red-50 dark:border-red-400/20 dark:bg-red-500/10',
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'icon-chip',
                balancePositive
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
              )}
            >
              {balancePositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Saldo estimado</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  balancePositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300',
                )}
              >
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Wallet className="h-4 w-4" />
            Taxa de poupança: {(summary.savingsRate * 100).toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map((alert) => (
            <div
              key={alert.type}
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
