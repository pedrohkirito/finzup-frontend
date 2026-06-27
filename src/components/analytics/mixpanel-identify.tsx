'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { setKnownUserId } from '@/lib/mixpanel';

export function MixpanelIdentify() {
  const { data: user } = useAuth({ refetchOnWindowFocus: false });
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || identifiedRef.current === user.id) return;
    setKnownUserId(user.id, { email: user.email, name: user.name });
    identifiedRef.current = user.id;
  }, [user]);

  return null;
}
