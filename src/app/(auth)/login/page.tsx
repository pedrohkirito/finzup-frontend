'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      <AuthForm
        schema={loginSchema}
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
