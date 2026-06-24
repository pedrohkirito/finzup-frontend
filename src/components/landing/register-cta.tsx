'use client';

import Link from 'next/link';
import { trackLead } from '@/lib/meta-pixel';

interface RegisterCtaProps {
  href?: string;
  className?: string;
  contentName?: string;
  children: React.ReactNode;
}

export function RegisterCta({ href = '/register', className, contentName, children }: RegisterCtaProps) {
  return (
    <Link href={href} className={className} onClick={() => trackLead(contentName)}>
      {children}
    </Link>
  );
}
