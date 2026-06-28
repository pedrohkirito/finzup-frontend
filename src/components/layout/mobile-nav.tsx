'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Target,
  MoreHorizontal,
  PiggyBank,
  Heart,
  Settings,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { cn, isNavLinkActive } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SupportLink } from '@/components/layout/support-link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLogout } from '@/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { useAssistant } from '@/providers/assistant-provider';

const primaryLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
  { href: '/dashboard/receitas', icon: TrendingUp, label: 'Receitas' },
  { href: '/dashboard/despesas', icon: Receipt, label: 'Despesas' },
];

const moreLinks = [
  { href: '/dashboard/orcamentos', icon: Target, label: 'Orçamentos' },
  { href: '/dashboard/assistente', icon: Sparkles, label: 'Assistente IA (tela cheia)' },
  { href: '/dashboard/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/dashboard/investimentos', icon: PiggyBank, label: 'Investimentos' },
  { href: '/dashboard/doacoes', icon: Heart, label: 'Doações' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
];

export function MobileNav() {
  const pathname = usePathname();
  const logout = useLogout();
  const { theme, toggle } = useTheme();
  const { openAssistant } = useAssistant();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreLinks.some(({ href }) => isNavLinkActive(pathname, href));

  return (
    <>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 min-h-[var(--mobile-nav-height)] border-t border-slate-200/80 bg-white/95 px-1 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.07)] backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none">
        <div className="mx-auto flex max-w-lg items-end justify-around">
          {primaryLinks.slice(0, 2).map(({ href, icon: Icon, label }) => {
            const active = isNavLinkActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-emerald-50 dark:bg-emerald-950/60',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => openAssistant()}
            className="relative -mt-5 flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pb-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400"
            aria-label="Abrir assistente de IA"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-white dark:ring-slate-950">
              <Sparkles className="h-6 w-6" />
            </span>
            <span className="truncate">Assistente</span>
          </button>

          {primaryLinks.slice(2).map(({ href, icon: Icon, label }) => {
            const active = isNavLinkActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-emerald-50 dark:bg-emerald-950/60',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors',
              isMoreActive || moreOpen
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                (isMoreActive || moreOpen) && 'bg-emerald-50 dark:bg-emerald-950/60',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Mais opções</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {moreLinks.map(({ href, icon: Icon, label }) => {
              const active = isNavLinkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-slate-800">
            <SupportLink variant="mobile" onOpen={() => setMoreOpen(false)} />
            <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-3" onClick={toggle}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </Button>
            <Button
              variant="ghost"
              className="h-11 w-full justify-start gap-3 px-3 text-red-600 hover:text-red-700"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
