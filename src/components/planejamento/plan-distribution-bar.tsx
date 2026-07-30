'use client';

import { cn, formatCurrency } from '@/lib/utils';

export type DistributionSegment = {
  id: string;
  label: string;
  amount: number;
  color: string;
};

interface PlanDistributionBarProps {
  totalIncome: number;
  segments: DistributionSegment[];
  className?: string;
}

export function PlanDistributionBar({ totalIncome, segments, className }: PlanDistributionBarProps) {
  const allocated = segments.reduce((sum, s) => sum + s.amount, 0);
  const allocatedPercent = totalIncome > 0 ? (allocated / totalIncome) * 100 : 0;
  const freePercent = Math.max(0, 100 - allocatedPercent);
  const freeAmount = Math.max(0, totalIncome - allocated);

  const visibleSegments = segments.filter((s) => s.amount > 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
        {totalIncome <= 0 ? (
          <div className="h-full w-full bg-slate-200 dark:bg-white/[0.12]" />
        ) : (
          <>
            {visibleSegments.map((segment) => (
              <div
                key={segment.id}
                className={cn('h-full transition-all', segment.color)}
                style={{ width: `${(segment.amount / totalIncome) * 100}%` }}
                title={`${segment.label}: ${formatCurrency(segment.amount)}`}
              />
            ))}
            {freeAmount > 0 && (
              <div
                className="h-full bg-slate-200 dark:bg-white/[0.12]"
                style={{ width: `${freePercent}%` }}
                title={`Livre: ${formatCurrency(freeAmount)}`}
              />
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {allocatedPercent.toFixed(0)}% alocado
          {totalIncome > 0 && ` (${formatCurrency(allocated)})`}
        </span>
        <span className={cn(freeAmount < 0 && 'font-medium text-red-500')}>
          {freeAmount < 0
            ? `Excedente: ${formatCurrency(Math.abs(freeAmount))}`
            : `${freePercent.toFixed(0)}% livre (${formatCurrency(freeAmount)})`}
        </span>
      </div>

      {visibleSegments.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {visibleSegments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className={cn('h-2 w-2 rounded-full', segment.color)} />
              <span>{segment.label}</span>
              <span className="tabular-nums text-slate-400">
                {totalIncome > 0 ? `${((segment.amount / totalIncome) * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          ))}
          {freeAmount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-white/[0.2]" />
              <span>Livre</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
