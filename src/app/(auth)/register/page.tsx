'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthBackLink } from '@/components/auth/auth-back-link';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { registerSchema } from '@/lib/validators';
import { api } from '@/lib/api';
import { trackRegistrationComplete } from '@/lib/meta-pixel';

export default function RegisterPage() {
  const router = useRouter();
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
      <h2 className="mb-6 text-xl font-semibold">Criar conta</h2>
      <AuthForm
        schema={registerSchema}
        defaultValues={{
          acceptedTerms: false,
          marketingOptIn: true,
        }}
        onSubmit={async (data) => {
          const name = String(data.name);
          const cpf = String(data.cpf);
          const email = String(data.email);
          const password = String(data.password);
          const marketingOptIn = data.marketingOptIn === true;
          const result = await api.post<{ emailVerified?: boolean }>('/auth/register', {
            name,
            cpf,
            email,
            password,
            acceptedTerms: true,
            marketingOptIn,
          });
          trackRegistrationComplete();
          if (result.emailVerified) {
            router.push('/assinatura');
            return;
          }
          router.push('/verify-email?email=' + encodeURIComponent(email));
        }}
        fields={[
          { name: 'name', label: 'Nome completo', placeholder: 'Seu nome' },
          { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00', mask: 'cpf' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
          { name: 'password', label: 'Senha', type: 'password', showPasswordRequirements: true },
          { name: 'confirmPassword', label: 'Confirmar senha', type: 'password' },
          {
            name: 'marketingOptIn',
            type: 'checkbox',
            checkboxLabel: (
              <>
                Quero receber novidades, dicas e promoções do Finzup por e-mail. Posso cancelar a
                qualquer momento, conforme a{' '}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  className="text-emerald-600 hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </>
            ),
          },
          {
            name: 'acceptedTerms',
            type: 'checkbox',
            checkboxLabel: (
              <>
                Li e aceito os{' '}
                <Link href="/termos-de-uso" target="_blank" className="text-emerald-600 hover:underline">
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  className="text-emerald-600 hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </>
            ),
          },
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
