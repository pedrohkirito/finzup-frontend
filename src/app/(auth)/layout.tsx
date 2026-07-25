import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { MixpanelIdentify } from '@/components/analytics/mixpanel-identify';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4 dark:bg-slate-950 sm:p-6">
      <MixpanelIdentify />
      <div className="w-full max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          <Link href="/" aria-label="Finzup — Página inicial" className="mb-4 inline-block">
            <Logo
              variant="isologo"
              size={48}
              className="mx-auto h-10 w-auto sm:h-12"
              priority
            />
          </Link>
          <p className="text-sm text-slate-500 sm:text-base">Sua organização financeira simplificada</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)] sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
