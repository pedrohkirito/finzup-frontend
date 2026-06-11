'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Receipt, PiggyBank, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Resumo' },
  { href: '/dashboard/receitas', icon: TrendingUp, label: 'Receitas' },
  { href: '/dashboard/despesas', icon: Receipt, label: 'Despesas' },
  { href: '/dashboard/investimentos', icon: PiggyBank, label: 'Invest.' },
  { href: '/dashboard/doacoes', icon: Heart, label: 'Doações' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Config.' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white px-2 py-2 md:hidden dark:border-slate-800 dark:bg-slate-950">
      {links.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px]',
            pathname.startsWith(href) ? 'text-emerald-600' : 'text-slate-500',
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
