import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AuthBackLinkProps = {
  href?: string;
};

export function AuthBackLink({ href = '/' }: AuthBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Link>
  );
}
