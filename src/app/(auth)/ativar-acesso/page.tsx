'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { z } from 'zod';
import { passwordSchema } from '@/lib/validators';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

function AtivarAcessoContent() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = params.get('token') || '';

  return (
    <div>
      <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">Pagamento confirmado</p>
      <h2 className="mb-1 text-xl font-semibold">Crie sua senha e entre</h2>
      <p className="mb-6 text-sm text-slate-500">
        Falta só definir sua senha para acessar a Finzup.
      </p>
      <AuthForm
        schema={schema}
        onSubmit={async (data) => {
          await api.post('/auth/setup-access', {
            token,
            password: String(data.password),
          });
          await queryClient.invalidateQueries({ queryKey: ['auth'] });
          router.replace('/dashboard');
        }}
        fields={[
          { name: 'password', label: 'Senha', type: 'password', showPasswordRequirements: true },
          { name: 'confirmPassword', label: 'Confirmar senha', type: 'password' },
        ]}
        submitLabel="Ativar acesso e entrar"
      />
    </div>
  );
}

export default function AtivarAcessoPage() {
  return (
    <Suspense>
      <AtivarAcessoContent />
    </Suspense>
  );
}
