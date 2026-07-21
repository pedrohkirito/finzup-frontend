'use client';

import Link from 'next/link';
import { trackLandingCtaClick } from '@/lib/funnel-analytics';

interface RegisterCtaProps {
  href?: string;
  className?: string;
  contentName?: string;
  children: React.ReactNode;
}

export function RegisterCta({ href = '/register', className, contentName, children }: RegisterCtaProps) {
  const ctaLabel = contentName ?? 'Criar conta';

  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackLandingCtaClick({
          ctaLocation: 'register_cta',
          ctaLabel,
          action: 'register',
        })
      }
    >
      {children}
    </Link>
  );
}
