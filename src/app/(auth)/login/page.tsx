'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthBackLink } from '@/components/auth/auth-back-link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { loginSchema } from '@/lib/validators';
import { api } from '@/lib/api';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

function AuthDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-slate-500">ou</span>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';
  const justVerified = searchParams.get('verified') === '1';
  const { isLoading, isAuthenticated } = useRedirectIfAuthenticated();
  const [googleError, setGoogleError] = useState('');

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <AuthBackLink />
      <h2 className="mb-6 text-xl font-semibold">Entrar na conta</h2>

      {justVerified && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-900">
          <p className="font-semibold">Email confirmado!</p>
          <p className="mt-2 leading-relaxed text-emerald-800">
            Entre com seu email e senha para continuar. Você pode fazer isso aqui ou em qualquer
            dispositivo — use a mesma conta que acabou de confirmar.
          </p>
        </div>
      )}

      <AuthForm
        schema={loginSchema}
        defaultValues={emailFromQuery ? { email: emailFromQuery } : undefined}
        onSubmit={async (data) => {
          await api.post('/auth/login', { email: String(data.email), password: String(data.password) });
          const user = await queryClient.fetchQuery({
            queryKey: ['auth', 'me'],
            queryFn: () => api.get<User>('/users/me'),
          });
          router.push(getPostAuthRedirect(user));
        }}
        fields={[
          { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
          { name: 'password', label: 'Senha', type: 'password' },
        ]}
        submitLabel="Entrar"
        socialAuth={() => (
          <>
            <AuthDivider />
            <GoogleSignInButton mode="login" onError={setGoogleError} />
            {googleError && <p className="mt-2 text-center text-sm text-red-500">{googleError}</p>}
          </>
        )}
        footer={
          <div className="space-y-2 pt-2 text-center text-sm text-slate-500">
            <Link href="/forgot-password" className="block text-emerald-600 hover:underline">
              Esqueci minha senha
            </Link>
            <p>
              Não tem conta?{' '}
              <Link href="/register" className="text-emerald-600 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        }
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
