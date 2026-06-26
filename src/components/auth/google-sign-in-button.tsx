'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { trackGoogleAuthCompleted, trackGoogleAuthStarted } from '@/lib/funnel-analytics';
import type { User } from '@/types';

type GoogleAuthResponse =
  | { user: User }
  | { requiresLinking: true; linkToken: string; email: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              locale?: string;
            },
          ) => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_TERMS_ERROR_MESSAGE =
  'Aceite os Termos de Uso e a Política de Privacidade para continuar com o Google.';

type GoogleSignInButtonProps = {
  mode: 'login' | 'register';
  acceptedTerms?: boolean;
  marketingOptIn?: boolean;
  disabled?: boolean;
  onError?: (message: string) => void;
};

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`)) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar login do Google'));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  mode,
  acceptedTerms = false,
  marketingOptIn = false,
  disabled = false,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLDivElement>(null);
  const showedTermsError = useRef(false);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const showTermsError = useCallback(() => {
    showedTermsError.current = true;
    onError?.(GOOGLE_TERMS_ERROR_MESSAGE);
  }, [onError]);

  useEffect(() => {
    if (mode === 'register' && acceptedTerms && showedTermsError.current) {
      showedTermsError.current = false;
      onError?.('');
    }
  }, [acceptedTerms, mode, onError]);

  const handleCredential = useCallback(
    async (credential: string) => {
      if (mode === 'register' && !acceptedTerms) {
        showTermsError();
        return;
      }

      trackGoogleAuthStarted(mode);
      try {
        const result = await api.post<GoogleAuthResponse>('/auth/google', {
          credential,
          ...(mode === 'register'
            ? { acceptedTerms: true, marketingOptIn }
            : { acceptedTerms: false, marketingOptIn: false }),
        });

        if ('requiresLinking' in result && result.requiresLinking) {
          const params = new URLSearchParams({
            token: result.linkToken,
            email: result.email,
          });
          router.push(`/link-google?${params.toString()}`);
          return;
        }

        trackGoogleAuthCompleted(mode);
        const user = await queryClient.fetchQuery({
          queryKey: ['auth', 'me'],
          queryFn: () => api.get<User>('/users/me'),
        });
        router.push(getPostAuthRedirect(user));
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Não foi possível entrar com Google. Tente novamente.';
        onError?.(message);
      }
    },
    [acceptedTerms, marketingOptIn, mode, onError, queryClient, router, showTermsError],
  );

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            void handleCredential(response.credential);
          },
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: 320,
          locale: 'pt-BR',
        });

        setReady(true);
      })
      .catch(() => {
        onError?.('Login com Google indisponível no momento.');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, handleCredential, mode, onError]);

  if (!clientId) return null;

  const termsRequired = disabled && mode === 'register';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div ref={buttonRef} className={!ready ? 'pointer-events-none opacity-50' : ''} />
        {termsRequired && ready && (
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-not-allowed"
            onClick={showTermsError}
            aria-label="Aceite os termos para continuar com o Google"
          />
        )}
      </div>
      {termsRequired && (
        <p className="text-xs text-slate-500">Aceite os termos para continuar com o Google</p>
      )}
    </div>
  );
}
