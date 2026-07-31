'use client';

import { useState } from 'react';
import { Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SupportChannels } from '@/components/layout/support-channels';
import { cn } from '@/lib/utils';

type SupportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suporte</DialogTitle>
          <DialogDescription>
            Precisa de ajuda? Entre em contato pelo WhatsApp ou e-mail.
          </DialogDescription>
        </DialogHeader>

        <SupportChannels />
      </DialogContent>
    </Dialog>
  );
}

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

      <SupportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
