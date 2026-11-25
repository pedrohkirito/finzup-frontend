'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Layers, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveSpaces, useSpaceSelection } from '@/hooks/use-spaces';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MANAGE = '__manage__';

/**
 * Seletor do topo: visão consolidada, pessoal ou uma empresa. Toda a app filtra pelo espaço escolhido.
 * Só aparece quando o usuário tem pelo menos uma empresa.
 */
export function SpaceSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { spaces, businesses, isSuccess } = useActiveSpaces();
  const [selection, setSelection] = useSpaceSelection();
  const valid = selection === 'all' || spaces.some((s) => s.id === selection);

  // Espaço lembrado que não existe mais (arquivado/excluído): volta para o consolidado.
  useEffect(() => {
    if (isSuccess && !valid) setSelection('all');
  }, [isSuccess, valid, setSelection]);

  if (!businesses.length) return null;

  return (
    <Select
      value={valid ? selection : 'all'}
      onValueChange={(v) => {
        if (v === MANAGE) {
          router.push('/dashboard/empresas');
          return;
        }
        setSelection(v);
      }}
    >
      <SelectTrigger aria-label="Espaço" className={cn('h-9 w-full min-w-[11rem] sm:w-auto', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            Tudo (consolidado)
          </span>
        </SelectItem>
        {spaces.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="flex items-center gap-2">
              {s.kind === 'personal' ? (
                <User className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
              )}
              {s.name}
              {s.locked && <Lock className="h-3 w-3 text-amber-500" aria-label="Só leitura" />}
            </span>
          </SelectItem>
        ))}
        <SelectItem value={MANAGE}>
          <span className="text-brand-600 dark:text-brand-400">Gerenciar empresas</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
