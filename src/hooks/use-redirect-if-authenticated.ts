'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPostAuthRedirect } from '@/lib/post-auth';
import { useAuth } from './use-auth';

export function useRedirectIfAuthenticated() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(getPostAuthRedirect(user));
    }
  }, [isLoading, user, router]);

  return { isLoading, isAuthenticated: !!user };
}
