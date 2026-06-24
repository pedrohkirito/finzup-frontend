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
import { Eye, EyeOff } from 'lucide-react';
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
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (name: string) =>
    setVisiblePasswords((current) => ({ ...current, [name]: !current[name] }));

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
              <label
                htmlFor={field.name}
                className="flex cursor-pointer items-start gap-3 rounded-lg py-1"
              >
                <Checkbox
                  id={field.name}
                  checked={checked}
                  className="mt-0.5"
                  onCheckedChange={(value) =>
                    form.setValue(field.name, value === true, { shouldValidate: true })
                  }
                />
                <span className="text-sm leading-relaxed font-normal text-slate-700 dark:text-slate-300">
                  {field.checkboxLabel ?? field.label}
                </span>
              </label>
              {form.formState.errors[field.name] && (
                <p className="text-sm text-red-500">
                  {(form.formState.errors[field.name] as { message?: string })?.message}
                </p>
              )}
            </div>
          );
        }

        const isPassword = field.type === 'password';
        const isVisible = visiblePasswords[field.name] === true;
        const inputType = isPassword ? (isVisible ? 'text' : 'password') : field.type || 'text';

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={inputType}
                placeholder={field.placeholder}
                className={isPassword ? 'pr-10' : undefined}
                {...form.register(field.name, {
                  onChange: field.mask === 'cpf'
                    ? (e) => {
                        e.target.value = maskCpfInput(e.target.value);
                      }
                    : undefined,
                })}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.name)}
                  aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
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
