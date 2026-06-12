'use client';

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
  onChange: (paid: boolean) => void;
}) {
  if (isMonthOpen) {
    return (
      <div
        className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900"
        role="group"
        aria-label="Status do pagamento"
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-2.5 sm:text-xs',
            !isPaid
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Fatura
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-2.5 sm:text-xs',
            isPaid
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          )}
        >
          <CircleCheck className="h-3.5 w-3.5" />
          Paga
        </button>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'shrink-0 gap-1',
        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700',
      )}
    >
      {isPaid ? (
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
