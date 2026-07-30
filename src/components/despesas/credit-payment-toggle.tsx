'use client';

import { useEffect, useState } from 'react';
import { CreditCard, CircleCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function CreditPaymentToggle({
  isPaid,
  isMonthOpen,
  onChange,
}: {
  isPaid: boolean;
  isMonthOpen: boolean;
  onChange: (paid: boolean) => void | Promise<void>;
}) {
  const [paid, setPaid] = useState(isPaid);

  useEffect(() => {
    setPaid(isPaid);
  }, [isPaid]);

  const handleChange = (next: boolean) => {
    if (next === paid) return;
    const previous = paid;
    setPaid(next);
    void Promise.resolve(onChange(next)).catch(() => setPaid(previous));
  };

  if (isMonthOpen) {
    return (
      <div
        className="flex shrink-0 rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-white/[0.08] dark:bg-white/[0.04]"
        role="group"
        aria-label="Status do pagamento"
      >
        <button
          type="button"
          onClick={() => handleChange(false)}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors',
            !paid
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          <CreditCard className="h-3 w-3" />
          Fatura
        </button>
        <button
          type="button"
          onClick={() => handleChange(true)}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors',
            paid
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          <CircleCheck className="h-3 w-3" />
          Paga
        </button>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'h-6 shrink-0 gap-1 px-1.5 text-[11px]',
        paid
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
          : 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
      )}
    >
      {paid ? (
        <>
          <CircleCheck className="h-3 w-3" /> Paga
        </>
      ) : (
        <>
          <CreditCard className="h-3 w-3" /> Fatura
        </>
      )}
    </Badge>
  );
}
