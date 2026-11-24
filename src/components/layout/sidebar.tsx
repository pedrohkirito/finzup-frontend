'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PiggyBank,
  Heart,
  Settings,
  LogOut,
  Moon,
  Sun,
  Target,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Footprints,
  Crown,
  Tags,
  Building2,
  FileUp,
  HandCoins,
  Gauge,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { cn, isNavLinkActive } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SupportLink } from '@/components/layout/support-link';
import { NewFeatureBadge } from '@/components/ui/new-feature-badge';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useNavLabel } from '@/hooks/use-finance-scope';
import { useTheme } from '@/providers/theme-provider';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

const links = [
  { href: '/dashboard', label: 'Resumo', icon: LayoutDashboard },
  ...(BABY_STEPS_ENABLED
    ? [{ href: '/dashboard/metodo', label: 'Método', icon: Footprints, isNew: true }]
    : []),
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/fluxo', label: 'Fluxo de caixa', icon: CalendarDays, isNew: true },
  { href: '/dashboard/importar', label: 'Extratos', icon: FileUp, isNew: true },
  { href: '/dashboard/pro-labore', label: 'Pró-labore', icon: HandCoins, isNew: true },
  { href: '/dashboard/receitas', label: 'Receitas', icon: TrendingUp },
  { href: '/dashboard/despesas', label: 'Despesas', icon: Receipt },
  { href: '/dashboard/orcamentos', label: 'Orçamentos', icon: Target },
  { href: '/dashboard/categorias', label: 'Categorias', icon: Tags },
  { href: '/dashboard/empresas', label: 'Empresas', icon: Building2 },
  { href: '/dashboard/planejamento', label: 'Planejamento', icon: CalendarRange },
  { href: '/dashboard/investimentos', label: 'Investimentos', icon: PiggyBank },
  { href: '/dashboard/doacoes', label: 'Doações', icon: Heart },
  { href: '/dashboard/planos', label: 'Planos', icon: Crown },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

const ADMIN_LINK = { href: '/dashboard/interno', label: 'Painel interno', icon: Gauge, isNew: false };

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useAuth({ refetchOnWindowFocus: false });
  const visibleLinks = user?.isAdmin ? [...links, ADMIN_LINK] : links;
  const navLabel = useNavLabel();
  const logout = useLogout();
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-[2px_0_12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-xl md:flex md:h-screen md:overflow-hidden">
      <div className="flex h-full flex-col p-4">
        <div className="mb-8 flex h-8 shrink-0 items-center gap-2 px-2">
          <Logo size={32} className="h-8 w-8 dark:hidden" />
          <span className="text-lg font-bold text-slate-900 dark:hidden">Finzup</span>
          <Logo variant="isologo" size={32} className="hidden h-8 w-auto dark:block" />
        </div>

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 pr-2">
            {visibleLinks.map(({ href, label, icon: Icon, isNew }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isNavLinkActive(pathname, href)
                    ? 'bg-brand-100/70 font-semibold text-brand-700 shadow-[inset_3px_0_0_#0292b8] dark:bg-brand-500/10 dark:text-brand-300 dark:shadow-[inset_3px_0_0_#03b6e6]'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.04]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate">{navLabel(href, label)}</span>
                  {isNew && <NewFeatureBadge />}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-slate-200 pt-4 dark:border-white/[0.06]">
        <SupportLink />
        <Button variant="ghost" className="justify-start" onClick={toggle}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </Button>
        <Button variant="ghost" className="justify-start text-red-600" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
        </div>
      </div>
    </aside>
  );
}
