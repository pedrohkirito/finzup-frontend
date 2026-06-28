'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const scrollAreaVariants = cva('min-h-0', {
  variants: {
    variant: {
      default: 'scrollbar-thin',
      none: 'scrollbar-none',
    },
    orientation: {
      vertical: 'overflow-x-hidden overflow-y-auto',
      horizontal: 'overflow-y-hidden overflow-x-auto',
      both: 'overflow-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
    orientation: 'vertical',
  },
});

export { scrollAreaVariants };

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollAreaVariants> {}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, variant, orientation, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn(scrollAreaVariants({ variant, orientation }), className)}
      {...props}
    />
  ),
);
ScrollArea.displayName = 'ScrollArea';
