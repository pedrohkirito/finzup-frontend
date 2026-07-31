'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { formatCurrency, cn } from '@/lib/utils';
import type {
  PlanDonationItem,
  PlanExpenseItem,
  PlanExpenseType,
  PlanIncomeItem,
  PlanInvestmentItem,
  PlanSummary,
} from '@/types';
import {
  EXPENSE_TYPE_CONFIG,
  EXPENSE_TYPE_ORDER,
} from '@/components/planejamento/plan-expense-config';
import { Heart, PiggyBank, Plus, TrendingUp, X } from 'lucide-react';

// ─── utilidades de %, valor ────────────────────────────────────────────────

function pctFromAmount(base: number, amount: number) {
  if (base <= 0) return 0;
  return Math.round((amount / base) * 1000) / 10; // 1 casa decimal
}

function amountFromPct(base: number, pct: number) {
  return Math.round(base * (pct / 100) * 100) / 100;
}

// ─── campo % / valor bidirecional ─────────────────────────────────────────

function InlinePercentValue({
  base,
  amount,
  onSave,
}: {
  base: number;
  amount: number;
  onSave: (v: number) => Promise<void>;
}) {
  const [localAmount, setLocalAmount] = useState(amount);
  const [pct, setPct] = useState(() => pctFromAmount(base, amount));
  const [saving, setSaving] = useState(false);
  const lastSaved = useRef(amount);

  // sincroniza quando o dado externo muda
  const prevAmount = useRef(amount);
  if (prevAmount.current !== amount) {
    prevAmount.current = amount;
    setLocalAmount(amount);
    setPct(pctFromAmount(base, amount));
    lastSaved.current = amount;
  }

  const commit = async (nextAmount: number) => {
    const v = Math.max(0, Math.round(nextAmount * 100) / 100);
    if (v === lastSaved.current) return;
    setSaving(true);
    try {
      await onSave(v);
      lastSaved.current = v;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-1.5', saving && 'opacity-50')}>
      {/* campo % */}
      <div className="relative w-[4.75rem] shrink-0">
        <Input
          type="text"
          inputMode="decimal"
          disabled={base <= 0}
          value={pct === 0 && localAmount === 0 ? '' : String(pct)}
          onChange={(e) => {
            const p = parseFloat(e.target.value.replace(',', '.'));
            const next = Number.isFinite(p) ? Math.max(0, Math.min(200, p)) : 0;
            setPct(next);
            setLocalAmount(amountFromPct(base, next));
          }}
          onBlur={() => commit(localAmount)}
          className="h-10 border-0 bg-transparent px-1 pr-5 text-right text-sm tabular-nums text-slate-500 shadow-none focus:bg-slate-50 focus:shadow-none sm:h-9 dark:text-slate-400 dark:focus:bg-white/[0.06]"
          placeholder="0"
        />
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          %
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-600">|</span>

      {/* campo R$ */}
      <div className="min-w-0 flex-1 sm:w-28 sm:flex-none">
        <CurrencyInput
          value={localAmount}
          onChange={(v) => {
            setLocalAmount(v);
            setPct(pctFromAmount(base, v));
          }}
          onBlur={() => commit(localAmount)}
          placeholder="0,00"
          className="h-10 border-0 bg-transparent text-right text-sm tabular-nums shadow-none focus:bg-slate-50 focus:shadow-none sm:h-9 dark:focus:bg-white/[0.06]"
        />
      </div>
    </div>
  );
}

// ─── linha de item ─────────────────────────────────────────────────────────

function ItemRow({
  dot,
  name,
  subtitle,
  right,
  onDelete,
}: {
  dot?: string;
  name: string;
  subtitle?: string;
  right: React.ReactNode;
  onDelete?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group flex flex-col gap-1.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 sm:min-h-11 sm:flex-row sm:items-center sm:gap-3 sm:py-1.5 dark:hover:bg-white/[0.05]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {dot && <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{name}</p>
          {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              'shrink-0 rounded-md p-1.5 text-slate-300 transition-all hover:text-red-500 sm:hidden dark:text-slate-600 dark:hover:text-red-400',
            )}
            aria-label="Remover"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 pl-5 sm:shrink-0 sm:pl-0">
        <div className="min-w-0 flex-1 sm:flex-none">{right}</div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              'hidden shrink-0 rounded-md p-1.5 text-slate-300 transition-all hover:text-red-500 sm:block dark:text-slate-600 dark:hover:text-red-400',
              hovered ? 'opacity-100' : 'opacity-0',
            )}
            aria-label="Remover"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── linha de adicionar novo item ──────────────────────────────────────────

function AddRow({
  placeholder,
  onAdd,
  showNotes,
}: {
  placeholder: string;
  onAdd: (name: string, amount: number, notes?: string) => Promise<void>;
  showNotes?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd(name.trim(), amount, notes || undefined);
      setName('');
      setAmount(0);
      setNotes('');
      setActive(false);
    } finally {
      setSaving(false);
    }
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => {
          setActive(true);
          setTimeout(() => nameRef.current?.focus(), 50);
        }}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-white/[0.05] dark:hover:text-slate-300 sm:min-h-9"
      >
        <Plus className="h-3.5 w-3.5" />
        {placeholder}
      </button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl bg-slate-50 px-2 py-2 dark:bg-white/[0.04] dark:border dark:border-white/[0.06]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome…"
          className="h-10 flex-1 border-0 bg-white text-sm shadow-sm sm:h-9 dark:bg-white/[0.06]"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <div className="w-full sm:w-32 sm:shrink-0">
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            placeholder="R$ 0,00"
            className="h-10 border-0 bg-white text-right text-sm shadow-sm sm:h-9 dark:bg-white/[0.06]"
          />
        </div>
      </div>
      {showNotes && (
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          className="h-8 border-0 bg-white text-xs shadow-sm dark:bg-white/[0.06]"
        />
      )}
      <div className="flex gap-2 pt-0.5">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || saving}
          className="brand-gradient-bg rounded-lg px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={() => { setActive(false); setName(''); setAmount(0); }}
          className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── cabeçalho de grupo ────────────────────────────────────────────────────

