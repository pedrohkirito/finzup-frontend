'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { maskCpfInput } from '@/lib/cpf';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { useState } from 'react';

interface FieldConfig {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  mask?: 'cpf';
  showPasswordRequirements?: boolean;
  checkboxLabel?: React.ReactNode;
}

interface AuthFormProps {
  schema: z.ZodTypeAny;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  fields: FieldConfig[];
  submitLabel: string;
  footer?: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}

export function AuthForm({ schema, onSubmit, fields, submitLabel, footer, defaultValues }: AuthFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema as z.ZodObject<z.ZodRawShape>),
    defaultValues,
  });

  const watchedValues = form.watch();

  const handleSubmit = form.handleSubmit(async (data) => {
    setError('');
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        if (field.type === 'checkbox') {
          const checked = watchedValues[field.name] === true;

          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={field.name}
                  checked={checked}
                  onCheckedChange={(value) =>
                    form.setValue(field.name, value === true, { shouldValidate: true })
                  }
                />
                <Label htmlFor={field.name} className="cursor-pointer text-sm leading-relaxed font-normal">
                  {field.checkboxLabel ?? field.label}
                </Label>
              </div>
              {form.formState.errors[field.name] && (
                <p className="text-sm text-red-500">
                  {(form.formState.errors[field.name] as { message?: string })?.message}
                </p>
              )}
            </div>
          );
        }

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              {...form.register(field.name, {
                onChange: field.mask === 'cpf'
                  ? (e) => {
                      e.target.value = maskCpfInput(e.target.value);
                    }
                  : undefined,
              })}
            />
            {form.formState.errors[field.name] && (
              <p className="text-sm text-red-500">
                {(form.formState.errors[field.name] as { message?: string })?.message}
              </p>
            )}
            {field.showPasswordRequirements && (
              <PasswordRequirements password={String(watchedValues[field.name] ?? '')} />
            )}
          </div>
        );
      })}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Aguarde...' : submitLabel}
      </Button>
      {footer}
    </form>
  );
}
