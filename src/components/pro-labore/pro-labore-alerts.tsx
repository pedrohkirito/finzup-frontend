import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProLaboreAlert } from '@/types';

const STYLE = {
  danger: { icon: OctagonAlert, cls: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300' },
  warning: { icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300' },
  info: { icon: Info, cls: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300' },
} as const;

export function ProLaboreAlerts({ alerts, className, hideInfo = false }: { alerts: ProLaboreAlert[]; className?: string; hideInfo?: boolean }) {
  const shown = hideInfo ? alerts.filter((a) => a.level !== 'info') : alerts;
  if (!shown.length) return null;
  return (
    <ul className={cn('space-y-2', className)}>
      {shown.map((a) => {
        const { icon: Icon, cls } = STYLE[a.level];
        return (
          <li key={a.code} className={cn('flex items-start gap-2 rounded-xl border px-3 py-2 text-sm', cls)}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{a.message}</span>
          </li>
        );
      })}
    </ul>
  );
}
