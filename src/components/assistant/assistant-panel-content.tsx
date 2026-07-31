'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassOverlayClassName, glassSurfaceClassName } from '@/lib/glass';

export function AssistantPanelContent({
  className,
  children,
  onOpenAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={cn('fixed inset-0 z-[100]', glassOverlayClassName)} />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-[100] flex flex-col overflow-hidden',
          glassSurfaceClassName,
          'shadow-[0_30px_80px_-40px_rgba(3,182,230,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]',
          'inset-x-0 bottom-0 h-[min(85dvh,720px)] w-full rounded-t-3xl',
          'md:inset-x-auto md:bottom-6 md:right-6 md:h-[min(720px,calc(100dvh-3rem))] md:w-[min(440px,calc(100vw-2rem))] md:rounded-3xl',
          className,
        )}
        onOpenAutoFocus={(event) => {
          // No mobile, não focar automaticamente (evita abrir o teclado no input).
          if (window.matchMedia('(max-width: 767px)').matches) {
            event.preventDefault();
          }
          onOpenAutoFocus?.(event);
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3.5 right-4 rounded-full p-1.5 text-slate-400 opacity-80 transition-opacity hover:bg-white/[0.06] hover:text-slate-700 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60 dark:hover:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
