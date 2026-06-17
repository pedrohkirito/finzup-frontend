'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useMonthStore, useMonths } from '@/hooks/use-month';
import { useReorder } from '@/hooks/use-reorder';
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
import { CreditPaymentToggle } from '@/components/despesas/credit-payment-toggle';
import { ItemActions } from '@/components/despesas/item-actions';
import { SortableList } from '@/components/despesas/sortable-list';
import { formatCurrency, cn } from '@/lib/utils';
import type {
  ExpenseEntry,
  FixedExpenseTemplate,
  InstallmentPlan,
  Subscription,
  Financing,
  FinancingEntry,
  PaymentMethod,
  BudgetTemplate,
  MonthSummary,
} from '@/types';
import { Plus, RefreshCw, TrendingDown } from 'lucide-react';
import Link from 'next/link';

function getExpenseAmountColor(isCredit: boolean, isPaid: boolean) {
  return isCredit && !isPaid ? 'text-violet-600' : 'text-orange-600 dark:text-orange-400';
}

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
});

const installmentSchema = z
  .object({
    name: z.string().min(1),
    totalInstallments: z.coerce.number().int().min(1),
    installmentAmount: z.coerce.number().positive().optional(),
    totalAmount: z.coerce.number().positive().optional(),
    installmentsPaid: z.coerce.number().int().min(0).default(0),
    paymentMethodId: z.string().uuid(),
    budgetTemplateId: z.string().uuid().optional().nullable(),
  })
  .refine((d) => d.installmentsPaid <= d.totalInstallments, {
    message: 'Parcelas pagas não pode ser maior que o total',
  });

