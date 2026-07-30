'use client';

import { AlertTriangle } from 'lucide-react';
import type { MonthReport } from '@/types';

/** Exibe apenas alertas gerais do mês (ex: saldo negativo). Alertas de orçamento ficam na seção de orçamentos. */
export function ReportAlerts({ alerts }: { alerts: MonthReport['alerts'] }) {
  const globalAlerts = alerts.filter((a) => a.type === 'negative_balance');
  if (globalAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {globalAlerts.map((alert, index) => (
        <div
          key={`${alert.type}-${index}`}
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
