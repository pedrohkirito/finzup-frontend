'use client';

import { cn } from '@/lib/utils';

type Option<T extends string> = { value: T; label: string; hint?: string };

/** Botões lado a lado no visual das abas (TabsList), para escolhas curtas como PF/PJ. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = 'default',
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  size?: 'default' | 'sm';
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-slate-500 dark:border dark:border-white/[0.08] dark:bg-white/[0.05] dark:backdrop-blur-xl',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-white/[0.1] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                : 'hover:bg-white/60 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-slate-200',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
