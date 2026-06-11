'use client';

import { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ItemActions } from '@/components/despesas/item-actions';
import { SortableList } from '@/components/despesas/sortable-list';
import { formatCurrency } from '@/lib/utils';
import type {
  ExpenseEntry,
  FixedExpenseTemplate,
  InstallmentPlan,
  Subscription,
  Financing,
  FinancingEntry,
  PaymentMethod,
} from '@/types';
import { Plus } from 'lucide-react';

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().optional(),
});

const installmentSchema = z
  .object({
    name: z.string().min(1),
    totalInstallments: z.coerce.number().int().min(1),
    installmentAmount: z.coerce.number().positive().optional(),
    totalAmount: z.coerce.number().positive().optional(),
    installmentsPaid: z.coerce.number().int().min(0).default(0),
    paymentMethodId: z.string().uuid(),
  })
  .refine((d) => d.installmentsPaid <= d.totalInstallments, {
    message: 'Parcelas pagas não pode ser maior que o total',
  });

const fixedTemplateSchema = z.object({
  name: z.string().min(1),
  defaultAmount: z.coerce.number().nonnegative(),
  paymentMethodId: z.string().optional(),
});

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().uuid(),
});

const financingSchema = z.object({
  name: z.string().min(1),
  installmentAmount: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1),
  installmentsPaid: z.coerce.number().int().min(0).default(0),
  earlyPaymentAmount: z.coerce.number().min(0).default(0),
  paymentMethodId: z.string().uuid(),
});

type EditType = 'one_off' | 'fixed' | 'installment' | 'subscription' | 'financing';

function canCancelFinancingEntry(entry: FinancingEntry, installmentsPaid: number) {
  return entry.installmentNumber === installmentsPaid || entry.installmentNumber === installmentsPaid + 1;
}