function GroupHeader({
  icon: Icon,
  label,
  total,
  pctOfIncome,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  total: number;
  pctOfIncome: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between pb-1 pt-5">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-xs tabular-nums text-slate-400">
        {pctOfIncome.toFixed(0)}% · {formatCurrency(total)}
      </span>
    </div>
  );
}

// ─── barra de distribuição ─────────────────────────────────────────────────

function DistributionBar({
  totalIncome,
  expenses,
  donations,
  investments,
}: {
  totalIncome: number;
  expenses: PlanExpenseItem[];
  donations: PlanDonationItem[];
  investments: PlanInvestmentItem[];
}) {
  if (totalIncome <= 0) return null;

  const segs = [
    ...EXPENSE_TYPE_ORDER.map((type) => ({
      amount: expenses.filter((e) => e.type === type).reduce((s, e) => s + Number(e.amount), 0),
      color: EXPENSE_TYPE_CONFIG[type].dot,
    })),
    ...donations.map((d) => ({ amount: Number(d.amount), color: 'bg-sky-400' })),
    ...investments.map((inv) => ({ amount: Number(inv.amount), color: 'bg-violet-400' })),
  ].filter((s) => s.amount > 0);

  const allocated = segs.reduce((s, x) => s + x.amount, 0);
  const free = Math.max(0, totalIncome - allocated);
  const over = allocated > totalIncome;

  return (
    <div className="space-y-1.5">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
        {segs.map((seg, i) => (
          <div
            key={i}
            className={cn('h-full transition-all', seg.color)}
            style={{ width: `${Math.min(100, (seg.amount / totalIncome) * 100)}%` }}
          />
        ))}
        {free > 0 && (
          <div className="h-full bg-emerald-100 dark:bg-emerald-500/20" style={{ width: `${(free / totalIncome) * 100}%` }} />
        )}
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{((allocated / totalIncome) * 100).toFixed(0)}% alocado</span>
        <span className={cn(over && 'font-medium text-red-500')}>
          {over
            ? `+${formatCurrency(allocated - totalIncome)} acima da receita`
            : `${formatCurrency(free)} livre`}
        </span>
      </div>
    </div>
  );
}

// ─── componente principal ──────────────────────────────────────────────────

interface PlanEditorProps {
  planId: string;
  summary?: PlanSummary;
  incomes?: PlanIncomeItem[];
  expenses?: PlanExpenseItem[];
  donations?: PlanDonationItem[];
  investments?: PlanInvestmentItem[];
}

