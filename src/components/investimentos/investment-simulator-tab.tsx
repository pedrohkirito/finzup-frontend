'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SimulationSelector } from '@/components/investimentos/simulation-selector';
import { SimulationEditor } from '@/components/investimentos/simulation-editor';
import type { InvestmentSimulation, SimulationSuggestions } from '@/types';
import { LineChart } from 'lucide-react';

export function InvestmentSimulatorTab({
  selectedSimulationId,
  onSelectSimulation,
}: {
  selectedSimulationId: string | null;
  onSelectSimulation: (id: string) => void;
}) {
  const { data: simulations, isLoading } = useQuery({
    queryKey: ['investment-simulations'],
    queryFn: () => api.get<InvestmentSimulation[]>('/investment-simulations'),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['investment-simulations', 'suggestions'],
    queryFn: () => api.get<SimulationSuggestions>('/investment-simulations/suggestions'),
  });

  useEffect(() => {
    if (!simulations?.length) {
      onSelectSimulation('');
      return;
    }
    if (!selectedSimulationId || !simulations.some((s) => s.id === selectedSimulationId)) {
      onSelectSimulation(simulations[0].id);
    }
  }, [simulations, selectedSimulationId, onSelectSimulation]);

  const selectedSimulation = simulations?.find((s) => s.id === selectedSimulationId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando simulações…</p>;
  }

  if (!simulations?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-white/[0.08]">
        <LineChart className="h-10 w-10 text-slate-400" />
        <div>
          <p className="font-medium">Nenhuma simulação ainda</p>
          <p className="mt-1 text-sm text-slate-500">
            Crie uma simulação para projetar seu patrimônio com juros compostos.
          </p>
        </div>
        <SimulationSelector
          simulations={[]}
          selectedSimulationId={null}
          onSelect={onSelectSimulation}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimulationSelector
        simulations={simulations}
        selectedSimulationId={selectedSimulationId}
        onSelect={onSelectSimulation}
      />
      {selectedSimulation && (
        <SimulationEditor simulation={selectedSimulation} suggestions={suggestions} />
      )}
    </div>
  );
}
