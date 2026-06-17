'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { useAuth } from './use-auth';

export function useRedirectIfAuthenticated() {
  const { data: user, status } = useAuth({ refetchOnWindowFocus: false });
  const router = useRouter();

  useEffect(() => {
    if (status !== 'pending' && user) {
      router.push(getPostAuthRedirect(user));
    }
  }, [status, user, router]);

  return { isLoading: status === 'pending', isAuthenticated: !!user };
}
