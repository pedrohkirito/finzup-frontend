'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { loginSchema } from '@/lib/validators';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Entrar na conta</h2>
      <AuthForm
        schema={loginSchema}
        onSubmit={async (data) => {
          await api.post('/auth/login', { email: String(data.email), password: String(data.password) });
          router.push('/dashboard');
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
