import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/images/finzup_logo.svg';
const ISOLOGO_SRC = '/images/finzup_isologo.svg';
const ISOLOGO_ASPECT_RATIO = 1407 / 391;

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  variant?: 'logo' | 'isologo';
};

export function Logo({ size = 36, className, priority = false, variant = 'logo' }: LogoProps) {
  const isIsologo = variant === 'isologo';

  return (
    <Image
      src={isIsologo ? ISOLOGO_SRC : LOGO_SRC}
      alt="Finzup"
      width={isIsologo ? Math.round(size * ISOLOGO_ASPECT_RATIO) : size}
      height={size}
      className={cn('object-contain', className)}
      priority={priority}
    />
  );
}
