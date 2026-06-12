'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MonthPicker } from '@/components/layout/month-picker';
import { MonthProvider } from '@/hooks/use-month';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isError) {
      router.push('/login');
    }
  }, [isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <MonthProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 pt-mobile-header pb-3 backdrop-blur-md md:px-8 md:py-4 dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5 md:hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                    F
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Finzup</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="text-sm text-slate-500">Olá,</p>
                  <p className="truncate font-medium text-slate-900 dark:text-white">{user.email}</p>
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
          <main className="flex-1 overflow-y-auto p-4 pb-mobile-nav md:p-8 md:pb-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </MonthProvider>
  );
}
