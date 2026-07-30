'use client';

import Link from 'next/link';
import { Footprints, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { cn } from '@/lib/utils';

type BabyStepCompassProps = {
  compact?: boolean;
  className?: string;
};

export function BabyStepCompass({ compact = false, className }: BabyStepCompassProps) {
  const { data, isLoading } = useBabySteps();

  if (isLoading || !data) return null;

  const current = data.steps.find((s) => s.status === 'current');

  return (
    <Card
      className={cn(
        'border-brand-200/80 bg-gradient-to-br from-brand-50/90 to-white dark:border-white/[0.08] dark:from-brand-500/[0.09] dark:to-transparent',
        className,
      )}
    >
      <CardContent className={cn('space-y-3', compact ? 'p-4' : 'p-5')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
              <Footprints className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Método Finzup
              </span>
            </div>
            <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Baby Step {data.currentStep}
              {current ? ` — ${current.shortTitle}` : ''}
            </p>
            {!compact && current && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{current.description}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="brand-gradient-text text-2xl font-bold tabular-nums">
              {data.progressPercent}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">do passo</p>
          </div>
        </div>

        <Progress value={data.progressPercent} className="h-2 [&>div]:brand-gradient-bg-r" />

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href={data.nextAction.href}>
              {data.nextAction.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/metodo">Ver jornada completa</Link>
          </Button>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.steps.map((step) => (
              <span
                key={step.step}
                title={step.title}
                className={cn(
                  'inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-semibold',
                  step.status === 'completed' &&
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
                  step.status === 'current' &&
                    'brand-gradient-bg text-white shadow-sm',
                  step.status === 'locked' &&
                    'bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500',
                )}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  step.step
                )}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
