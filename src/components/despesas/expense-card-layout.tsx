import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ExpenseCardLayoutProps = {
  dragHandle?: ReactNode;
  title: string;
  badges?: ReactNode;
  meta?: ReactNode;
  amount: ReactNode;
  progress?: {
    value: number;
    className?: string;
    label?: ReactNode;
  };
  status?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function ExpenseCardLayout({
  dragHandle,
  title,
  badges,
  meta,
  amount,
  progress,
  status,
  actions,
  children,
}: ExpenseCardLayoutProps) {
  return (
    <Card className="overflow-hidden border-slate-200 transition-all hover:shadow-sm dark:border-white/[0.1] dark:hover:bg-white/[0.08]">
      <CardContent className="space-y-2.5 px-3 py-4 sm:px-3.5 sm:py-4.5">
        <div className="flex items-start gap-1.5">
          {dragHandle}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold leading-snug text-slate-900 dark:text-white sm:text-[15px]">
                {title}
              </p>
              <div className="shrink-0 text-right text-sm font-bold tabular-nums leading-snug sm:text-base">
                {amount}
              </div>
            </div>

            {(meta || badges || actions) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {(meta || badges) && (
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {meta}
                    {badges}
                  </div>
                )}
                {actions && <div className="ml-auto flex shrink-0 items-center">{actions}</div>}
              </div>
            )}

            {status && <div className="flex items-center">{status}</div>}
          </div>
        </div>

        {progress && (
          <div className="space-y-1">
            <Progress
              value={Math.min(Math.max(progress.value, 0), 100)}
              className={cn('h-1.5', progress.className)}
            />
            {progress.label && (
              <div className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                {progress.label}
              </div>
            )}
          </div>
        )}

        {children && <div className="space-y-2">{children}</div>}
      </CardContent>
    </Card>
  );
}
