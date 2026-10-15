import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type InstallmentEntryProgress = {
  financialMonthId: string;
  installmentNumber: number;
  paidAt?: string | null;
};

type InstallmentPlanProgress = {
  totalInstallments: number;
  installmentsPaid: number;
  installmentEntries?: InstallmentEntryProgress[];
};

export function getInstallmentProgress(plan: InstallmentPlanProgress, monthId?: string | null) {
  const total = Number(plan.totalInstallments) || 0;
  const recordedPaid = Math.min(Math.max(Number(plan.installmentsPaid) || 0, 0), total);
  const monthEntry = monthId
    ? plan.installmentEntries?.find((entry) => entry.financialMonthId === monthId)
    : undefined;

  // installmentsPaid só avança no fechamento do mês. A parcela do mês, quando marcada como paga, entra na barra antes disso.
  const paidAhead = (plan.installmentEntries ?? []).filter(
    (entry) => entry.paidAt && entry.installmentNumber > recordedPaid,
  ).length;
  const paid = Math.min(total, recordedPaid + paidAhead);
  const currentNumber = monthEntry
    ? monthEntry.installmentNumber
    : recordedPaid < total
      ? recordedPaid + 1
      : undefined;

  return { total, paid, currentNumber };
}

export function InstallmentProgress({
  plan,
  monthId,
}: {
  plan: InstallmentPlanProgress;
  monthId?: string | null;
}) {
  const { total, paid, currentNumber } = getInstallmentProgress(plan, monthId);
  const percent = total > 0 ? (paid / total) * 100 : 0;
  const showSegments = total > 0 && total <= 24;
  const currentIndex = currentNumber ? currentNumber - 1 : -1;

  const paidLabel = `${paid} ${paid === 1 ? 'paga' : 'pagas'}`;
  const positionLabel =
    currentNumber && total > 0 ? `Parcela ${currentNumber} de ${total}` : `${paid} de ${total} parcelas`;

  return (
    <div className="space-y-1.5">
      {showSegments ? (
        <div className="flex gap-1" role="img" aria-label={`${paidLabel} de ${total}`}>
          {Array.from({ length: total }, (_, index) => {
            const isPaid = index < paid;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={index}
                className={cn(
                  'h-2 min-w-0 flex-1 rounded-full',
                  isPaid
                    ? 'bg-violet-500'
                    : isCurrent
                      ? 'bg-violet-300 dark:bg-violet-400/80'
                      : 'bg-slate-200 dark:bg-white/10',
                )}
              />
            );
          })}
        </div>
      ) : (
        <Progress value={percent} className="h-1.5 [&>div]:bg-violet-500" />
      )}
      <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {positionLabel}
        {' · '}
        {paidLabel}
      </p>
    </div>
  );
}
