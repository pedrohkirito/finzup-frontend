'use client';

import { useMonthStore } from '@/hooks/use-month';
import { useMonthReport } from '@/hooks/use-month-summary';
import { formatMonth } from '@/lib/utils';
import { ReportOverview } from '@/components/reports/report-overview';
import { ReportAlerts } from '@/components/reports/report-alerts';
import { ReportIncomeExpenseChart } from '@/components/reports/report-income-expense-chart';
import { ReportIncomeByItemChart } from '@/components/reports/report-income-by-item-chart';
import { ReportExpenseTypeChart } from '@/components/reports/report-expense-type-chart';
import { ReportFixedVsVariableChart } from '@/components/reports/report-fixed-vs-variable-chart';
import { ReportBudgetChart } from '@/components/reports/report-budget-chart';
import { ReportPaymentMethods } from '@/components/reports/report-payment-methods';
import { ReportTopExpenses } from '@/components/reports/report-top-expenses';
import { ReportCreditCard } from '@/components/reports/report-credit-card';
import { ReportInvestment } from '@/components/reports/report-investment';
import { ReportParetoChart } from '@/components/reports/report-pareto-chart';
import { ReportMonthlyTrendChart } from '@/components/reports/report-monthly-trend-chart';

export default function RelatoriosPage() {
  const { selectedMonthId } = useMonthStore();
  const { data: report, isLoading } = useMonthReport(selectedMonthId);

  if (!selectedMonthId || isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Relatórios</h1>
        <p className="mt-1 text-sm text-slate-500">
          Análise detalhada de {formatMonth(report.month.year, report.month.month)}
        </p>
      </div>

      {!hasData && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500">
            Este mês ainda não tem lançamentos. Adicione receitas e despesas para ver os relatórios.
          </p>
        </div>
      )}

      <ReportOverview
        overview={report.overview}
        investment={report.investment}
        creditCardBill={report.creditCardBill}
      />

      {report.alerts.length > 0 && <ReportAlerts alerts={report.alerts} />}

      <ReportMonthlyTrendChart monthlyTrend={report.monthlyTrend} />

      <div className="grid gap-6 md:grid-cols-2">
        <ReportIncomeExpenseChart
          totalIncome={report.overview.totalIncome}
          totalExpenses={report.overview.totalExpenses}
          totalDonations={report.overview.totalDonations}
        />

        <ReportIncomeByItemChart incomes={report.items.incomes} />

        <ReportFixedVsVariableChart fixedVsVariable={report.fixedVsVariable} />

        <ReportExpenseTypeChart expenseByType={report.expenseByType} />

        <ReportCreditCard creditCardBill={report.creditCardBill} />

        <ReportParetoChart paretoExpenses={report.paretoExpenses} className="md:col-span-2" />

        <ReportBudgetChart budgetByCategory={report.budgetByCategory} className="md:col-span-2" />

        <ReportPaymentMethods paymentMethods={report.paymentMethods} />

        <ReportTopExpenses topExpenses={report.topExpenses} />

        <ReportInvestment investment={report.investment} items={report.items.investments} />
      </div>
    </div>
  );
}
