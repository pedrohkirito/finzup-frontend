'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { useState } from 'react';

interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface AuthFormProps {
  schema: z.ZodTypeAny;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  fields: FieldConfig[];
  submitLabel: string;
  footer?: React.ReactNode;
}

export function AuthForm({ schema, onSubmit, fields, submitLabel, footer }: AuthFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema as z.ZodObject<z.ZodRawShape>),
  });

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
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            {...form.register(field.name)}
          />
          {form.formState.errors[field.name] && (
            <p className="text-sm text-red-500">
              {(form.formState.errors[field.name] as { message?: string })?.message}
            </p>
          )}
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Aguarde...' : submitLabel}
      </Button>
      {footer}
    </form>
  );
}
