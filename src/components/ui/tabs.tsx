'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { scrollAreaVariants } from '@/components/ui/scroll-area';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        scrollAreaVariants({ variant: 'none', orientation: 'horizontal' }),
        'inline-flex h-auto w-full items-center justify-start gap-1 rounded-xl bg-slate-100 p-1 text-slate-500 sm:w-auto sm:justify-center dark:border dark:border-white/[0.08] dark:bg-white/[0.05] dark:backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 hover:bg-white/60 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:hover:bg-white/[0.06] dark:hover:text-slate-200 dark:data-[state=active]:bg-white/[0.1] dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-4 focus-visible:outline-none', className)} {...props} />;
}
