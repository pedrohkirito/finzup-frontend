'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterCategories, useCategories, useCreateCategory } from '@/hooks/use-categories';
import type { CategoryKind, FinanceScope } from '@/types';

const NONE = 'none';
const NEW = '__new__';

/**
 * Seletor de categoria (despesa ou receita) do PF/PJ do lançamento, com criação rápida.
 * Despesas, doações, parcelamentos e assinaturas gravam em `budgetTemplateId`; receitas em `categoryId`.
 */
export function CategorySelect({
  kind,
  scope = 'personal',
  value,
  onChange,
  label = 'Categoria',
  showLabel = true,
}: {
  kind: CategoryKind;
  scope?: FinanceScope;
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  showLabel?: boolean;
}) {
  const { data } = useCategories();
  const createCategory = useCreateCategory();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const options = filterCategories(data, kind, scope);
  // Lançamento antigo ligado a categoria de outro PF/PJ ou arquivada: mantém visível para não perder o vínculo.
  const current = value ? data?.find((c) => c.id === value) : undefined;
  const showCurrent = current && !options.some((o) => o.id === current.id);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      const created = await createCategory.mutateAsync({ name, kind, scope });
      onChange(created.id);
      setCreating(false);
      setNewName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a categoria.');
    }
  };

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <Link href="/dashboard/categorias" className="text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-300">
            Gerenciar
          </Link>
        </div>
      )}
      {creating ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder={kind === 'income' ? 'Ex.: Comissões' : 'Ex.: Pets'}
              value={newName}
              maxLength={60}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleCreate();
                }
                if (e.key === 'Escape') setCreating(false);
              }}
            />
            <Button type="button" size="icon" onClick={handleCreate} disabled={createCategory.isPending} aria-label="Criar categoria">
              {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => setCreating(false)} aria-label="Cancelar">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      ) : (
        <Select
          value={value ?? NONE}
          onValueChange={(v) => {
            if (v === NEW) {
              setCreating(true);
              return;
            }
            onChange(v === NONE ? null : v);
          }}
        >
          <SelectTrigger aria-label={label}>
            <SelectValue placeholder="Sem categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem categoria</SelectItem>
            {showCurrent && current && (
              <SelectItem value={current.id}>
                {current.name}
                {current.archived ? ' (arquivada)' : ''}
              </SelectItem>
            )}
            {options.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW}>
              <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300">
                <Plus className="h-3.5 w-3.5" /> Nova categoria
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
