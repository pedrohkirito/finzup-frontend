'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { setKnownUserId } from '@/lib/mixpanel';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import {
  trackEmailVerified,
  trackVerifyEmailPageViewed,
} from '@/lib/funnel-analytics';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    trackVerifyEmailPageViewed(true);
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    api
      .get<{ user?: User; emailVerified?: boolean }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        if (data.user?.id) {
          setKnownUserId(data.user.id, { email: data.user.email, name: data.user.name });
        }
        trackEmailVerified();
        router.replace('/login?verified=1');
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          router.replace('/login');
        }
      });
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-slate-500">Confirmando seu email…</p>
      <Link href="/login" className="text-sm text-brand-600 hover:underline">
        Ir para login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
