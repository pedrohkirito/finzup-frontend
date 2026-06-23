'use client';

import { useState } from 'react';
import { Headset, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export const SUPPORT_EMAIL = 'atendimento@finzup.com.br';

type SupportLinkProps = {
  className?: string;
  variant?: 'sidebar' | 'mobile' | 'header';
  onOpen?: () => void;
};

export function SupportLink({ className, variant = 'sidebar', onOpen }: SupportLinkProps) {
  const [open, setOpen] = useState(false);
  const isMobile = variant === 'mobile';
  const isHeader = variant === 'header';

  function handleOpen() {
    onOpen?.();
    setOpen(true);
  }

  return (
    <>
      <Button
        variant={isHeader ? 'outline' : 'ghost'}
        size={isHeader ? 'sm' : 'default'}
        className={cn(
          isHeader ? 'gap-2' : 'justify-start',
          isMobile && 'h-11 w-full gap-3 px-3',
          className,
        )}
        onClick={handleOpen}
      >
        <Headset className={cn('h-4 w-4 shrink-0', isMobile && 'h-5 w-5')} />
        Suporte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suporte</DialogTitle>
            <DialogDescription>
              Precisa de ajuda? Entre em contato conosco pelo e-mail abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60">
                <Mail className="h-4 w-4 text-brand-700 dark:text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">E-mail</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-0.5 block truncate text-sm text-brand-700 hover:underline dark:text-brand-400"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button asChild>
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                <Mail className="h-4 w-4" />
                Enviar e-mail
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
