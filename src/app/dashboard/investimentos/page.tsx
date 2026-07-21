'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewFeatureBadge } from '@/components/ui/new-feature-badge';
import { InvestmentSimulatorTab } from '@/components/investimentos/investment-simulator-tab';
import { InvestmentPageProvider, type InvestmentTab } from '@/providers/investment-page-provider';
import {
  getInvestmentPageBridgeState,
  resolveInvestmentTabFromUrl,
  subscribeInvestmentPageBridgeState,
  syncInvestmentPageBridgeState,
} from '@/lib/investment-page-bridge';
import { formatCurrency } from '@/lib/utils';
import type { InvestmentSimulation } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { EmergencyFundCard } from '@/components/baby-steps/emergency-fund-card';
import { HouseDownPaymentCard } from '@/components/baby-steps/house-down-payment-card';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

const goalSchema = z.object({ targetAmount: z.coerce.number().nonnegative() });
const entrySchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

function InvestmentAportesTab() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: goal } = useQuery({
    queryKey: ['investment-goal', selectedMonthId],
    queryFn: () => api.get<{ targetAmount: string | number } | null>(`/months/${selectedMonthId}/investments/goal`),
    enabled: !!selectedMonthId,
  });

  const { data: entries } = useQuery({
    queryKey: ['investments', selectedMonthId],
    queryFn: () => api.get<{ id: string; name: string; amount: string | number; notes?: string | null }[]>(
      `/months/${selectedMonthId}/investments`,
    ),
    enabled: !!selectedMonthId,
  });

  const goalForm = useForm({ resolver: zodResolver(goalSchema) });
  const entryForm = useForm({ resolver: zodResolver(entrySchema) });

  useEffect(() => {
    if (goal) {
      goalForm.reset({ targetAmount: Number(goal.targetAmount) });
    }
  }, [goal, goalForm]);

  const totalInvested = entries?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const target = goal ? Number(goal.targetAmount) : 0;
  const progress = target > 0 ? Math.min(100, (totalInvested / target) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meta do mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMonthOpen ? (
            <form
              onSubmit={goalForm.handleSubmit(async (data) => {
                await api.put(`/months/${selectedMonthId}/investments/goal`, data);
                await queryClient.invalidateQueries({ queryKey: ['investment-goal', selectedMonthId] });
                await queryClient.invalidateQueries({ queryKey: ['months'] });
              })}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <FormCurrencyInput
                control={goalForm.control}
                name="targetAmount"
                placeholder="Quanto quer guardar este mês?"
              />
              <Button type="submit" className="w-full sm:w-auto sm:shrink-0">
                Salvar meta
              </Button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Meta: {formatCurrency(target)}</p>
          )}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>{formatCurrency(totalInvested)} investidos</span>
              <span className="text-slate-500">Meta: {formatCurrency(target)}</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Aportes do mês</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          {isMonthOpen && (
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Novo aporte
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo investimento</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={entryForm.handleSubmit(async (data) => {
                await api.post(`/months/${selectedMonthId}/investments`, data);
                await queryClient.invalidateQueries();
                entryForm.reset();
                setOpen(false);
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Tesouro Direto" {...entryForm.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <FormCurrencyInput control={entryForm.control} name="amount" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input {...entryForm.register('notes')} />
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {entries?.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{entry.name}</p>
                {entry.notes && <p className="text-xs text-slate-500">{entry.notes}</p>}
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(Number(entry.amount))}
                </span>
                {isMonthOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await api.delete(`/months/${selectedMonthId}/investments/${entry.id}`);
                      await queryClient.invalidateQueries();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function InvestimentosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: babySteps } = useBabySteps();
  const tabFromUrl = resolveInvestmentTabFromUrl(pathname, searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<InvestmentTab>(tabFromUrl ?? 'aportes');
  const { data: simulations } = useQuery({
    queryKey: ['investment-simulations'],
    queryFn: () => api.get<InvestmentSimulation[]>('/investment-simulations'),
  });
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null);
  const handleSelectSimulation = useCallback((id: string) => {
    const nextId = id || null;
    setSelectedSimulationId(nextId);
    syncInvestmentPageBridgeState({ selectedSimulationId: nextId });
  }, []);

  const handleTabChange = useCallback(
    (tab: InvestmentTab) => {
      setActiveTab(tab);
      syncInvestmentPageBridgeState({ activeTab: tab });

      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'aportes') {
        params.delete('tab');
        params.delete('simulation');
      } else {
        params.set('tab', tab);
        if (tab !== 'simulador') {
          params.delete('simulation');
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const tab = resolveInvestmentTabFromUrl(pathname, searchParams.get('tab'));
    if (tab) {
      setActiveTab(tab);
      syncInvestmentPageBridgeState({ activeTab: tab });
    } else if (!searchParams.get('tab')) {
      setActiveTab('aportes');
      syncInvestmentPageBridgeState({ activeTab: 'aportes' });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const simulationFromUrl = searchParams.get('simulation');
    if (simulationFromUrl) {
      setSelectedSimulationId(simulationFromUrl);
      syncInvestmentPageBridgeState({ selectedSimulationId: simulationFromUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeInvestmentPageBridgeState(() => {
      const bridge = getInvestmentPageBridgeState();
      setActiveTab(bridge.activeTab);
      if (bridge.selectedSimulationId) {
        setSelectedSimulationId(bridge.selectedSimulationId);
      }
    });
  }, []);

  useEffect(() => {
    if (simulations?.length && !selectedSimulationId) {
      setSelectedSimulationId(simulations[0].id);
    }
  }, [simulations, selectedSimulationId]);

  return (
    <InvestmentPageProvider activeTab={activeTab} selectedSimulationId={selectedSimulationId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Investimentos</h1>
          <p className="text-sm text-slate-500">
            {BABY_STEPS_ENABLED
              ? 'Reserva, aportes, entrada da casa e simulações'
              : 'Aportes do mês e simulações de longo prazo'}
          </p>
        </div>

        <BabyStepPageHint pageKey="investimentos" />

        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabChange(v as InvestmentTab)}
          className="w-full"
        >
          <TabsList className="flex h-auto flex-wrap gap-1">
            {BABY_STEPS_ENABLED && <TabsTrigger value="reserva">Reserva</TabsTrigger>}
            <TabsTrigger value="aportes">Aportes</TabsTrigger>
            {BABY_STEPS_ENABLED && <TabsTrigger value="casa">Casa</TabsTrigger>}
            <TabsTrigger value="simulador" className="gap-2">
              Simulador
              <NewFeatureBadge />
            </TabsTrigger>
          </TabsList>
          {BABY_STEPS_ENABLED && (
            <TabsContent value="reserva" className="mt-4">
              {babySteps ? (
                <EmergencyFundCard state={babySteps} />
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
              )}
            </TabsContent>
          )}
          <TabsContent value="aportes" className="mt-4">
            <InvestmentAportesTab />
          </TabsContent>
          {BABY_STEPS_ENABLED && (
            <TabsContent value="casa" className="mt-4">
              {babySteps ? (
                <HouseDownPaymentCard state={babySteps} />
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
              )}
            </TabsContent>
          )}
          <TabsContent value="simulador" className="mt-4">
            <InvestmentSimulatorTab
              selectedSimulationId={selectedSimulationId}
              onSelectSimulation={handleSelectSimulation}
            />
          </TabsContent>
        </Tabs>
      </div>
    </InvestmentPageProvider>
  );
}
