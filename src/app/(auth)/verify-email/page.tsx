'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';

const RESEND_COOLDOWN_SECONDS = 60;

function formatCooldown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const email = params.get('email');
  const showResend = !token && !!email;
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(!!token);
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(showResend ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (token) {
      api
        .get(`/auth/verify-email?token=${token}`)
        .then(() => {
          setMessage('Email verificado! Redirecionando...');
          setTimeout(() => router.push('/assinatura'), 1500);
        })
        .catch((err: ApiError) => setMessage(err.message))
        .finally(() => setLoading(false));
    }
  }, [token, router]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timeoutId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [cooldownSeconds]);

  const resend = async () => {
    if (!email || cooldownSeconds > 0 || resending) return;
    setResending(true);
    setMessage('');
    try {
      await api.post('/auth/resend-verification', { email });
      setMessageType('success');
      setMessage('Se o email existir, enviamos um novo link.');
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setMessageType('error');
      setMessage(err instanceof ApiError ? err.message : 'Não foi possível reenviar o email.');
    } finally {
      setResending(false);
    }
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
            <Button variant="outline" onClick={resend} disabled={cooldownSeconds > 0 || resending}>
              {resending
                ? 'Enviando...'
                : cooldownSeconds > 0
                  ? `Reenviar em ${formatCooldown(cooldownSeconds)}`
                  : 'Reenviar email'}
            </Button>
          )}
          {message && (
            <p className={`mt-4 text-sm ${messageType === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
          <p className="mt-6 text-sm text-slate-500">
            Já confirmou seu email? Você pode fechar esta aba.
          </p>
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
