'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthBackLink } from '@/components/auth/auth-back-link';
import { api } from '@/lib/api';
import { setKnownUserId } from '@/lib/mixpanel';
import { getPostAuthRedirect } from '@/lib/post-auth';
import type { User } from '@/types';

const linkGoogleSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
});

function LinkGoogleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const linkToken = searchParams.get('token');
  const email = searchParams.get('email');

  if (!linkToken || !email) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-xl font-semibold">Link inválido</h2>
        <p className="mb-6 text-sm text-slate-600">
          O link de vinculação expirou ou está incompleto. Tente entrar com o Google novamente.
        </p>
        <Link href="/login" className="text-emerald-600 hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthBackLink href="/login" />
      <h2 className="mb-2 text-xl font-semibold">Vincular conta Google</h2>
      <p className="mb-6 text-sm text-slate-600">
        Já existe uma conta da Finzup com o email <strong>{email}</strong>. Digite a senha dessa conta
        para vincular o login com Google.
      </p>

      <AuthForm
        schema={linkGoogleSchema}
        onSubmit={async (data) => {
          await api.post('/auth/google/link', {
            linkToken,
            password: String(data.password),
          });
          const user = await queryClient.fetchQuery({
            queryKey: ['auth', 'me'],
            queryFn: () => api.get<User>('/users/me'),
          });
          setKnownUserId(user.id, { email: user.email, name: user.name });
          router.push(getPostAuthRedirect(user));
        }}
        fields={[{ name: 'password', label: 'Senha da conta da Finzup', type: 'password' }]}
        submitLabel="Vincular e entrar"
        footer={
          <div className="space-y-3 pt-2 text-center text-sm text-slate-500">
            <p>
              Não foi você que criou esta conta ou esqueceu a senha?{' '}
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="text-emerald-600 hover:underline"
              >
                Redefinir senha
              </Link>
            </p>
            <p>Depois de redefinir, volte e entre com o Google para concluir a vinculação.</p>
            <Link href="/login" className="block text-emerald-600 hover:underline">
              Voltar ao login
            </Link>
          </div>
        }
      />
    </div>
  );
}

export default function LinkGooglePage() {
  return (
    <Suspense>
      <LinkGoogleContent />
    </Suspense>
  );
}
