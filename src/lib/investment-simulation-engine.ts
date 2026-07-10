export const SIMULATION_MAX_YEARS = 30;
export const SIMULATION_MAX_MONTHS = SIMULATION_MAX_YEARS * 12;

export type SimulationInput = {
  initialAmount: number;
  monthlyContribution: number;
  annualYieldPercent: number;
  annualContributionIncreasePercent: number;
  annualAdditionalContribution?: number;
  goalAmount?: number | null;
  maxYears?: number;
};

export type YearProjection = {
  year: number;
  balance: number;
  totalContributed: number;
  interestEarned: number;
  monthlyContribution: number;
  monthlyInterest: number;
};

export type MonthProjection = {
  month: number;
  balance: number;
  monthlyInterest: number;
};

export type SimulationProjection = {
  yearly: YearProjection[];
  monthly: MonthProjection[];
  monthsToGoal: number | null;
  goalReachedLabel: string | null;
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
};

export function formatChartMonthLabel(month: number): string {
  if (month === 0) return 'Início';
  if (month < 12) return `Mês ${month}`;
  const years = Math.floor(month / 12);
  const remainingMonths = month % 12;
  if (remainingMonths === 0) return `Ano ${years}`;
  return `${years}a ${remainingMonths}m`;
}

export function buildChartSeries(
  monthly: MonthProjection[],
  monthsToGoal: number | null,
): {
  label: string;
  month: number;
  balance: number;
  isGoal: boolean;
  monthlyInterest: number;
}[] {
  if (monthly.length === 0) return [];

  const byMonth = new Map(monthly.map((point) => [point.month, point]));
  const lastMonth = monthly[monthly.length - 1]!.month;
  const monthsToInclude = new Set<number>([0]);

  for (let month = 12; month <= lastMonth; month += 12) {
    monthsToInclude.add(month);
  }

  if (monthsToGoal !== null) {
    monthsToInclude.add(monthsToGoal);
  }

  return Array.from(monthsToInclude)
    .sort((a, b) => a - b)
    .map((month) => {
      const point = byMonth.get(month);
      return {
        label: formatChartMonthLabel(month),
        month,
        balance: point?.balance ?? 0,
        monthlyInterest: point?.monthlyInterest ?? 0,
        isGoal: monthsToGoal !== null && month === monthsToGoal,
      };
    });
}

export function formatGoalReachedLabel(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
}

export function projectInvestmentSimulation(input: SimulationInput): SimulationProjection {
  const maxMonths = (input.maxYears ?? SIMULATION_MAX_YEARS) * 12;
  const monthlyRate =
    input.annualYieldPercent === 0
      ? 0
      : Math.pow(1 + input.annualYieldPercent / 100, 1 / 12) - 1;

  let balance = input.initialAmount;
  let currentMonthlyContribution = input.monthlyContribution;
  let totalContributed = input.initialAmount;
  let monthsToGoal: number | null = null;
  let yearInterestTotal = 0;

  const yearly: YearProjection[] = [];
  const monthly: MonthProjection[] = [
    { month: 0, balance: roundMoney(input.initialAmount), monthlyInterest: 0 },
  ];
  const goalAmount = input.goalAmount ?? null;

  const annualAdditionalContribution = input.annualAdditionalContribution ?? 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const interestThisMonth = balance * monthlyRate;
    balance += interestThisMonth + currentMonthlyContribution;
    totalContributed += currentMonthlyContribution;

    if (month % 12 === 0 && annualAdditionalContribution > 0) {
      balance += annualAdditionalContribution;
      totalContributed += annualAdditionalContribution;
    }

    yearInterestTotal += interestThisMonth;

    monthly.push({
      month,
      balance: roundMoney(balance),
      monthlyInterest: roundMoney(interestThisMonth),
    });

    if (goalAmount !== null && goalAmount > 0 && monthsToGoal === null && balance >= goalAmount) {
      monthsToGoal = month;
    }

    if (month % 12 === 0) {
      const year = month / 12;
      const interestEarned = balance - totalContributed;
      yearly.push({
        year,
        balance: roundMoney(balance),
        totalContributed: roundMoney(totalContributed),
        interestEarned: roundMoney(interestEarned),
        monthlyContribution: roundMoney(currentMonthlyContribution),
        monthlyInterest: roundMoney(yearInterestTotal / 12),
      });
      yearInterestTotal = 0;

      if (month < maxMonths) {
        currentMonthlyContribution *= 1 + input.annualContributionIncreasePercent / 100;
      }
    }
  }

  const totalInterest = balance - totalContributed;

  return {
    yearly,
    monthly,
    monthsToGoal,
    goalReachedLabel: monthsToGoal !== null ? formatGoalReachedLabel(monthsToGoal) : null,
    finalBalance: roundMoney(balance),
    totalContributed: roundMoney(totalContributed),
    totalInterest: roundMoney(totalInterest),
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
