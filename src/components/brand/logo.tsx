import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/images/finzup_icon.png';

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 36, className, priority = false }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Finzup"
      width={size}
      height={size}
      className={cn('rounded-lg object-contain', className)}
      priority={priority}
    />
  );
}
