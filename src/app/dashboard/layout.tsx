'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MonthPicker } from '@/components/layout/month-picker';
import { MonthProvider } from '@/hooks/use-month';
import { useAuth } from '@/hooks/use-auth';
import { TrialBanner } from '@/components/billing/trial-banner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isError) {
      router.push('/login');
    }
  }, [isLoading, isError, router]);

  useEffect(() => {
    if (!isLoading && user && !user.billing?.hasAccess) {
      router.replace('/assinatura');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user?.billing?.hasAccess) return null;

  const { billing } = user;
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <MonthProvider>
      <div className="flex min-h-screen bg-white dark:bg-slate-950 md:h-screen md:overflow-hidden">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 pt-mobile-header pb-3 shadow-sm backdrop-blur-md md:px-8 md:py-4 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5 md:hidden">
                  <Logo size={32} className="h-8 w-8 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Finzup</p>
                    <p className="truncate text-xs text-slate-500">{firstName}</p>
                  </div>
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Olá,</p>
                  <p className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{firstName}</p>
                </div>
                <div className="sm:hidden">
                  <MonthPicker compact />
                </div>
              </div>
              <div className="hidden sm:block">
                <MonthPicker />
              </div>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 pb-mobile-nav md:p-8 md:pb-8 dark:bg-transparent">
            <TrialBanner billing={billing} />
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </MonthProvider>
  );
}
