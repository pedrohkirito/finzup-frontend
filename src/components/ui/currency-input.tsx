'use client';

import * as React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { cn, centsToNumber, formatCurrencyInput, numberToCents } from '@/lib/utils';

type CurrencyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value?: number;
  onChange?: (value: number) => void;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, className, ...props }, ref) => {
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
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          R$
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          className={cn('pl-10', className)}
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
