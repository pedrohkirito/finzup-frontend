import { cn } from '@/lib/utils';

export function RefundNote({ className }: { className?: string }) {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)}>
      Reembolso integral em 7 dias
    </p>
  );
}
