'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TRIAL_DAYS } from '@/constants/billing';
import type { User } from '@/types';
import {
  trackEmailVerified,
  trackVerificationEmailResent,
  trackVerifyEmailPageViewed,
  trackVerifyEmailPollSuccess,
} from '@/lib/funnel-analytics';

const RESEND_COOLDOWN_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 24;

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
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(showResend ? RESEND_COOLDOWN_SECONDS : 0);
  const pollAttemptsRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPolling(false);
  }, []);

  const handleVerifiedSession = useCallback(() => {
    stopPolling();
    trackEmailVerified();
    trackVerifyEmailPollSuccess();
    router.push('/assinatura');
  }, [router, stopPolling]);

  useEffect(() => {
    trackVerifyEmailPageViewed(!!token);
  }, [token]);

  useEffect(() => {
    if (token) {
      api
        .get(`/auth/verify-email?token=${token}`)
        .then(() => {
          trackEmailVerified();
          setMessage('Email verificado! Redirecionando...');
          setTimeout(() => router.push('/assinatura'), 1500);
        })
        .catch((err: ApiError) => {
          setMessageType('error');
          setMessage(err.message);
        })
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

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback(() => {
    if (polling) return;
    setPollTimedOut(false);
    setPolling(true);
    pollAttemptsRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        const user = await api.get<User>('/users/me');
        if (user) {
          handleVerifiedSession();
          return;
        }
      } catch {
        // ainda não autenticado
      }

      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        setPollTimedOut(true);
      }
    }, POLL_INTERVAL_MS);
  }, [handleVerifiedSession, polling, stopPolling]);

  const resend = async () => {
    if (!email || cooldownSeconds > 0 || resending) return;
    setResending(true);
    setMessage('');
    try {
      await api.post('/auth/resend-verification', { email });
      trackVerificationEmailResent();
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

  const tokenFailed = !!token && messageType === 'error';

  return (
    <div className="text-center">
      {!token && (
        <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
          Passo 2 de 2
        </p>
      )}
      <h2 className="mb-4 text-xl font-semibold">
        {tokenFailed ? 'Link expirado ou inválido' : 'Ative seu teste grátis'}
      </h2>
      {token ? (
        <div className="space-y-4">
          <p className={messageType === 'error' ? 'text-red-500' : 'text-slate-600'}>{message}</p>
          {tokenFailed && (
            <>
              {email ? (
                <Button variant="outline" onClick={resend} disabled={cooldownSeconds > 0 || resending}>
                  {resending
                    ? 'Enviando...'
                    : cooldownSeconds > 0
                      ? `Reenviar em ${formatCooldown(cooldownSeconds)}`
                      : 'Reenviar email'}
                </Button>
              ) : (
                <p className="text-sm text-slate-500">
                  Solicite um novo link em{' '}
                  <Link href="/register" className="text-emerald-600 hover:underline">
                    criar conta
                  </Link>{' '}
                  ou entre em contato com o suporte.
                </p>
              )}
              <p className="text-sm text-slate-500">
                Já verificou?{' '}
                <Link href="/login" className="text-emerald-600 hover:underline">
                  Entrar na conta
                </Link>
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-slate-600">
            Abra o email que enviamos para <strong>{email}</strong> e clique no link — são{' '}
            {TRIAL_DAYS} dias grátis com 1 clique.
          </p>

          <ul className="mb-6 space-y-2 text-left text-sm text-slate-500">
            <li>✓ Verifique a caixa de entrada e a pasta de spam</li>
            <li>✓ O email pode levar 1–2 minutos para chegar</li>
            <li>✓ Depois de clicar no link, você escolhe o plano e inicia o teste</li>
          </ul>

          {email && (
            <div className="flex flex-col gap-3">
              <Button onClick={startPolling} disabled={polling} variant="default">
                {polling ? 'Verificando...' : 'Já cliquei no link'}
              </Button>
              <Button variant="outline" onClick={resend} disabled={cooldownSeconds > 0 || resending}>
                {resending
                  ? 'Enviando...'
                  : cooldownSeconds > 0
                    ? `Reenviar em ${formatCooldown(cooldownSeconds)}`
                    : 'Reenviar email'}
              </Button>
            </div>
          )}

          {pollTimedOut && (
            <p className="mt-4 text-sm text-slate-500">
              Ainda não detectamos a confirmação. Tente reenviar o email ou{' '}
              <Link href="/login" className="text-emerald-600 hover:underline">
                entre na conta
              </Link>{' '}
              após clicar no link.
            </p>
          )}

          {message && (
            <p className={`mt-4 text-sm ${messageType === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
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