const fixedTemplateSchema = z.object({
  name: z.string().min(1),
  defaultAmount: z.coerce.number().nonnegative(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
});

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().uuid(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
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

function BudgetSelect({
  budgets,
  value,
  onChange,
}: {
  budgets: BudgetTemplate[];
  value?: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <Select
      value={value ?? 'none'}
      onValueChange={(v) => onChange(v === 'none' ? null : v)}
    >
      <SelectTrigger><SelectValue placeholder="Orçamento (opcional)" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum</SelectItem>
        {budgets.map((b) => (
          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CreditPaymentMethodNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <p>
        Parcelamentos no cartão exigem um método de pagamento do tipo crédito.{' '}
        <Link href="/dashboard/configuracoes" className="font-medium underline underline-offset-2">
          Cadastre um cartão de crédito em Configurações
        </Link>{' '}
        para continuar.
      </p>
    </div>
  );
}

export default function DespesasPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const queryClient = useQueryClient();
  const reorder = useReorder();
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

  const { data: fixedEntries } = useQuery({
    queryKey: ['expenses', selectedMonthId, 'fixed'],
    queryFn: () => api.get<ExpenseEntry[]>(`/months/${selectedMonthId}/expenses?type=fixed`),
    enabled: !!selectedMonthId,
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

  const { data: budgetTemplates } = useQuery({
    queryKey: ['budget-templates'],
    queryFn: () => api.get<BudgetTemplate[]>('/budget-templates'),
  });

  const { data: summary } = useQuery({
    queryKey: ['months', selectedMonthId, 'summary'],
    queryFn: () => api.get<MonthSummary>(`/months/${selectedMonthId}/summary`),
    enabled: !!selectedMonthId,
  });

  const expenseForm = useForm({ resolver: zodResolver(expenseSchema) });
  const fixedTemplateForm = useForm({ resolver: zodResolver(fixedTemplateSchema) });
  const installmentForm = useForm({ resolver: zodResolver(installmentSchema), defaultValues: { installmentsPaid: 0 } });
  const subscriptionForm = useForm({ resolver: zodResolver(subscriptionSchema) });
  const financingForm = useForm({ resolver: zodResolver(financingSchema), defaultValues: { installmentsPaid: 0, earlyPaymentAmount: 0 } });

  const defaultMethod = methods?.find((m) => m.isDefault)?.id;
  const creditMethods = methods?.filter((m) => m.type === 'credit') ?? [];
  const hasCreditMethods = creditMethods.length > 0;

  const openEdit = (type: EditType, item: ExpenseEntry | FixedExpenseTemplate | InstallmentPlan | Subscription | Financing) => {
    if (type === 'one_off') {
      const e = item as ExpenseEntry;
      expenseForm.reset({
        name: e.name,
        amount: Number(e.amount),
        paymentMethodId: e.paymentMethodId ?? defaultMethod,
        budgetTemplateId: e.budgetTemplateId ?? null,
      });
    } else if (type === 'fixed') {
      const t = item as FixedExpenseTemplate;
      fixedTemplateForm.reset({
        name: t.name,
        defaultAmount: Number(t.defaultAmount),
        paymentMethodId: t.paymentMethodId ?? defaultMethod,
        budgetTemplateId: t.budgetTemplateId ?? null,
      });
    } else if (type === 'installment') {
      const p = item as InstallmentPlan;
      installmentForm.reset({
        name: p.name,
        totalInstallments: p.totalInstallments,
        installmentAmount: Number(p.installmentAmount),
        installmentsPaid: p.installmentsPaid,
        paymentMethodId: p.paymentMethod.id,
        budgetTemplateId: p.budgetTemplateId ?? null,
      });
    } else if (type === 'subscription') {
      const s = item as Subscription;
      subscriptionForm.reset({
        name: s.name,
        amount: Number(s.amount),
        paymentMethodId: s.paymentMethod.id,
        budgetTemplateId: s.budgetTemplateId ?? null,
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
        <h1 className="text-xl font-bold sm:text-2xl">Despesas</h1>
        <p className="text-sm text-slate-500">Avulsas, fixas, parceladas, assinaturas e financiamentos</p>
      </div>

      <Card className="border-orange-100 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
              Total de despesas do mês
            </p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {formatCurrency(summary?.totalExpenses ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="avulsas">
        <TabsList>
          <TabsTrigger value="avulsas">Avulsas</TabsTrigger>
          <TabsTrigger value="fixas">Fixas</TabsTrigger>
          <TabsTrigger value="parceladas">Parceladas</TabsTrigger>
          <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
          <TabsTrigger value="financiamentos">Financiamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="avulsas" className="space-y-4">
          {isMonthOpen && (
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
                    budgetTemplateId: data.budgetTemplateId ?? null,
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
                {budgetTemplates && budgetTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Orçamento</Label>
                    <BudgetSelect
                      budgets={budgetTemplates}
                      value={expenseForm.watch('budgetTemplateId')}
                      onChange={(v) => expenseForm.setValue('budgetTemplateId', v)}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
          )}

          {oneOff && (
            <SortableList
              items={oneOff}
              sortable={!!isMonthOpen}
              onReorder={(items) =>
                reorder(['expenses', selectedMonthId, 'one_off'], `/months/${selectedMonthId}/expenses/reorder`, items)
              }
            >
              {(e, dragHandle) => {
                const isCredit = e.paymentMethod?.type === 'credit';
                const isPaid = !!e.paidAt;

                const setPaid = async (paid: boolean) => {
                  if (paid === isPaid) return;
                  await api.patch(`/months/${selectedMonthId}/expenses/${e.id}/paid`, { paid });
                  invalidate();
                };

                return (
                  <Card className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {dragHandle}
                        <div className="h-8 w-1 shrink-0 rounded-full bg-orange-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{e.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{e.paymentMethod?.name}</span>
                            {e.budgetTemplate && (
                              <Badge variant="secondary">{e.budgetTemplate.name}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        {isCredit && (
                          <CreditPaymentToggle
                            isPaid={isPaid}
                            isMonthOpen={!!isMonthOpen}
                            onChange={setPaid}
                          />
                        )}
                        <div className="ml-auto flex items-center gap-2 sm:ml-0">
                          <span className={cn('font-semibold', getExpenseAmountColor(isCredit, isPaid))}>
                            {formatCurrency(Number(e.amount))}
                          </span>
                          <ItemActions
                            readOnly={!isMonthOpen}
                            onEdit={() => openEdit('one_off', e)}
                            onDelete={async () => {
                              await api.delete(`/months/${selectedMonthId}/expenses/${e.id}`);
                              invalidate();
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="fixas" className="space-y-4">
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
                      budgetTemplateId: data.budgetTemplateId ?? null,
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
                  {budgetTemplates && budgetTemplates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Orçamento</Label>
                      <BudgetSelect
                        budgets={budgetTemplates}
                        value={fixedTemplateForm.watch('budgetTemplateId')}
                        onChange={(v) => fixedTemplateForm.setValue('budgetTemplateId', v)}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          {fixed && (
            <SortableList
              items={fixed}
              onReorder={(items) => reorder(['fixed-templates'], '/fixed-expense-templates/reorder', items)}
            >
              {(t, dragHandle) => {
                const monthEntry = fixedEntries?.find((e) => e.templateId === t.id);
                const isCredit = (monthEntry?.paymentMethod ?? t.paymentMethod)?.type === 'credit';
                const isPaid = !!monthEntry?.paidAt;

                const setPaid = async (paid: boolean) => {
                  if (!monthEntry || !selectedMonthId || paid === isPaid) return;
                  await api.patch(`/months/${selectedMonthId}/expenses/${monthEntry.id}/paid`, { paid });
                  invalidate();
                };

                return (
                  <Card className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {dragHandle}
                        <div className="h-8 w-1 shrink-0 rounded-full bg-orange-500" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-slate-900 dark:text-white">{t.name}</p>
                            {t.isSystemSeeded && <Badge variant="secondary">Sugerida</Badge>}
                            {t.budgetTemplate && <Badge variant="secondary">{t.budgetTemplate.name}</Badge>}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <RefreshCw className="h-3 w-3" />
                            Repete todo mês
                          </div>
                          <p className="text-xs text-slate-500">{t.paymentMethod?.name ?? monthEntry?.paymentMethod?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        {monthEntry && isCredit && (
                          <CreditPaymentToggle
                            isPaid={isPaid}
                            isMonthOpen={!!isMonthOpen}
                            onChange={setPaid}
                          />
                        )}
                        <div className="ml-auto flex items-center gap-2 sm:ml-0">
                        <span
                          className={cn(
                            'font-semibold',
                            getExpenseAmountColor(!!monthEntry && isCredit, isPaid),
                          )}
                        >
                          {formatCurrency(Number(monthEntry?.amount ?? t.defaultAmount))}
                        </span>
                        <ItemActions
                          onEdit={() => openEdit('fixed', t)}
                          onDelete={async () => {
                            await api.delete(`/fixed-expense-templates/${t.id}`);
                            invalidate();
                          }}
                        />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="parceladas" className="space-y-4">
          {isMonthOpen && (
          <Dialog open={dialog === 'installment'} onOpenChange={(o) => setDialog(o ? 'installment' : null)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Novo parcelamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Parcelamento no cartão</DialogTitle></DialogHeader>
              <form
                onSubmit={installmentForm.handleSubmit(async (data) => {
                  await api.post('/installment-plans', {
                    ...data,
                    startMonthId: selectedMonthId,
                    budgetTemplateId: data.budgetTemplateId ?? null,
                  });
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
                {!hasCreditMethods ? (
                  <CreditPaymentMethodNotice />
                ) : (
                  <PaymentMethodSelect
                    methods={creditMethods}
                    value={installmentForm.watch('paymentMethodId')}
                    onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
                  />
                )}
                {budgetTemplates && budgetTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Orçamento</Label>
                    <BudgetSelect
                      budgets={budgetTemplates}
                      value={installmentForm.watch('budgetTemplateId')}
                      onChange={(v) => installmentForm.setValue('budgetTemplateId', v)}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={!hasCreditMethods}>Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
          )}

          {installments && (
            <SortableList
              items={installments}
              onReorder={(items) => reorder(['installments'], '/installment-plans/reorder', items)}
            >
              {(p, dragHandle) => {
                const monthEntry = p.installmentEntries?.find((e) => e.financialMonthId === selectedMonthId);
                const isCredit = p.paymentMethod?.type === 'credit';
                const isPaid = !!monthEntry?.paidAt;

                const setPaid = async (paid: boolean) => {
                  if (!monthEntry || paid === isPaid) return;
                  await api.patch(`/installment-plans/entries/${monthEntry.id}/paid`, { paid });
                  invalidate();
                };

                return (
                  <Card className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start gap-3">
                        {dragHandle}
                        <div className="h-8 w-1 shrink-0 rounded-full bg-orange-500" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-slate-900 dark:text-white">{p.name}</p>
                              {p.budgetTemplate && <Badge variant="secondary">{p.budgetTemplate.name}</Badge>}
                            </div>
                            <span
                              className={cn(
                                'shrink-0 font-semibold',
                                getExpenseAmountColor(!!monthEntry && isCredit, isPaid),
                              )}
                            >
                              {formatCurrency(Number(monthEntry?.amount ?? p.installmentAmount))}
                              {monthEntry ? '' : '/mês'}
                            </span>
                          </div>
                          <Progress value={(p.installmentsPaid / p.totalInstallments) * 100} />
                          <p className="text-xs text-slate-500">
                            {monthEntry
                              ? `Parcela ${monthEntry.installmentNumber} deste mês`
                              : `${p.installmentsPaid}/${p.totalInstallments} parcelas pagas`}
                          </p>
                        </div>
                        {monthEntry && isCredit && (
                          <CreditPaymentToggle
                            isPaid={isPaid}
                            isMonthOpen={!!isMonthOpen}
                            onChange={setPaid}
                          />
                        )}
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
                );
              }}
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
                  await api.post('/subscriptions', {
                    ...data,
                    budgetTemplateId: data.budgetTemplateId ?? null,
                  });
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
                {budgetTemplates && budgetTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Orçamento</Label>
                    <BudgetSelect
                      budgets={budgetTemplates}
                      value={subscriptionForm.watch('budgetTemplateId')}
                      onChange={(v) => subscriptionForm.setValue('budgetTemplateId', v)}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {subscriptions && (
            <SortableList
              items={subscriptions}
              onReorder={(items) => reorder(['subscriptions'], '/subscriptions/reorder', items)}
            >
              {(s, dragHandle) => {
                const monthEntry = s.subscriptionEntries?.find((e) => e.financialMonthId === selectedMonthId);
                const isCredit = s.paymentMethod?.type === 'credit';
                const isPaid = !!monthEntry?.paidAt;

                const setPaid = async (paid: boolean) => {
                  if (!monthEntry || paid === isPaid) return;
                  await api.patch(`/subscriptions/entries/${monthEntry.id}/paid`, { paid });
                  invalidate();
                };

                return (
                  <Card className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {dragHandle}
                        <div className="h-8 w-1 shrink-0 rounded-full bg-orange-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{s.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{s.paymentMethod.name} · Mensal</span>
                            {s.budgetTemplate && <Badge variant="secondary">{s.budgetTemplate.name}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        {monthEntry && isCredit && (
                          <CreditPaymentToggle
                            isPaid={isPaid}
                            isMonthOpen={!!isMonthOpen}
                            onChange={setPaid}
                          />
                        )}
                        <div className="ml-auto flex items-center gap-2 sm:ml-0">
                        <span
                          className={cn(
                            'font-semibold',
                            getExpenseAmountColor(!!monthEntry && isCredit, isPaid),
                          )}
                        >
                          {formatCurrency(Number(monthEntry?.amount ?? s.amount))}
                        </span>
                        <ItemActions
                          onEdit={() => openEdit('subscription', s)}
                          onDelete={async () => {
                            await api.delete(`/subscriptions/${s.id}`);
                            invalidate();
                          }}
                        />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }}
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
              onReorder={(items) => reorder(['financings'], '/financings/reorder', items)}
            >
              {(f, dragHandle) => {
                const monthEntries = [...(f.financingEntries?.filter((e) => e.financialMonthId === selectedMonthId) ?? [])]
                  .sort((a, b) => a.installmentNumber - b.installmentNumber);
                const monthTotal = monthEntries.reduce((sum, e) => sum + Number(e.amount), 0);

                return (
                <Card className="border-slate-200 transition-shadow hover:shadow-sm dark:border-slate-800">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      {dragHandle}
                      <div className="h-8 w-1 shrink-0 rounded-full bg-orange-500" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex justify-between gap-4">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{f.name}</p>
                          <span className="shrink-0 font-semibold text-orange-600 dark:text-orange-400">
                            {formatCurrency(Number(f.installmentAmount))}/mês
                          </span>
                        </div>
                        <Progress value={(f.installmentsPaid / f.totalInstallments) * 100} />
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                              className="w-full sm:w-auto"
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
                  budgetTemplateId: data.budgetTemplateId ?? null,
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
              {budgetTemplates && budgetTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <BudgetSelect
                    budgets={budgetTemplates}
                    value={expenseForm.watch('budgetTemplateId')}
                    onChange={(v) => expenseForm.setValue('budgetTemplateId', v)}
                  />
                </div>
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
                  budgetTemplateId: data.budgetTemplateId ?? null,
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
              {budgetTemplates && budgetTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <BudgetSelect
                    budgets={budgetTemplates}
                    value={fixedTemplateForm.watch('budgetTemplateId')}
                    onChange={(v) => fixedTemplateForm.setValue('budgetTemplateId', v)}
                  />
                </div>
              )}
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'installment' && (
            <form
              onSubmit={installmentForm.handleSubmit(async (data) => {
                await api.patch(`/installment-plans/${editTarget.id}`, {
                  ...data,
                  budgetTemplateId: data.budgetTemplateId ?? null,
                });
                invalidate();
                setEditTarget(null);
              })}
              className="space-y-4"
            >
              <div className="space-y-2"><Label>Nome</Label><Input {...installmentForm.register('name')} /></div>
              <div className="space-y-2"><Label>Total de parcelas</Label><Input type="number" {...installmentForm.register('totalInstallments')} /></div>
              <div className="space-y-2"><Label>Valor da parcela</Label><FormCurrencyInput control={installmentForm.control} name="installmentAmount" placeholder="0,00" /></div>
              <div className="space-y-2"><Label>Parcelas já pagas</Label><Input type="number" {...installmentForm.register('installmentsPaid')} /></div>
              {!hasCreditMethods ? (
                <CreditPaymentMethodNotice />
              ) : (
                <PaymentMethodSelect
                  methods={creditMethods}
                  value={installmentForm.watch('paymentMethodId')}
                  onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
                />
              )}
              {budgetTemplates && budgetTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <BudgetSelect
                    budgets={budgetTemplates}
                    value={installmentForm.watch('budgetTemplateId')}
                    onChange={(v) => installmentForm.setValue('budgetTemplateId', v)}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!hasCreditMethods}>Salvar alterações</Button>
            </form>
          )}

          {editTarget?.type === 'subscription' && (
            <form
              onSubmit={subscriptionForm.handleSubmit(async (data) => {
                await api.patch(`/subscriptions/${editTarget.id}`, {
                  ...data,
                  budgetTemplateId: data.budgetTemplateId ?? null,
                });
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
              {budgetTemplates && budgetTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <BudgetSelect
                    budgets={budgetTemplates}
                    value={subscriptionForm.watch('budgetTemplateId')}
                    onChange={(v) => subscriptionForm.setValue('budgetTemplateId', v)}
                  />
                </div>
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