export function PlanEditor({
  planId,
  summary,
  incomes,
  expenses,
  donations,
  investments,
}: PlanEditorProps) {
  const queryClient = useQueryClient();

  const totalIncome = summary?.totalIncome ?? incomes?.reduce((s, i) => s + Number(i.amount), 0) ?? 0;
  const balance = summary?.balance ?? 0;
  const balanceOk = balance >= 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['plans', planId] });

  const pct = (n: number) => (totalIncome > 0 ? (n / totalIncome) * 100 : 0);
  const expenseList = expenses ?? [];

  const expensesByType = (type: PlanExpenseType) =>
    expenseList.filter((item) => item.type === type);

  const totalByType = (type: PlanExpenseType) =>
    expensesByType(type).reduce((s, item) => s + Number(item.amount), 0);

  return (
    <div className="space-y-1">
      {/* Receita total + saldo */}
      <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Receita estimada</p>
          <p className="text-2xl font-bold text-emerald-600 sm:text-3xl dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        {summary && (
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Saldo livre</p>
            <p className={cn('text-xl font-bold sm:text-2xl', balanceOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-slate-400">{(summary.savingsRate * 100).toFixed(0)}% da receita</p>
          </div>
        )}
      </div>

      {/* Barra de distribuição */}
      <DistributionBar
        totalIncome={totalIncome}
        expenses={expenseList}
        donations={donations ?? []}
        investments={investments ?? []}
      />

      {/* Alertas */}
      {summary?.alerts.map((a) => (
        <div key={a.type} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border dark:border-amber-500/20">
          {a.message}
        </div>
      ))}

      {/* ── Receitas ────────────────────────────────── */}
      <GroupHeader
        icon={TrendingUp}
        label="Receitas"
        total={totalIncome}
        pctOfIncome={100}
        color="text-emerald-600 dark:text-emerald-400"
      />
      {incomes?.map((item) => (
        <ItemRow
          key={item.id}
          dot="bg-emerald-400"
          name={item.name}
          right={
            <div className="w-full sm:w-32">
              <CurrencyInput
                value={Number(item.amount)}
                onChange={() => {}}
                onBlur={async (e) => {
                  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                  const cents = parseInt(raw || '0', 10);
                  const v = cents / 100;
                  if (v !== Number(item.amount)) {
                    await api.patch(`/plans/${planId}/incomes/${item.id}`, { amount: v });
                    invalidate();
                  }
                }}
                placeholder="0,00"
                className="h-10 border-0 bg-transparent text-right text-sm tabular-nums text-emerald-600 shadow-none focus:bg-slate-50 sm:h-8 dark:text-emerald-400 dark:focus:bg-white/[0.06]"
              />
            </div>
          }
          onDelete={async () => {
            await api.delete(`/plans/${planId}/incomes/${item.id}`);
            invalidate();
          }}
        />
      ))}
      <AddRow
        placeholder="Adicionar receita"
        onAdd={async (name, amount) => {
          await api.post(`/plans/${planId}/incomes`, { name, amount });
          invalidate();
        }}
      />

      {/* ── Despesas por tipo ───────────────────────── */}
      {EXPENSE_TYPE_ORDER.map((type) => {
        const config = EXPENSE_TYPE_CONFIG[type];
        const Icon = config.icon;
        const items = expensesByType(type);
        const total = totalByType(type);

        return (
          <div key={type}>
            <GroupHeader
              icon={Icon}
              label={config.label}
              total={total}
              pctOfIncome={pct(total)}
              color={config.color}
            />
            {items.map((item) => (
              <ItemRow
                key={item.id}
                dot={config.dot}
                name={item.name}
                subtitle={item.notes ?? undefined}
                right={
                  <InlinePercentValue
                    base={totalIncome}
                    amount={Number(item.amount)}
                    onSave={async (v) => {
                      await api.patch(`/plans/${planId}/expenses/${item.id}`, { amount: v });
                      invalidate();
                    }}
                  />
                }
                onDelete={async () => {
                  await api.delete(`/plans/${planId}/expenses/${item.id}`);
                  invalidate();
                }}
              />
            ))}
            <AddRow
              placeholder={`Adicionar ${config.label.toLowerCase()}`}
              onAdd={async (name, amount, notes) => {
                await api.post(`/plans/${planId}/expenses`, { type, name, amount, notes });
                invalidate();
              }}
            />
          </div>
        );
      })}

      {/* ── Doações ─────────────────────────────────── */}
      <GroupHeader
        icon={Heart}
        label="Doações"
        total={donations?.reduce((s, d) => s + Number(d.amount), 0) ?? 0}
        pctOfIncome={pct(donations?.reduce((s, d) => s + Number(d.amount), 0) ?? 0)}
        color="text-sky-500 dark:text-sky-400"
      />
      {donations?.map((item) => (
        <ItemRow
          key={item.id}
          dot="bg-sky-400"
          name={item.name}
          right={
            <InlinePercentValue
              base={totalIncome}
              amount={Number(item.amount)}
              onSave={async (v) => {
                await api.patch(`/plans/${planId}/donations/${item.id}`, { amount: v });
                invalidate();
              }}
            />
          }
          onDelete={async () => {
            await api.delete(`/plans/${planId}/donations/${item.id}`);
            invalidate();
          }}
        />
      ))}
      <AddRow
        placeholder="Adicionar doação"
        onAdd={async (name, amount) => {
          await api.post(`/plans/${planId}/donations`, { name, amount });
          invalidate();
        }}
      />

      {/* ── Investimentos ───────────────────────────── */}
      <GroupHeader
        icon={PiggyBank}
        label="Investimentos"
        total={investments?.reduce((s, i) => s + Number(i.amount), 0) ?? 0}
        pctOfIncome={pct(investments?.reduce((s, i) => s + Number(i.amount), 0) ?? 0)}
        color="text-violet-500 dark:text-violet-400"
      />
      {investments?.map((item) => (
        <ItemRow
          key={item.id}
          dot="bg-violet-400"
          name={item.name}
          subtitle={item.notes ?? undefined}
          right={
            <InlinePercentValue
              base={totalIncome}
              amount={Number(item.amount)}
              onSave={async (v) => {
                await api.patch(`/plans/${planId}/investments/${item.id}`, { amount: v });
                invalidate();
              }}
            />
          }
          onDelete={async () => {
            await api.delete(`/plans/${planId}/investments/${item.id}`);
            invalidate();
          }}
        />
      ))}
      <AddRow
        placeholder="Adicionar caixinha"
        showNotes
        onAdd={async (name, amount, notes) => {
          await api.post(`/plans/${planId}/investments`, { name, amount, notes });
          invalidate();
        }}
      />
    </div>
  );
}
