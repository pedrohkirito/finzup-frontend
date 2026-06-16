'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { registerSchema } from '@/lib/validators';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Criar conta</h2>
      <AuthForm
        schema={registerSchema}
        onSubmit={async (data) => {
          const name = String(data.name);
          const cpf = String(data.cpf);
          const email = String(data.email);
          const password = String(data.password);
          const result = await api.post<{ emailVerified?: boolean }>('/auth/register', {
            name,
            cpf,
            email,
            password,
          });
          if (result.emailVerified) {
            router.push('/dashboard');
            return;
          }
          router.push('/verify-email?email=' + encodeURIComponent(email));
        }}
        fields={[
          { name: 'name', label: 'Nome completo', placeholder: 'Seu nome' },
          { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00', mask: 'cpf' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
          { name: 'password', label: 'Senha', type: 'password' },
          { name: 'confirmPassword', label: 'Confirmar senha', type: 'password' },
        ]}
        submitLabel="Criar conta"
        footer={
          <p className="pt-2 text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Entrar
            </Link>
          </p>
        }
      />
    </div>
  );
}
