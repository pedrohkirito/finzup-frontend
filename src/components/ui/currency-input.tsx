'use client';

import * as React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { cn, centsToNumber, formatCurrencyInput, numberToCents } from '@/lib/utils';

type CurrencyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value?: number;
  onChange?: (value: number) => void;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, className, disabled, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => formatCurrencyInput(numberToCents(value)));

    React.useEffect(() => {
      setDisplay(formatCurrencyInput(numberToCents(value)));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '');
      const cents = parseInt(digits || '0', 10);
      setDisplay(formatCurrencyInput(cents));
      onChange?.(centsToNumber(cents));
    };

    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 dark:border-white/10 dark:bg-white/[0.05] dark:ring-offset-slate-950 dark:backdrop-blur-md dark:focus-within:ring-emerald-400/70',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className="shrink-0 select-none font-medium text-slate-500 dark:text-slate-300">
          R$
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...props}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';

export function FormCurrencyInput<TFieldValues extends FieldValues>({
  control,
  name,
  ...props
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
} & Omit<CurrencyInputProps, 'value' | 'onChange' | 'onBlur'>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CurrencyInput
          {...props}
          ref={field.ref}
          value={field.value as number}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}
