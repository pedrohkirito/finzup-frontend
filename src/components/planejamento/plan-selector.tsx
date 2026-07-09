'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { FinancialPlan } from '@/types';
import { Copy, Pencil, Plus, Trash2, CalendarDays } from 'lucide-react';

interface PlanSelectorProps {
  plans: FinancialPlan[];
  selectedPlanId: string | null;
  onSelect: (id: string) => void;
  monthId?: string | null;
}

export function PlanSelector({ plans, selectedPlanId, onSelect, monthId }: PlanSelectorProps) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [fromMonthOpen, setFromMonthOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameName, setRenameName] = useState('');
  const [fromMonthName, setFromMonthName] = useState('');
  const [saving, setSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['plans'] });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const plan = await api.post<FinancialPlan>('/plans', { name: newName.trim() });
      await invalidate();
      onSelect(plan.id);
      setNewName('');
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleFromMonth = async () => {
    if (!fromMonthName.trim() || !monthId) return;
    setSaving(true);
    try {
      const plan = await api.post<FinancialPlan>('/plans/from-month', {
        monthId,
        name: fromMonthName.trim(),
      });
      await invalidate();
      onSelect(plan.id);
      setFromMonthName('');
      setFromMonthOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const openRename = () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setRenameName(plan.name);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!selectedPlanId || !renameName.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/plans/${selectedPlanId}`, { name: renameName.trim() });
      await invalidate();
      queryClient.invalidateQueries({ queryKey: ['plans', selectedPlanId] });
      setRenameOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedPlanId) return;
    setSaving(true);
    try {
      const plan = await api.post<FinancialPlan>(`/plans/${selectedPlanId}/duplicate`);
      await invalidate();
      onSelect(plan.id);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanId) return;
    if (!confirm('Excluir este cenário?')) return;
    setSaving(true);
    try {
      await api.delete(`/plans/${selectedPlanId}`);
      await invalidate();
      const remaining = plans.filter((p) => p.id !== selectedPlanId);
      onSelect(remaining[0]?.id ?? '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Chips de cenários */}
      {plans.map((plan) => (
        <button
          key={plan.id}
          type="button"
          onClick={() => onSelect(plan.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            selectedPlanId === plan.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 opacity-70" />
          {plan.name}
        </button>
      ))}

      {/* Botão novo */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded-full px-3 text-slate-500"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Novo
      </Button>

      {/* Ações do cenário selecionado */}
      {selectedPlanId && (
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
          {monthId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs text-slate-400"
              onClick={() => setFromMonthOpen(true)}
            >
              Importar mês
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2 text-slate-400 hover:text-slate-600"
            disabled={saving}
            onClick={openRename}
            title="Renomear cenário"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2 text-slate-400 hover:text-slate-600"
            disabled={saving}
            onClick={handleDuplicate}
            title="Duplicar cenário"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2 text-slate-400 hover:text-red-600"
            disabled={saving}
            onClick={handleDelete}
            title="Excluir cenário"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Dialog novo cenário */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cenário</DialogTitle>
            <DialogDescription>
              Crie um planejamento para simular como distribuir sua renda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Conservador, Ideal, Apertado…"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!newName.trim() || saving}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear cenário</DialogTitle>
            <DialogDescription>Altere o nome deste planejamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={renameName}
              autoFocus
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleRename} disabled={!renameName.trim() || saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog importar do mês */}
      <Dialog open={fromMonthOpen} onOpenChange={setFromMonthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar do mês atual</DialogTitle>
            <DialogDescription>
              Cria um cenário pré-preenchido com os dados do mês selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome do cenário</Label>
            <Input
              placeholder="Ex: Baseado em julho"
              value={fromMonthName}
              autoFocus
              onChange={(e) => setFromMonthName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFromMonth()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleFromMonth} disabled={!fromMonthName.trim() || saving}>
              Criar cenário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
