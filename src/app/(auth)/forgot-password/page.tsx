'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useState } from 'react';

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Esqueci minha senha</h2>
      {sent ? (
        <p className="text-slate-600">
          Se o email existir, enviamos instruções para redefinir sua senha.
        </p>
      ) : (
        <AuthForm
          schema={schema}
          onSubmit={async (data) => {
            await api.post('/auth/forgot-password', data);
            setSent(true);
          }}
          fields={[{ name: 'email', label: 'Email', type: 'email' }]}
          submitLabel="Enviar link"
        />
      )}
      <Link href="/login" className="mt-4 block text-center text-sm text-emerald-600 hover:underline">
        Voltar ao login
      </Link>
    </div>
  );
}
