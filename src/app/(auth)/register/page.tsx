'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthBackLink } from '@/components/auth/auth-back-link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { registerSchema } from '@/lib/validators';
import { api } from '@/lib/api';
import { setKnownUserId } from '@/lib/mixpanel';
import { trackRegistrationComplete, trackRegistrationStarted } from '@/lib/funnel-analytics';
import { useEffect } from 'react';

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

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useRedirectIfAuthenticated();
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    trackRegistrationStarted();
  }, []);

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
      <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
        Passo 1 de 2
      </p>
      <h2 className="mb-1 text-xl font-semibold">Criar conta</h2>
      <p className="mb-6 text-sm text-slate-500">
        7 dias grátis · cancele quando quiser, sem cobrança durante o teste.
      </p>
      <AuthForm
        schema={registerSchema}
        defaultValues={{
          acceptedTerms: false,
          marketingOptIn: true,
        }}
        onSubmit={async (data) => {
          const name = String(data.name);
          const email = String(data.email);
          const password = String(data.password);
          const marketingOptIn = data.marketingOptIn === true;
          const result = await api.post<{ emailVerified?: boolean; userId?: string; user?: { id: string } }>(
            '/auth/register',
            {
              name,
              email,
              password,
              acceptedTerms: true,
              marketingOptIn,
            },
          );

          const userId = result.user?.id ?? result.userId;
          if (userId) {
            setKnownUserId(userId, { email, name }, { linkAnonymous: true });
          }

          trackRegistrationComplete(marketingOptIn);
          if (result.emailVerified) {
            router.push('/assinatura');
            return;
          }
          router.push('/verify-email?email=' + encodeURIComponent(email));
        }}
        fields={[
          { name: 'name', label: 'Nome completo', placeholder: 'Seu nome' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
          { name: 'password', label: 'Senha', type: 'password', showPasswordRequirements: true },
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
        socialAuth={(values) => (
          <>
            <AuthDivider />
            <GoogleSignInButton
              mode="register"
              acceptedTerms={values.acceptedTerms === true}
              marketingOptIn={values.marketingOptIn === true}
              disabled={values.acceptedTerms !== true}
              onError={setGoogleError}
            />
            {googleError && <p className="mt-2 text-center text-sm text-red-500">{googleError}</p>}
          </>
        )}
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
