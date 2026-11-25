import { HandCoins } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { ProLaboreStatus } from '@/types';

/** "Você pode retirar até R$ X este mês" com a barra do limite. */
export function WithdrawalHero({ status, compact = false }: { status: ProLaboreStatus; compact?: boolean }) {
  const exceeded = status.exceededBy > 0;
  const pct = status.monthLimit > 0 ? Math.min(100, (status.withdrawnTotal / status.monthLimit) * 100) : status.withdrawnTotal > 0 ? 100 : 0;
  return (
    <div className={cn('rounded-2xl border p-4 sm:p-5', exceeded ? 'border-red-300 bg-red-50/60 dark:border-red-500/40 dark:bg-red-500/10' : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10')}>
      <div className="flex items-start gap-3">
        <div className={cn('icon-chip h-10 w-10 shrink-0', exceeded ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400')}>
          <HandCoins className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-300">{exceeded ? 'Você já passou do limite deste mês' : 'Você pode retirar até'}</p>
          <p className={cn('font-bold tabular-nums', compact ? 'text-2xl' : 'text-3xl sm:text-4xl', exceeded ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
            {exceeded ? `+${formatCurrency(status.exceededBy)}` : formatCurrency(status.remaining)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {exceeded ? 'acima do limite' : 'este mês'} · limite {formatCurrency(status.monthLimit)} · retirado {formatCurrency(status.withdrawnTotal)}
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Retirado do limite do mês">
        <div className={cn('h-full rounded-full transition-all', exceeded ? 'bg-red-500' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
