'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MonthPicker } from '@/components/layout/month-picker';
import { MonthProvider } from '@/hooks/use-month';
import { useAuth } from '@/hooks/use-auth';
import { TrialBanner } from '@/components/billing/trial-banner';
import { AssistantProvider } from '@/providers/assistant-provider';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#020618]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user?.billing?.hasAccess) return null;

  const { billing } = user;
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <MonthProvider>
      <AssistantProvider>
      <div className="flex min-h-screen bg-white bg-app-glow dark:bg-[#020618] md:h-screen md:overflow-hidden">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 pt-mobile-header pb-3 shadow-sm backdrop-blur-xl md:px-8 md:py-4 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5 md:hidden">
                  <Logo size={28} className="h-7 w-7 shrink-0 dark:hidden" />
                  <Logo variant="isologo" size={24} className="hidden h-6 w-auto shrink-0 dark:block" />
                  <p className="truncate text-sm font-semibold text-slate-900 dark:hidden">Finzup</p>
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Olá,</p>
                  <p className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{firstName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:hidden">
                  <MonthPicker compact />
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <MonthPicker />
              </div>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full bg-slate-50/70 p-4 pb-mobile-nav md:p-8 md:pb-8 dark:bg-transparent">
              <TrialBanner billing={billing} />
              {children}
              {pathname !== '/dashboard/assistente' && (
                <div className="h-16 md:h-28" aria-hidden />
              )}
            </ScrollArea>
          </main>
        </div>
        <MobileNav />
      </div>
      </AssistantProvider>
    </MonthProvider>
  );
}
