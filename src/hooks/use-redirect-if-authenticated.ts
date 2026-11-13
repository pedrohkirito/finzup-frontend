'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { useAuth } from './use-auth';

export function useRedirectIfAuthenticated() {
  const { data: user, isPending, isSuccess } = useAuth({ refetchOnWindowFocus: false });
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (!isSuccess || !user || redirected.current) return;
    redirected.current = true;
    router.replace(getPostAuthRedirect(user));
  }, [isSuccess, user, router]);

  return { isLoading: isPending, isAuthenticated: isSuccess && !!user };
}
