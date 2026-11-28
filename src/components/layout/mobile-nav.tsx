'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  MoreHorizontal,
  PiggyBank,
  Heart,
  Settings,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  CalendarDays,
  Sparkles,
  CalendarRange,
  Footprints,
  Headset,
  Loader2,
  Crown,
  Tags,
  Building2,
  FileUp,
  Landmark,
  HandCoins,
  Briefcase,
  Gauge,
} from 'lucide-react';
import { cn, isNavLinkActive } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SupportDialog } from '@/components/layout/support-link';
import { NewFeatureBadge } from '@/components/ui/new-feature-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useNavLabel } from '@/hooks/use-finance-scope';
import { useTheme } from '@/providers/theme-provider';
import { useAssistant } from '@/providers/assistant-provider';
import { AssistantActivityMark } from '@/components/assistant/assistant-trigger';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

const primaryLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
  { href: '/dashboard/receitas', icon: TrendingUp, label: 'Receitas' },
  { href: '/dashboard/despesas', icon: Receipt, label: 'Despesas' },
];

const moreLinks = [
  ...(BABY_STEPS_ENABLED
    ? [{ href: '/dashboard/metodo', icon: Footprints, label: 'Método', isNew: true }]
    : []),
  { href: '/dashboard/categorias', icon: Tags, label: 'Categorias' },
  { href: '/dashboard/empresas', icon: Building2, label: 'Empresas' },
  { href: '/dashboard/planejamento', icon: CalendarRange, label: 'Planejamento' },
  { href: '/dashboard/assistente', icon: Sparkles, label: 'Assistente IA (tela cheia)' },
  { href: '/dashboard/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/dashboard/fluxo', icon: CalendarDays, label: 'Fluxo de caixa', isNew: true },
  { href: '/dashboard/importar', icon: FileUp, label: 'Importar extrato', isNew: true },
  { href: '/dashboard/open-finance', icon: Landmark, label: 'Open Finance', isNew: true },
  { href: '/dashboard/painel', icon: Briefcase, label: 'Painel do dono', isNew: true },
  { href: '/dashboard/pro-labore', icon: HandCoins, label: 'Pró-labore', isNew: true },
  { href: '/dashboard/investimentos', icon: PiggyBank, label: 'Investimentos' },
  { href: '/dashboard/doacoes', icon: Heart, label: 'Doações' },
  { href: '/dashboard/planos', icon: Crown, label: 'Planos' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
];

export function MobileNav() {
  const pathname = usePathname();
  const logout = useLogout();
  const { theme, toggle } = useTheme();
  const { openAssistant, loading: assistantLoading, unread: assistantUnread } = useAssistant();
  const assistantHasReply = assistantUnread && !assistantLoading;
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: user } = useAuth({ refetchOnWindowFocus: false });
  const navLabel = useNavLabel();
  const visibleMoreLinks = [
    ...moreLinks.filter((link) => link.href !== '/dashboard/open-finance' || user?.openFinance),
    ...(user?.isAdmin ? [{ href: '/dashboard/interno', icon: Gauge, label: 'Painel interno', isNew: false }] : []),
  ].map((link) => ({ ...link, label: navLabel(link.href, link.label) }));
  const [supportOpen, setSupportOpen] = useState(false);

  const isMoreActive = moreLinks.some(({ href }) => isNavLinkActive(pathname, href));

  return (
    <>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 min-h-[var(--mobile-nav-height)] border-t border-slate-200/80 bg-white/95 px-1 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.07)] backdrop-blur-xl md:hidden dark:border-white/[0.1] dark:bg-white/[0.06] dark:shadow-[0_-8px_32px_rgba(2,6,23,0.45)]">
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
                    ? 'text-brand-600 dark:text-brand-300'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-brand-50 dark:bg-brand-500/15 dark:shadow-[0_0_14px_rgba(3,182,230,0.35)]',
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
            className="relative -mt-5 flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pb-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-300"
            aria-label={
              assistantLoading
                ? 'Assistente pensando'
                : assistantHasReply
                  ? 'Assistente tem uma nova resposta'
                  : 'Abrir assistente de IA'
            }
            aria-busy={assistantLoading}
          >
            <span className="brand-gradient-bg relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-brand-500/40 ring-4 ring-white dark:ring-[#020618]/90">
              {assistantLoading && (
                <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-white/30" />
              )}
              {assistantLoading ? (
                <Loader2 className="relative h-6 w-6 animate-spin" />
              ) : (
                <Sparkles className="relative h-6 w-6" />
              )}
              <AssistantActivityMark loading={assistantLoading} unread={assistantHasReply} className="-top-0.5 -right-0.5" />
            </span>
            <span className="truncate">
              {assistantLoading ? 'Pensando…' : assistantHasReply ? 'Nova resposta' : 'Assistente'}
            </span>
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
                    ? 'text-brand-600 dark:text-brand-300'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-brand-50 dark:bg-brand-500/15 dark:shadow-[0_0_14px_rgba(3,182,230,0.35)]',
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
                ? 'text-brand-600 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                (isMoreActive || moreOpen) &&
                  'bg-brand-50 dark:bg-brand-500/15 dark:shadow-[0_0_14px_rgba(3,182,230,0.35)]',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl">
          <div className="mx-auto -mt-1 h-1 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden dark:bg-white/20" />
          <DialogHeader>
            <DialogTitle>Mais opções</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {visibleMoreLinks.map(({ href, icon: Icon, label, isNew }) => {
              const active = isNavLinkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.06]',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate">{label}</span>
                    {isNew && <NewFeatureBadge />}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-white/[0.08]">
            <Button
              variant="ghost"
              className="h-11 w-full justify-start gap-3 px-3"
              onClick={() => {
                setMoreOpen(false);
                setSupportOpen(true);
              }}
            >
              <Headset className="h-5 w-5" />
              Suporte
            </Button>
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

      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
