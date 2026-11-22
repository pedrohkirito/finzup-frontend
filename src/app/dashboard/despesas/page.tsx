'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { CreditPaymentToggle } from '@/components/despesas/credit-payment-toggle';
import { ItemActions } from '@/components/despesas/item-actions';
import { ExpenseCardLayout } from '@/components/despesas/expense-card-layout';
import { InstallmentProgress } from '@/components/despesas/installment-progress';
import { SortableList } from '@/components/despesas/sortable-list';
import { PaymentMethodField } from '@/components/payment-methods/payment-method-field';
import { formatCurrency } from '@/lib/utils';
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
import { BabyStepPageHint } from '@/components/baby-steps/baby-step-page-hint';
import { SnowballDebtsCard } from '@/components/baby-steps/snowball-debts-card';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { EntryExtrasFields, entryExtrasFormShape, extrasFormValues } from '@/components/finance/entry-extras-fields';
import { EntryExtrasMeta } from '@/components/finance/entry-extras-meta';

function getExpenseAmountColor(isCredit: boolean, isPaid: boolean) {
  return isCredit && !isPaid
    ? 'text-violet-600 dark:text-violet-400'
    : 'text-orange-600 dark:text-orange-400';
}

function withPaidAt<T extends { id: string; paidAt?: string | null }>(
  items: T[] | undefined,
  id: string,
  paid: boolean,
): T[] | undefined {
  if (!items) return items;
  const paidAt = paid ? new Date().toISOString() : null;
  return items.map((item) => (item.id === id ? { ...item, paidAt } : item));
}

const EXPENSE_TABS = [
  { value: 'avulsas', label: 'Avulsas' },
  { value: 'fixas', label: 'Fixas' },
  { value: 'parceladas', label: 'Parceladas' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'financiamentos', label: 'Financiamentos' },
] as const;

type ExpenseTab = (typeof EXPENSE_TABS)[number]['value'];

function isExpenseTab(value: string | null): value is ExpenseTab {
  return EXPENSE_TABS.some((tab) => tab.value === value);
}

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
  ...entryExtrasFormShape,
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
    ...entryExtrasFormShape,
  })
  .refine((d) => d.installmentsPaid <= d.totalInstallments, {
    message: 'Parcelas pagas não pode ser maior que o total',
  });

const fixedTemplateSchema = z.object({
  name: z.string().min(1),
  defaultAmount: z.coerce.number().nonnegative(),
  paymentMethodId: z.string().optional(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
  ...entryExtrasFormShape,
});

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethodId: z.string().uuid(),
  budgetTemplateId: z.string().uuid().optional().nullable(),
  ...entryExtrasFormShape,
});

const financingSchema = z.object({
  name: z.string().min(1),
  installmentAmount: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1),
  installmentsPaid: z.coerce.number().int().min(0).default(0),
  earlyPaymentAmount: z.coerce.number().min(0).default(0),
  paymentMethodId: z.string().uuid(),
  ...entryExtrasFormShape,
});

type EditType = 'one_off' | 'fixed' | 'installment' | 'subscription' | 'financing';

