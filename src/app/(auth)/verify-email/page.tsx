'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const email = params.get('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      api
        .get(`/auth/verify-email?token=${token}`)
        .then(() => {
          setMessage('Email verificado! Redirecionando...');
          setTimeout(() => router.push('/dashboard'), 1500);
        })
        .catch((err: ApiError) => setMessage(err.message))
        .finally(() => setLoading(false));
    }
  }, [token, router]);

  const resend = async () => {
    if (!email) return;
    await api.post('/auth/resend-verification', { email });
    setMessage('Se o email existir, enviamos um novo link.');
  };

  if (loading) return <p>Verificando email...</p>;

  return (
    <div className="text-center">
      <h2 className="mb-4 text-xl font-semibold">Verifique seu email</h2>
      {token ? (
        <p className="text-slate-600">{message}</p>
      ) : (
        <>
          <p className="mb-4 text-slate-600">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          {email && (
            <Button variant="outline" onClick={resend}>
              Reenviar email
            </Button>
          )}
          {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
