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
import type { InvestmentSimulation } from '@/types';
import { Copy, LineChart, Pencil, Plus, Trash2 } from 'lucide-react';

interface SimulationSelectorProps {
  simulations: InvestmentSimulation[];
  selectedSimulationId: string | null;
  onSelect: (id: string) => void;
}

export function SimulationSelector({
  simulations,
  selectedSimulationId,
  onSelect,
}: SimulationSelectorProps) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameName, setRenameName] = useState('');
  const [saving, setSaving] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['investment-simulations'] });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const data = await api.post<{ simulation: InvestmentSimulation }>('/investment-simulations', {
        name: newName.trim(),
        initialAmount: 0,
        monthlyContribution: 500,
        annualYieldPercent: 12,
        annualContributionIncreasePercent: 5,
      });
      await invalidate();
      onSelect(data.simulation.id);
      setNewName('');
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const openRename = () => {
    const sim = simulations.find((s) => s.id === selectedSimulationId);
    if (!sim) return;
    setRenameName(sim.name);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!selectedSimulationId || !renameName.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/investment-simulations/${selectedSimulationId}`, {
        name: renameName.trim(),
      });
      await invalidate();
      queryClient.invalidateQueries({ queryKey: ['investment-simulations', selectedSimulationId] });
      setRenameOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedSimulationId) return;
    setSaving(true);
    try {
      const data = await api.post<{ simulation: InvestmentSimulation }>(
        `/investment-simulations/${selectedSimulationId}/duplicate`,
      );
      await invalidate();
      onSelect(data.simulation.id);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSimulationId) return;
    if (!confirm('Excluir esta simulação?')) return;
    setSaving(true);
    try {
      await api.delete(`/investment-simulations/${selectedSimulationId}`);
      await invalidate();
      const remaining = simulations.filter((s) => s.id !== selectedSimulationId);
      onSelect(remaining[0]?.id ?? '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {simulations.map((sim) => (
        <button
          key={sim.id}
          type="button"
          onClick={() => onSelect(sim.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            selectedSimulationId === sim.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          <LineChart className="h-3.5 w-3.5 opacity-70" />
          {sim.name}
        </button>
      ))}

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded-full px-3 text-slate-500"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Nova
      </Button>

      {selectedSimulationId && (
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2 text-slate-400 hover:text-slate-600"
            disabled={saving}
            onClick={openRename}
            title="Renomear simulação"
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
            title="Duplicar simulação"
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
            title="Excluir simulação"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova simulação</DialogTitle>
            <DialogDescription>
              Crie uma simulação para projetar seu patrimônio ao longo do tempo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Aposentadoria, Casa própria…"
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
            <DialogTitle>Renomear simulação</DialogTitle>
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
    </div>
  );
}