function canCancelFinancingEntry(entry: FinancingEntry, installmentsPaid: number) {
  return entry.installmentNumber === installmentsPaid || entry.installmentNumber === installmentsPaid + 1;
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

export default function DespesasPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: months } = useMonths();
  const selectedMonth = months?.find((m) => m.id === selectedMonthId);
  const isMonthOpen = selectedMonth?.status === 'open';
  const queryClient = useQueryClient();
  const reorder = useReorder();
  const searchParams = useSearchParams();
  const { data: babySteps } = useBabySteps();
  const tabParam = searchParams.get('tab');
  const initialTab = isExpenseTab(tabParam) ? tabParam : 'avulsas';
  const [expenseTab, setExpenseTab] = useState<ExpenseTab>(initialTab);
  const [dialog, setDialog] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: EditType; id: string } | null>(null);

  useEffect(() => {
    if (isExpenseTab(tabParam)) {
      setExpenseTab(tabParam);
    }
  }, [tabParam]);

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

  const openEdit = (type: EditType, item: ExpenseEntry | FixedExpenseTemplate | InstallmentPlan | Subscription | Financing) => {
    if (type === 'one_off') {
      const e = item as ExpenseEntry;
      expenseForm.reset({
        name: e.name,
        amount: Number(e.amount),
        paymentMethodId: e.paymentMethodId ?? defaultMethod,
        budgetTemplateId: e.budgetTemplateId ?? null,
        ...extrasFormValues(e),
      });
    } else if (type === 'fixed') {
      const t = item as FixedExpenseTemplate;
      fixedTemplateForm.reset({
        name: t.name,
        defaultAmount: Number(t.defaultAmount),
        paymentMethodId: t.paymentMethodId ?? defaultMethod,
        budgetTemplateId: t.budgetTemplateId ?? null,
        ...extrasFormValues(t),
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
        ...extrasFormValues(p),
      });
    } else if (type === 'subscription') {
      const s = item as Subscription;
      subscriptionForm.reset({
        name: s.name,
        amount: Number(s.amount),
        paymentMethodId: s.paymentMethod.id,
        budgetTemplateId: s.budgetTemplateId ?? null,
        ...extrasFormValues(s),
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
        ...extrasFormValues(f),
      });
    }
    setEditTarget({ type, id: item.id });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">Despesas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Avulsas, fixas, parceladas, assinaturas e financiamentos</p>
      </div>

      <BabyStepPageHint pageKey="despesas" />

      {babySteps && (
        <SnowballDebtsCard
          state={babySteps}
          hideWhenEmpty
          manageHref="/dashboard/despesas?tab=parceladas"
        />
      )}

      <Card className="border-orange-100 bg-orange-50 dark:border-orange-400/20 dark:bg-orange-500/[0.08]">
        <CardContent className="flex items-center gap-4 p-5 sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
              Total de despesas do mês
            </p>
            <p className="text-2xl font-bold tabular-nums text-orange-700 sm:text-3xl dark:text-orange-300">
              {formatCurrency(summary?.totalExpenses ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={expenseTab} onValueChange={(value) => isExpenseTab(value) && setExpenseTab(value)}>
        <div className="sm:hidden">
          <Label htmlFor="expense-category" className="sr-only">
            Tipo de despesa
          </Label>
          <Select value={expenseTab} onValueChange={(value) => isExpenseTab(value) && setExpenseTab(value)}>
            <SelectTrigger id="expense-category" className="h-11 w-full">
              <SelectValue placeholder="Tipo de despesa" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden sm:inline-flex">
          {EXPENSE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="avulsas" className="space-y-4 pt-4 sm:pt-5">
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
                <PaymentMethodField
                  methods={methods ?? []}
                  value={expenseForm.watch('paymentMethodId') || defaultMethod}
                  onChange={(v) => expenseForm.setValue('paymentMethodId', v)}
                />
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
                <EntryExtrasFields form={expenseForm} />
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
                  if (paid === isPaid || !selectedMonthId) return;
                  const key = ['expenses', selectedMonthId, 'one_off'] as const;
                  const previous = queryClient.getQueryData<ExpenseEntry[]>(key);
                  queryClient.setQueryData(key, withPaidAt(previous, e.id, paid));
                  try {
                    await api.patch(`/months/${selectedMonthId}/expenses/${e.id}/paid`, { paid });
                    invalidate();
                  } catch (error) {
                    queryClient.setQueryData(key, previous);
                    throw error;
                  }
                };

                return (
                  <ExpenseCardLayout
                    dragHandle={dragHandle}
                    title={e.name}
                    meta={
                      <>
                        <span>{e.paymentMethod?.name}</span>
                        <EntryExtrasMeta entry={e} />
                      </>
                    }
                    badges={e.budgetTemplate ? <Badge variant="secondary">{e.budgetTemplate.name}</Badge> : null}
                    amount={
                      <span className={getExpenseAmountColor(isCredit, isPaid)}>
                        {formatCurrency(Number(e.amount))}
                      </span>
                    }
                    status={
                      isCredit ? (
                        <CreditPaymentToggle
                          isPaid={isPaid}
                          isMonthOpen={!!isMonthOpen}
                          onChange={setPaid}
                        />
                      ) : null
                    }
                    actions={
                      <ItemActions
                        readOnly={!isMonthOpen}
                        itemName={e.name}
                        confirmTitle="Remover despesa"
                        onEdit={() => openEdit('one_off', e)}
                        onDelete={async () => {
                          await api.delete(`/months/${selectedMonthId}/expenses/${e.id}`);
                          invalidate();
                        }}
                      />
                    }
                  />
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="fixas" className="space-y-4 pt-4 sm:pt-5">
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
                    <PaymentMethodField
                      methods={methods ?? []}
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
                  <EntryExtrasFields form={fixedTemplateForm} recurring />
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
                  const key = ['expenses', selectedMonthId, 'fixed'] as const;
                  const previous = queryClient.getQueryData<ExpenseEntry[]>(key);
                  queryClient.setQueryData(key, withPaidAt(previous, monthEntry.id, paid));
                  try {
                    await api.patch(`/months/${selectedMonthId}/expenses/${monthEntry.id}/paid`, { paid });
                    invalidate();
                  } catch (error) {
                    queryClient.setQueryData(key, previous);
                    throw error;
                  }
                };

                return (
                  <ExpenseCardLayout
                    dragHandle={dragHandle}
                    title={t.name}
                    meta={
                      <>
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Repete todo mês
                        </span>
                        <span>·</span>
                        <span>{t.paymentMethod?.name ?? monthEntry?.paymentMethod?.name}</span>
                        <EntryExtrasMeta entry={t} recurring />
                      </>
                    }
                    badges={
                      <>
                        {t.isSystemSeeded && <Badge variant="secondary">Sugerida</Badge>}
                        {t.budgetTemplate && <Badge variant="secondary">{t.budgetTemplate.name}</Badge>}
                      </>
                    }
                    amount={
                      <span className={getExpenseAmountColor(!!monthEntry && isCredit, isPaid)}>
                        {formatCurrency(Number(monthEntry?.amount ?? t.defaultAmount))}
                      </span>
                    }
                    status={
                      monthEntry && isCredit ? (
                        <CreditPaymentToggle
                          isPaid={isPaid}
                          isMonthOpen={!!isMonthOpen}
                          onChange={setPaid}
                        />
                      ) : null
                    }
                    actions={
                      <ItemActions
                        itemName={t.name}
                        confirmTitle="Remover despesa"
                        onEdit={() => openEdit('fixed', t)}
                        onDelete={async () => {
                          await api.delete(`/fixed-expense-templates/${t.id}`);
                          invalidate();
                        }}
                      />
                    }
                  />
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="parceladas" className="space-y-4 pt-4 sm:pt-5">
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
                <PaymentMethodField
                  methods={methods ?? []}
                  typeFilter="credit"
                  defaultType="credit"
                  label="Cartão de crédito"
                  value={installmentForm.watch('paymentMethodId')}
                  onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
                />
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
                <EntryExtrasFields form={installmentForm} recurring />
                <Button type="submit" className="w-full" disabled={!installmentForm.watch('paymentMethodId')}>Salvar</Button>
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
                  const key = ['installments'] as const;
                  const previous = queryClient.getQueryData<InstallmentPlan[]>(key);
                  const paidAt = paid ? new Date().toISOString() : null;
                  queryClient.setQueryData<InstallmentPlan[]>(key, (old) =>
                    old?.map((plan) =>
                      plan.id !== p.id
                        ? plan
                        : {
                            ...plan,
                            installmentEntries: plan.installmentEntries?.map((entry) =>
                              entry.id === monthEntry.id ? { ...entry, paidAt } : entry,
                            ),
                          },
                    ),
                  );
                  try {
                    await api.patch(`/installment-plans/entries/${monthEntry.id}/paid`, { paid });
                    invalidate();
                  } catch (error) {
                    queryClient.setQueryData(key, previous);
                    throw error;
                  }
                };

                return (
                  <ExpenseCardLayout
                    dragHandle={dragHandle}
                    title={p.name}
                    meta={
                      <>
                        <span>{p.paymentMethod?.name}</span>
                        <EntryExtrasMeta entry={p} recurring />
                      </>
                    }
                    badges={p.budgetTemplate ? <Badge variant="secondary">{p.budgetTemplate.name}</Badge> : null}
                    amount={
                      <span className={getExpenseAmountColor(!!monthEntry && isCredit, isPaid)}>
                        {formatCurrency(Number(monthEntry?.amount ?? p.installmentAmount))}
                        {!monthEntry && (
                          <span className="ml-0.5 text-xs font-medium text-slate-400">/mês</span>
                        )}
                      </span>
                    }
                    status={
                      monthEntry && isCredit ? (
                        <CreditPaymentToggle
                          isPaid={isPaid}
                          isMonthOpen={!!isMonthOpen}
                          onChange={setPaid}
                        />
                      ) : null
                    }
                    actions={
                      <ItemActions
                        itemName={p.name}
                        confirmTitle="Remover despesa"
                        onEdit={() => openEdit('installment', p)}
                        onDelete={async () => {
                          await api.delete(`/installment-plans/${p.id}`);
                          invalidate();
                        }}
                      />
                    }
                  >
                    <InstallmentProgress plan={p} monthId={selectedMonthId} />
                  </ExpenseCardLayout>
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="assinaturas" className="space-y-4 pt-4 sm:pt-5">
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
                <PaymentMethodField
                  methods={methods ?? []}
                  value={subscriptionForm.watch('paymentMethodId')}
                  onChange={(v) => subscriptionForm.setValue('paymentMethodId', v)}
                />
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
                <EntryExtrasFields form={subscriptionForm} recurring />
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
                  const key = ['subscriptions'] as const;
                  const previous = queryClient.getQueryData<Subscription[]>(key);
                  const paidAt = paid ? new Date().toISOString() : null;
                  queryClient.setQueryData<Subscription[]>(key, (old) =>
                    old?.map((sub) =>
                      sub.id !== s.id
                        ? sub
                        : {
                            ...sub,
                            subscriptionEntries: sub.subscriptionEntries?.map((entry) =>
                              entry.id === monthEntry.id ? { ...entry, paidAt } : entry,
                            ),
                          },
                    ),
                  );
                  try {
                    await api.patch(`/subscriptions/entries/${monthEntry.id}/paid`, { paid });
                    invalidate();
                  } catch (error) {
                    queryClient.setQueryData(key, previous);
                    throw error;
                  }
                };

                return (
                  <ExpenseCardLayout
                    dragHandle={dragHandle}
                    title={s.name}
                    meta={
                      <>
                        <span>{s.paymentMethod.name} · Mensal</span>
                        <EntryExtrasMeta entry={s} recurring />
                      </>
                    }
                    badges={s.budgetTemplate ? <Badge variant="secondary">{s.budgetTemplate.name}</Badge> : null}
                    amount={
                      <span className={getExpenseAmountColor(!!monthEntry && isCredit, isPaid)}>
                        {formatCurrency(Number(monthEntry?.amount ?? s.amount))}
                      </span>
                    }
                    status={
                      monthEntry && isCredit ? (
                        <CreditPaymentToggle
                          isPaid={isPaid}
                          isMonthOpen={!!isMonthOpen}
                          onChange={setPaid}
                        />
                      ) : null
                    }
                    actions={
                      <ItemActions
                        itemName={s.name}
                        confirmTitle="Remover despesa"
                        onEdit={() => openEdit('subscription', s)}
                        onDelete={async () => {
                          await api.delete(`/subscriptions/${s.id}`);
                          invalidate();
                        }}
                      />
                    }
                  />
                );
              }}
            </SortableList>
          )}
        </TabsContent>

        <TabsContent value="financiamentos" className="space-y-4 pt-4 sm:pt-5">
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
                <PaymentMethodField
                  methods={methods ?? []}
                  value={financingForm.watch('paymentMethodId')}
                  onChange={(v) => financingForm.setValue('paymentMethodId', v)}
                />
                <EntryExtrasFields form={financingForm} recurring />
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
                <ExpenseCardLayout
                  dragHandle={dragHandle}
                  title={f.name}
                  meta={
                    <>
                      <span>{f.paymentMethod?.name}</span>
                      <EntryExtrasMeta entry={f} recurring />
                    </>
                  }
                  amount={
                    <span className="text-orange-600 dark:text-orange-400">
                      {formatCurrency(Number(f.installmentAmount))}
                      <span className="ml-0.5 text-xs font-medium text-slate-400">/mês</span>
                    </span>
                  }
                  progress={{
                    value: (f.installmentsPaid / f.totalInstallments) * 100,
                    className: '[&>div]:bg-orange-500',
                    label: (
                      <div className="space-y-0.5">
                        <p>{f.installmentsPaid}/{f.totalInstallments} parcelas</p>
                        {monthEntries.length > 0 && (
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">
                            {monthEntries.length} parcela(s) neste mês — {formatCurrency(monthTotal)}
                          </p>
                        )}
                      </div>
                    ),
                  }}
                  actions={
                    <ItemActions
                      itemName={f.name}
                      confirmTitle="Remover despesa"
                      onEdit={() => openEdit('financing', f)}
                      onDelete={async () => {
                        await api.delete(`/financings/${f.id}`);
                        invalidate();
                      }}
                    />
                  }
                >
                  {f.active && f.installmentsPaid < f.totalInstallments && selectedMonthId && isMonthOpen && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 w-full sm:h-9 sm:w-auto"
                      onClick={async () => {
                        await api.post(`/financings/${f.id}/pay-ahead`, { installmentsToPay: 1, monthId: selectedMonthId });
                        invalidate();
                      }}
                    >
                      Adiantar 1 parcela
                    </Button>
                  )}
                  {monthEntries.length > 0 && (
                    <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                      {monthEntries.map((entry) => {
                        const cancellable = isMonthOpen && canCancelFinancingEntry(entry, f.installmentsPaid);
                        return (
                          <div key={entry.id} className="flex min-h-9 items-center justify-between gap-2 text-xs">
                            <span className="min-w-0 truncate text-slate-600 dark:text-slate-400">
                              Parcela {entry.installmentNumber} — {formatCurrency(Number(entry.amount))}
                              {entry.discountApplied && (
                                <span className="ml-1 text-emerald-600 dark:text-emerald-400">(adiantamento)</span>
                              )}
                            </span>
                            {cancellable && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 shrink-0 px-3 text-red-500 hover:text-red-600 sm:h-7 sm:px-2 dark:hover:bg-white/[0.06]"
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
                </ExpenseCardLayout>
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
              <PaymentMethodField
                methods={methods ?? []}
                value={expenseForm.watch('paymentMethodId') || defaultMethod}
                onChange={(v) => expenseForm.setValue('paymentMethodId', v)}
              />
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
              <EntryExtrasFields form={expenseForm} />
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
              <PaymentMethodField
                methods={methods ?? []}
                value={fixedTemplateForm.watch('paymentMethodId') || defaultMethod}
                onChange={(v) => fixedTemplateForm.setValue('paymentMethodId', v)}
              />
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
              <EntryExtrasFields form={fixedTemplateForm} recurring />
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
              <PaymentMethodField
                methods={methods ?? []}
                typeFilter="credit"
                defaultType="credit"
                label="Cartão de crédito"
                value={installmentForm.watch('paymentMethodId')}
                onChange={(v) => installmentForm.setValue('paymentMethodId', v)}
              />
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
              <EntryExtrasFields form={installmentForm} recurring />
              <Button type="submit" className="w-full" disabled={!installmentForm.watch('paymentMethodId')}>Salvar alterações</Button>
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
              <PaymentMethodField
                methods={methods ?? []}
                value={subscriptionForm.watch('paymentMethodId')}
                onChange={(v) => subscriptionForm.setValue('paymentMethodId', v)}
              />
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
              <EntryExtrasFields form={subscriptionForm} recurring />
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
              <PaymentMethodField
                methods={methods ?? []}
                value={financingForm.watch('paymentMethodId')}
                onChange={(v) => financingForm.setValue('paymentMethodId', v)}
              />
              <EntryExtrasFields form={financingForm} recurring />
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
