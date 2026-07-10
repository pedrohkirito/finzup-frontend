import { cn } from '@/lib/utils';

export function NewFeatureBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'brand-gradient-bg-r shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-brand-500/30',
        className,
      )}
    >
      Novo
    </span>
  );
}