function PaymentMethodSelect({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethod[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Método de pagamento" /></SelectTrigger>
      <SelectContent>
        {methods.map((m) => (
          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function DespesasPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: EditType; id: string } | null>(null);

  const invalidate = () => queryClient.invalidateQueries();

  const { data: methods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
  });

  const { data: oneOff } = useQuery({
    queryKey: ['expenses', selectedMonthId, 'one_off'],
    queryFn: () => api.get<ExpenseEntry[]>(`/months/${selectedMonthId}/expenses?type=one_off`),
    enabled: !!selectedMonthId,
  });

  const { data: fixed } = useQuery({
    queryKey: ['fixed-templates'],
    queryFn: () => api.get<FixedExpenseTemplate[]>('/fixed-expense-templates'),
  });

  const { data: installments } = useQuery({
    queryKey: ['installments'],
    queryFn: () => api.get<InstallmentPlan[]>('/installment-plans'),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => api.get<Subscription[]>('/subscriptions'),
  });

  const { data: financings } = useQuery({
    queryKey: ['financings'],
    queryFn: () => api.get<Financing[]>('/financings'),
  });

  const expenseForm = useForm({ resolver: zodResolver(expenseSchema) });
  const fixedTemplateForm = useForm({ resolver: zodResolver(fixedTemplateSchema) });
  const installmentForm = useForm({ resolver: zodResolver(installmentSchema), defaultValues: { installmentsPaid: 0 } });
  const subscriptionForm = useForm({ resolver: zodResolver(subscriptionSchema) });
  const financingForm = useForm({ resolver: zodResolver(financingSchema), defaultValues: { installmentsPaid: 0, earlyPaymentAmount: 0 } });

  const defaultMethod = methods?.find((m) => m.isDefault)?.id;

  const saveOrder = async (endpoint: string, items: { id: string }[]) => {
    await api.post(endpoint, { ids: items.map((item) => item.id) });
    invalidate();
  };

  const openEdit = (type: EditType, item: ExpenseEntry | FixedExpenseTemplate | InstallmentPlan | Subscription | Financing) => {
    if (type === 'one_off') {
      const e = item as ExpenseEntry;
      expenseForm.reset({
        name: e.name,
        amount: Number(e.amount),
        paymentMethodId: e.paymentMethodId ?? defaultMethod,
      });
    } else if (type === 'fixed') {
      const t = item as FixedExpenseTemplate;
      fixedTemplateForm.reset({
        name: t.name,
        defaultAmount: Number(t.defaultAmount),
        paymentMethodId: t.paymentMethodId ?? defaultMethod,
      });
    } else if (type === 'installment') {
      const p = item as InstallmentPlan;
      installmentForm.reset({
        name: p.name,
        totalInstallments: p.totalInstallments,
        installmentAmount: Number(p.installmentAmount),
        installmentsPaid: p.installmentsPaid,
        paymentMethodId: p.paymentMethod.id,
      });
    } else if (type === 'subscription') {
      const s = item as Subscription;
      subscriptionForm.reset({
        name: s.name,
        amount: Number(s.amount),
        paymentMethodId: s.paymentMethod.id,
      });
    } else {
      const f = item as Financing;
      financingForm.reset({
        name: f.name,
        installmentAmount: Number(f.installmentAmount),
        totalInstallments: f.totalInstallments,
        installmentsPaid: f.installmentsPaid,
        earlyPaymentAmount: Number(f.earlyPaymentAmount),
        paymentMethodId: f.paymentMethod.id,
      });
    }
    setEditTarget({ type, id: item.id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Despesas</h1>
        <p className="text-slate-500">Avulsas, fixas, parceladas, assinaturas e financiamentos</p>
      </div>

      <Tabs defaultValue="avulsas">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="avulsas">Avulsas</TabsTrigger>
          <TabsTrigger value="fixas">Fixas</TabsTrigger>
          <TabsTrigger value="parceladas">Parceladas</TabsTrigger>
          <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
          <TabsTrigger value="financiamentos">Financiamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="avulsas" className="space-y-4">
          <Dialog open={dialog === 'expense'} onOpenChange={(o) => setDialog(o ? 'expense' : null)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Nova despesa avulsa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova despesa avulsa</DialogTitle></DialogHeader>
              <form
                onSubmit={expenseForm.handleSubmit(async (data) => {
                  await api.post(`/months/${selectedMonthId}/expenses`, {
                    ...data,
                    paymentMethodId: data.paymentMethodId || defaultMethod,
                  });
                  invalidate();
                  expenseForm.reset();
                  setDialog(null);
                })}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Nome</Label><Input {...expenseForm.register('name')} /></div>
                <div className="space-y-2"><Label>Valor</Label><FormCurrencyInput control={expenseForm.control} name="amount" placeholder="0,00" /></div>
                {methods && (
                  <PaymentMethodSelect
                    methods={methods}
                    value={expenseForm.watch('paymentMethodId') || defaultMethod}
                    onChange={(v) => expenseForm.setValue('paymentMethodId', v)}
                  />
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {oneOff && (
            <SortableList
              items={oneOff}
              onReorder={(items) => saveOrder(`/months/${selectedMonthId}/expenses/reorder`, items)}
            >
              {(e, dragHandle) => (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    {dragHandle}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.paymentMethod?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-500">{formatCurrency(Number(e.amount))}</span>
                      <ItemActions
                        onEdit={() => openEdit('one_off', e)}
                        onDelete={async () => {
                          await api.delete(`/months/${selectedMonthId}/expenses/${e.id}`);
                          invalidate();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="fixas" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={dialog === 'fixed'} onOpenChange={(o) => setDialog(o ? 'fixed' : null)}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" /> Nova despesa fixa</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova despesa fixa</DialogTitle></DialogHeader>
                <form
                  onSubmit={fixedTemplateForm.handleSubmit(async (data) => {
                    await api.post('/fixed-expense-templates', {
                      ...data,
                      paymentMethodId: data.paymentMethodId || defaultMethod,
                    });
                    invalidate();
                    fixedTemplateForm.reset();
                    setDialog(null);
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Aluguel" {...fixedTemplateForm.register('name')} /></div>
                  <div className="space-y-2"><Label>Valor padrão (R$)</Label><FormCurrencyInput control={fixedTemplateForm.control} name="defaultAmount" placeholder="0,00" /></div>
                  {methods && (
                    <PaymentMethodSelect
                      methods={methods}
                      value={fixedTemplateForm.watch('paymentMethodId') || defaultMethod}
                      onChange={(v) => fixedTemplateForm.setValue('paymentMethodId', v)}
                    />
                  )}
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={async () => {
              await api.post(`/months/${selectedMonthId}/expenses/sync-fixed`);
              invalidate();
            }}>
              Sincronizar com o mês atual
            </Button>
          </div>
          {fixed && (
            <SortableList
              items={fixed}
              onReorder={(items) => saveOrder('/fixed-expense-templates/reorder', items)}
            >
              {(t, dragHandle) => (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    {dragHandle}
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <p className="font-medium">{t.name}</p>
                      {t.isSystemSeeded && <Badge variant="secondary">Sugerida</Badge>}
                      <p className="text-sm text-red-500">{formatCurrency(Number(t.defaultAmount))}</p>
                    </div>
                    <ItemActions
                      onEdit={() => openEdit('fixed', t)}
                      onDelete={async () => {
                        await api.delete(`/fixed-expense-templates/${t.id}`);
                        invalidate();
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="parceladas" className="space-y-4">
          <Dialog open={dialog === 'installment'} onOpenChange={(o) => setDialog(o ? 'installment' : null)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Novo parcelamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Parcelamento no cartão</DialogTitle></DialogHeader>
              <form
                onSubmit={installmentForm.handleSubmit(async (data) => {
                  await api.post('/installment-plans', { ...data, startMonthId: selectedMonthId });
                  invalidate();
                  installmentForm.reset();
                  setDialog(null);
                })}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Nome</Label><Input {...installmentForm.register('name')} /></div>
                <div className="space-y-2"><Label>Total de parcelas</Label><Input type="number" {...installmentForm.register('totalInstallments')} /></div>
                <div className="space-y-2"><Label>Valor da parcela</Label><FormCurrencyInput control={installmentForm.control} name="installmentAmount" placeholder="0,00" /></div>
                <div className="space-y-2"><Label>Parcelas já pagas</Label><Input type="number" {...installmentForm.register('installmentsPaid')} /></div>
                {methods && (
                  <PaymentMethodSelect
                    methods={methods.filter((m) => m.type === 'credit')}
                    value={installmentForm.watch('paymentMethodId')}
                    onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
                  />
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {installments && (
            <SortableList
              items={installments}
              onReorder={(items) => saveOrder('/installment-plans/reorder', items)}
            >
              {(p, dragHandle) => (
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start gap-3">
                      {dragHandle}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex justify-between gap-4">
                          <p className="font-medium">{p.name}</p>
                          <span className="shrink-0 text-red-500">{formatCurrency(Number(p.installmentAmount))}/mês</span>
                        </div>
                        <Progress value={(p.installmentsPaid / p.totalInstallments) * 100} />
                        <p className="text-xs text-slate-500">{p.installmentsPaid}/{p.totalInstallments} parcelas pagas</p>
                      </div>
                      <ItemActions
                        onEdit={() => openEdit('installment', p)}
                        onDelete={async () => {
                          await api.delete(`/installment-plans/${p.id}`);
                          invalidate();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="assinaturas" className="space-y-4">
          <Dialog open={dialog === 'subscription'} onOpenChange={(o) => setDialog(o ? 'subscription' : null)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Nova assinatura</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova assinatura</DialogTitle></DialogHeader>
              <form
                onSubmit={subscriptionForm.handleSubmit(async (data) => {
                  await api.post('/subscriptions', data);
                  invalidate();
                  subscriptionForm.reset();
                  setDialog(null);
                })}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Nome</Label><Input {...subscriptionForm.register('name')} /></div>
                <div className="space-y-2"><Label>Valor mensal</Label><FormCurrencyInput control={subscriptionForm.control} name="amount" placeholder="0,00" /></div>
                {methods && (
                  <PaymentMethodSelect
                    methods={methods}
                    value={subscriptionForm.watch('paymentMethodId')}
                    onChange={(v) => subscriptionForm.setValue('paymentMethodId', v)}
                  />
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {subscriptions && (
            <SortableList
              items={subscriptions}
              onReorder={(items) => saveOrder('/subscriptions/reorder', items)}
            >
              {(s, dragHandle) => (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    {dragHandle}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.paymentMethod.name} · Mensal</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-500">{formatCurrency(Number(s.amount))}</span>
                      <ItemActions
                        onEdit={() => openEdit('subscription', s)}
                        onDelete={async () => {
                          await api.delete(`/subscriptions/${s.id}`);
                          invalidate();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="financiamentos" className="space-y-4">
          <Dialog open={dialog === 'financing'} onOpenChange={(o) => setDialog(o ? 'financing' : null)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Novo financiamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo financiamento</DialogTitle></DialogHeader>
              <form
                onSubmit={financingForm.handleSubmit(async (data) => {
                  await api.post('/financings', data);
                  invalidate();
                  financingForm.reset();
                  setDialog(null);
                })}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Nome</Label><Input {...financingForm.register('name')} /></div>
                <div className="space-y-2"><Label>Valor da parcela</Label><FormCurrencyInput control={financingForm.control} name="installmentAmount" placeholder="0,00" /></div>
                <div className="space-y-2"><Label>Total de parcelas</Label><Input type="number" {...financingForm.register('totalInstallments')} /></div>
                <div className="space-y-2"><Label>Parcelas já pagas</Label><Input type="number" {...financingForm.register('installmentsPaid')} /></div>
                <div className="space-y-2"><Label>Valor pago no adiantamento</Label><FormCurrencyInput control={financingForm.control} name="earlyPaymentAmount" placeholder="0,00" /></div>
                {methods && (
                  <PaymentMethodSelect
                    methods={methods}
                    value={financingForm.watch('paymentMethodId')}
                    onChange={(v) => financingForm.setValue('paymentMethodId', v)}
                  />
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {financings && (
            <SortableList
              items={financings}
              onReorder={(items) => saveOrder('/financings/reorder', items)}
            >
              {(f, dragHandle) => {
                const monthEntries = [...(f.financingEntries?.filter((e) => e.financialMonthId === selectedMonthId) ?? [])]
                  .sort((a, b) => a.installmentNumber - b.installmentNumber);
                const monthTotal = monthEntries.reduce((sum, e) => sum + Number(e.amount), 0);

                return (
                <Card>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      {dragHandle}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex justify-between gap-4">
                          <p className="font-medium">{f.name}</p>
                          <span className="shrink-0 text-red-500">{formatCurrency(Number(f.installmentAmount))}/mês</span>
                        </div>
                        <Progress value={(f.installmentsPaid / f.totalInstallments) * 100} />
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="text-xs text-slate-500">{f.installmentsPaid}/{f.totalInstallments} parcelas</p>
                            {monthEntries.length > 0 && (
                              <p className="text-xs font-medium text-emerald-600">
                                {monthEntries.length} parcela(s) neste mês — {formatCurrency(monthTotal)}
                              </p>
                            )}
                          </div>
                          {f.active && f.installmentsPaid < f.totalInstallments && selectedMonthId && isMonthOpen && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await api.post(`/financings/${f.id}/pay-ahead`, { installmentsToPay: 1, monthId: selectedMonthId });
                                invalidate();
                              }}
                            >
                              Adiantar 1 parcela
                            </Button>
                          )}
                        </div>
                        {monthEntries.length > 0 && (
                          <div className="space-y-1.5 border-t pt-2">
                            {monthEntries.map((entry) => {
                              const cancellable = isMonthOpen && canCancelFinancingEntry(entry, f.installmentsPaid);
                              return (
                                <div key={entry.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-slate-600">
                                    Parcela {entry.installmentNumber} — {formatCurrency(Number(entry.amount))}
                                    {entry.discountApplied && (
                                      <span className="ml-1 text-emerald-600">(adiantamento)</span>
                                    )}
                                  </span>
                                  {cancellable && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-red-500 hover:text-red-600"
                                      onClick={async () => {
                                        await api.delete(`/financings/${f.id}/entries/${entry.id}`);
                                        invalidate();
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <ItemActions
                        onEdit={() => openEdit('financing', f)}
                        onDelete={async () => {
                          await api.delete(`/financings/${f.id}`);
                          invalidate();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
                );
              }}
            </SortableList>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar despesa</DialogTitle></DialogHeader>

          {editTarget?.type === 'one_off' && (
            <form
              onSubmit={expenseForm.handleSubmit(async (data) => {
                await api.patch(`/months/${selectedMonthId}/expenses/${editTarget.id}`, {
                  ...data,
                  paymentMethodId: data.paymentMethodId || defaultMethod,
                });
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...expenseForm.register('name')} /></div>
              <div className="space-y-2"><Label>Valor</Label><FormCurrencyInput control={expenseForm.control} name="amount" placeholder="0,00" /></div>
              {methods && (
                <PaymentMethodSelect
                  methods={methods}
                  value={expenseForm.watch('paymentMethodId') || defaultMethod}
                  onChange={(v) => expenseForm.setValue('paymentMethodId', v)}
                />
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'fixed' && (
            <form
              onSubmit={fixedTemplateForm.handleSubmit(async (data) => {
                await api.patch(`/fixed-expense-templates/${editTarget.id}`, {
                  ...data,
                  paymentMethodId: data.paymentMethodId || defaultMethod,
                });
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...fixedTemplateForm.register('name')} /></div>
              <div className="space-y-2"><Label>Valor padrão (R$)</Label><FormCurrencyInput control={fixedTemplateForm.control} name="defaultAmount" placeholder="0,00" /></div>
              {methods && (
                <PaymentMethodSelect
                  methods={methods}
                  value={fixedTemplateForm.watch('paymentMethodId') || defaultMethod}
                  onChange={(v) => fixedTemplateForm.setValue('paymentMethodId', v)}
                />
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'installment' && (
            <form
              onSubmit={installmentForm.handleSubmit(async (data) => {
                await api.patch(`/installment-plans/${editTarget.id}`, data);
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...installmentForm.register('name')} /></div>
              <div className="space-y-2"><Label>Total de parcelas</Label><Input type="number" {...installmentForm.register('totalInstallments')} /></div>
              <div className="space-y-2"><Label>Valor da parcela</Label><FormCurrencyInput control={installmentForm.control} name="installmentAmount" placeholder="0,00" /></div>
              <div className="space-y-2"><Label>Parcelas já pagas</Label><Input type="number" {...installmentForm.register('installmentsPaid')} /></div>
              {methods && (
                <PaymentMethodSelect
                  methods={methods.filter((m) => m.type === 'credit')}
                  value={installmentForm.watch('paymentMethodId')}
                  onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
                />
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'subscription' && (
            <form
              onSubmit={subscriptionForm.handleSubmit(async (data) => {
                await api.patch(`/subscriptions/${editTarget.id}`, data);
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...subscriptionForm.register('name')} /></div>
              <div className="space-y-2"><Label>Valor mensal</Label><FormCurrencyInput control={subscriptionForm.control} name="amount" placeholder="0,00" /></div>
              {methods && (
                <PaymentMethodSelect
                  methods={methods}
                  value={subscriptionForm.watch('paymentMethodId')}
                  onChange={(v) => subscriptionForm.setValue('paymentMethodId', v)}
                />
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'financing' && (
            <form
              onSubmit={financingForm.handleSubmit(async (data) => {
                await api.patch(`/financings/${editTarget.id}`, data);
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...financingForm.register('name')} /></div>
              <div className="space-y-2"><Label>Valor da parcela</Label><FormCurrencyInput control={financingForm.control} name="installmentAmount" placeholder="0,00" /></div>
              <div className="space-y-2"><Label>Total de parcelas</Label><Input type="number" {...financingForm.register('totalInstallments')} /></div>
              <div className="space-y-2"><Label>Parcelas já pagas</Label><Input type="number" {...financingForm.register('installmentsPaid')} /></div>
              <div className="space-y-2"><Label>Valor pago no adiantamento</Label><FormCurrencyInput control={financingForm.control} name="earlyPaymentAmount" placeholder="0,00" /></div>
              {methods && (
                <PaymentMethodSelect
                  methods={methods}
                  value={financingForm.watch('paymentMethodId')}
                  onChange={(v) => financingForm.setValue('paymentMethodId', v)}
                />
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
