import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-emerald-100 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-300',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 dark:bg-white/[0.07] dark:text-slate-300',
        outline: 'text-slate-700 dark:border-white/15 dark:text-slate-300',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
