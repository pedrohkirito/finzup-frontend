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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/theme-provider';

const links = [
  { href: '/dashboard', label: 'Resumo', icon: LayoutDashboard },
  { href: '/dashboard/receitas', label: 'Receitas', icon: TrendingUp },
  { href: '/dashboard/despesas', label: 'Despesas', icon: Receipt },
  { href: '/dashboard/investimentos', label: 'Investimentos', icon: PiggyBank },
  { href: '/dashboard/doacoes', label: 'Doações', icon: Heart },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const logout = async () => {
    await api.post('/auth/logout');
    router.push('/login');
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">F</div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">Finzup</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button variant="ghost" className="justify-start" onClick={toggle}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </Button>
        <Button variant="ghost" className="justify-start text-red-600" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
