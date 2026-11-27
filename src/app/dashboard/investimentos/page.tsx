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
import type { InvestmentEntry, InvestmentSimulation } from '@/types';
import { Pencil, Plus, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { EntryExtrasFields, entryExtrasFormShape, extrasFormValues } from '@/components/finance/entry-extras-fields';
import { EntryExtrasMeta } from '@/components/finance/entry-extras-meta';
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { EmergencyFundCard } from '@/components/baby-steps/emergency-fund-card';
import { HouseDownPaymentCard } from '@/components/baby-steps/house-down-payment-card';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';
import { ConnectedHoldingsCard } from '@/components/open-finance/connected-holdings';

const goalSchema = z.object({ targetAmount: z.coerce.number().nonnegative() });
const entrySchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
  carryForward: z.boolean().optional(),
  ...entryExtrasFormShape,
});

function InvestmentAportesTab() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InvestmentEntry | null>(null);
  const queryClient = useQueryClient();

  const { data: goal } = useQuery({
    queryKey: ['investment-goal', selectedMonthId],
    queryFn: () => api.get<{ targetAmount: string | number } | null>(`/months/${selectedMonthId}/investments/goal`),
    enabled: !!selectedMonthId,
  });

  const { data: entries } = useQuery({
    queryKey: ['investments', selectedMonthId],
    queryFn: () => api.get<InvestmentEntry[]>(`/months/${selectedMonthId}/investments`),
    enabled: !!selectedMonthId,
  });

  const goalForm = useForm({ resolver: zodResolver(goalSchema) });
  const entryForm = useForm({ resolver: zodResolver(entrySchema), defaultValues: { carryForward: false } });
  const editForm = useForm({ resolver: zodResolver(entrySchema), defaultValues: { carryForward: false } });

  const openEdit = (entry: InvestmentEntry) => {
    editForm.reset({
      name: entry.name,
      amount: Number(entry.amount),
      notes: entry.notes ?? undefined,
      carryForward: !!entry.carryForward,
      ...extrasFormValues(entry),
    });
    setEditTarget(entry);
  };

  const renderEntryFields = (form: typeof entryForm) => (
    <>
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input placeholder="Ex: Reserva de emergência, Aposentadoria" {...form.register('name')} />
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <FormCurrencyInput control={form.control} name="amount" placeholder="0,00" />
      </div>
      <div className="space-y-2">
        <Label>Notas (opcional)</Label>
        <Input {...form.register('notes')} />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id={`carryForward-${form === entryForm ? 'new' : 'edit'}`}
          checked={!!form.watch('carryForward')}
          onCheckedChange={(v) => form.setValue('carryForward', !!v)}
          className="mt-0.5"
        />
        <Label htmlFor={`carryForward-${form === entryForm ? 'new' : 'edit'}`} className="leading-snug">
          Aporte recorrente
          <span className="block text-xs font-normal text-slate-400">Repete no mês seguinte ao fechar o mês.</span>
        </Label>
      </div>
      <EntryExtrasFields form={form} recurring={!!form.watch('carryForward')} />
    </>
  );

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
          <div className="flex items-center gap-3">
            <span className="icon-chip bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-base">Meta do mês</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total aportado</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalInvested)}
            </p>
            <span className="text-sm font-semibold tabular-nums text-violet-600 dark:text-violet-400">
              {Math.round(progress)}% da meta
            </span>
          </div>
          <div>
            <Progress value={progress} className="h-2.5 [&>div]:bg-violet-500" />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Meta: {formatCurrency(target)}
            </p>
          </div>
          {isMonthOpen && (
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
          )}
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
              {renderEntryFields(entryForm)}
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
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="icon-chip bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.name}</p>
                  {entry.notes && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {entry.notes}
                    </p>
                  )}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {entry.carryForward && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <RefreshCw className="h-3 w-3" />
                        Recorrente
                      </span>
                    )}
                    <EntryExtrasMeta entry={entry} recurring={!!entry.carryForward} />
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(Number(entry.amount))}
                </span>
                {isMonthOpen && (
                  <Button variant="ghost" size="icon" aria-label={`Editar ${entry.name}`} onClick={() => openEdit(entry)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {isMonthOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${entry.name}`}
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

      <Dialog open={!!editTarget} onOpenChange={(isOpen) => !isOpen && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar aporte</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <form
              onSubmit={editForm.handleSubmit(async (data) => {
                await api.patch(`/months/${selectedMonthId}/investments/${editTarget.id}`, data);
                await queryClient.invalidateQueries();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              {renderEntryFields(editForm)}
              <Button type="submit" className="w-full">
                Salvar alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
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

        <ConnectedHoldingsCard />

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
