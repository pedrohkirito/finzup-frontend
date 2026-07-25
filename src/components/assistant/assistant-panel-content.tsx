'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssistantPanelContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-[100] flex flex-col overflow-hidden',
          'border border-white/[0.1] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),#020617] shadow-[0_30px_80px_-40px_rgba(3,182,230,0.45)]',
          'inset-x-0 bottom-0 h-[min(85dvh,720px)] w-full rounded-t-3xl',
          'md:inset-x-auto md:bottom-6 md:right-6 md:h-[min(720px,calc(100dvh-3rem))] md:w-[min(440px,calc(100vw-2rem))] md:rounded-3xl',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3.5 right-4 rounded-full p-1.5 text-slate-400 opacity-80 transition-opacity hover:bg-white/[0.06] hover:text-white hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
