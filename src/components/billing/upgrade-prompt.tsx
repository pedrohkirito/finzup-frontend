'use client';

import Link from 'next/link';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Convite de upgrade para um recurso bloqueado pelo plano (ex.: espaço da empresa). */
export function UpgradePrompt({
  title = 'Disponível no Dono App',
  description = 'Separe o dinheiro da empresa do seu, com espaço PJ, contas com saldo e pró-labore.',
  className,
  compact = false,
}: {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/[0.07]',
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="icon-chip shrink-0 bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          {compact ? <Lock className="h-4 w-4" aria-hidden /> : <Crown className="h-4 w-4" aria-hidden />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {!compact && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{description}</p>}
        </div>
      </div>
      <Button asChild size="sm" className="brand-gradient-bg-r shrink-0 text-white hover:opacity-90">
        <Link href="/dashboard/planos">Ver planos</Link>
      </Button>
    </div>
  );
}
