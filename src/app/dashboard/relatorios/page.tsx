'use client';

import { useMonthStore } from '@/hooks/use-month';
import { useMonthReport } from '@/hooks/use-month-summary';
import { formatMonth } from '@/lib/utils';
import { ReportOverview } from '@/components/reports/report-overview';
import { ReportAlerts } from '@/components/reports/report-alerts';
import { ReportIncomeExpenseChart } from '@/components/reports/report-income-expense-chart';
import { ReportIncomeByItemChart } from '@/components/reports/report-income-by-item-chart';
import { ReportInvestment } from '@/components/reports/report-investment';
import { ReportMonthlyTrendChart } from '@/components/reports/report-monthly-trend-chart';
import { useBusinessEnabled, useBusinessView, useScopeFilter, useScopeLabel } from '@/hooks/use-finance-scope';
import { AccountantNotice } from '@/components/legal/regulatory-notice';

export default function RelatoriosPage() {
  const { selectedMonthId } = useMonthStore();
  const [scope] = useScopeFilter();
  const scopeLabel = useScopeLabel();
  const business = useBusinessView();
  const businessEnabled = useBusinessEnabled();
  const { data: report, isLoading } = useMonthReport(selectedMonthId, scope);

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#03b6e6] border-t-transparent" />
      </div>
    );
  }

  if (!report) return null;

  const hasData =
    report.overview.totalIncome > 0 ||
    report.overview.totalExpenses > 0 ||
    report.overview.totalDonations > 0 ||
    report.investment.totalInvested > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {business ? 'Painel gerencial do dono' : 'Relatórios'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {business ? 'Visão gerencial de ' : 'Análise detalhada de '}
            {formatMonth(report.month.year, report.month.month)}
            {scopeLabel ? ` · ${scopeLabel}` : ''}
          </p>
        </div>
      </div>

      {(business || (businessEnabled && scope === 'all')) && <AccountantNotice />}

      {!hasData && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-white/[0.08] dark:bg-white/[0.03]">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Este mês ainda não tem lançamentos. Adicione receitas e despesas para ver os relatórios.
          </p>
        </div>
      )}

      <ReportOverview
        overview={report.overview}
        investment={report.investment}
        creditCardBill={report.creditCardBill}
        expenseByType={report.expenseByType}
        expenses={report.items.expenses}
        paymentMethods={report.paymentMethods}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ReportIncomeExpenseChart
            totalIncome={report.overview.totalIncome}
            totalExpenses={report.overview.totalExpenses}
            totalDonations={report.overview.totalDonations}
            totalInvested={report.investment.totalInvested}
          />
          <ReportIncomeByItemChart incomes={report.items.incomes} />
        </div>
      </ReportOverview>

      {report.alerts.length > 0 && <ReportAlerts alerts={report.alerts} />}

      <div className="grid gap-6 md:grid-cols-2">
        <ReportInvestment investment={report.investment} items={report.items.investments} />
        <ReportMonthlyTrendChart monthlyTrend={report.monthlyTrend} />
      </div>
    </div>
  );
}
