import { Logo } from '@/components/brand/logo';
import { SupportLink } from '@/components/layout/support-link';

export default function AssinaturaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={36} className="h-9 w-9" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Finzup</p>
              <p className="text-xs text-slate-500">Assinatura</p>
            </div>
          </div>
          <SupportLink variant="header" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
