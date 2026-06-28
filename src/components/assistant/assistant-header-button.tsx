'use client';

import { usePathname } from 'next/navigation';
import { AssistantTrigger } from '@/components/assistant/assistant-trigger';

export function AssistantHeaderButton() {
  const pathname = usePathname();
  if (pathname === '/dashboard/assistente') return null;
  return <AssistantTrigger variant="header" />;
}
