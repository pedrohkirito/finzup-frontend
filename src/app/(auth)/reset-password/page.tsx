'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { z } from 'zod';
import { passwordSchema } from '@/lib/validators';
import { api } from '@/lib/api';

const schema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Senhas não conferem', path: ['confirmPassword'] });

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Redefinir senha</h2>
      <AuthForm
        schema={schema}
        onSubmit={async (data) => {
          await api.post('/auth/reset-password', { token, password: String(data.password) });
          router.push('/login');
        }}
        fields={[
          { name: 'password', label: 'Nova senha', type: 'password' },
          { name: 'confirmPassword', label: 'Confirmar senha', type: 'password' },
        ]}
        submitLabel="Redefinir senha"
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
