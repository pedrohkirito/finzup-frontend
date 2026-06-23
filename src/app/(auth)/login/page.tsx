'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthBackLink } from '@/components/auth/auth-back-link';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { loginSchema } from '@/lib/validators';
import { api } from '@/lib/api';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading, isAuthenticated } = useRedirectIfAuthenticated();

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
