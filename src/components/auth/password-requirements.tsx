'use client';

import { Check, Circle } from 'lucide-react';
import { getPasswordRequirementStatus } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = getPasswordRequirementStatus(password);

  return (
    <ul className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
      {requirements.map(({ id, label, met }) => (
        <li
          key={id}
          className={cn(
            'flex items-center gap-2 text-sm transition-colors',
            met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {met ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 opacity-40" aria-hidden="true" />
          )}
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
