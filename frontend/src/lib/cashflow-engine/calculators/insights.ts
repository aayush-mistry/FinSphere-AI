import { CashFlowInsights, CashFlowSummary, NegativeCashFlowAnalysis, CashFlowAllocation, CashFlowBreakdown } from '../types';

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function generateCashFlowInsights(
  summary: CashFlowSummary,
  allocation: CashFlowAllocation,
  previousSummary?: CashFlowSummary
): CashFlowInsights {
  const insights: string[] = [];

  if (previousSummary) {
    const expenseDiff = summary.totalExpenses - previousSummary.totalExpenses;
    if (expenseDiff > 0) {
      const pct = previousSummary.totalExpenses > 0 ? (expenseDiff / previousSummary.totalExpenses) * 100 : 100;
      insights.push(`Expenses increased ${pct.toFixed(0)}% compared with last month.`);
    } else if (expenseDiff < 0) {
      const pct = previousSummary.totalExpenses > 0 ? (Math.abs(expenseDiff) / previousSummary.totalExpenses) * 100 : 100;
      insights.push(`Expenses decreased ${pct.toFixed(0)}% compared with last month.`);
    }

    const netFlowDiff = summary.netCashFlow - previousSummary.netCashFlow;
    if (netFlowDiff > 0) {
      insights.push(`Net cash flow increased by ${formatCurrency(netFlowDiff)}.`);
    } else if (netFlowDiff < 0) {
      insights.push(`Net cash flow decreased by ${formatCurrency(Math.abs(netFlowDiff))}.`);
    }
  }

  if (allocation.allocation.investments > 0) {
    insights.push(`${formatCurrency(allocation.allocation.investments)} was allocated toward investments.`);
  }
  
  if (allocation.allocation.debtReduction > 0) {
    insights.push(`${formatCurrency(allocation.allocation.debtReduction)} was used for debt reduction.`);
  }

  if (summary.cashPositionChange > 0) {
    insights.push(`Your liquid cash increased by ${formatCurrency(summary.cashPositionChange)}.`);
  } else if (summary.cashPositionChange < 0) {
    insights.push(`Your liquid cash decreased by ${formatCurrency(Math.abs(summary.cashPositionChange))}.`);
  }

  if (summary.savingsRate > 0) {
    insights.push(`You saved ${summary.savingsRate.toFixed(1)}% of your income.`);
  }

  return { insights };
}

export function generateNegativeCashFlowAnalysis(
  summary: CashFlowSummary,
  breakdown: CashFlowBreakdown,
  previousSummary?: CashFlowSummary
): NegativeCashFlowAnalysis {
  
  const isNegative = summary.netCashFlow < 0;
  const deficit = isNegative ? Math.abs(summary.netCashFlow) : 0;
  
  let percentageDeficit = 0;
  if (isNegative && summary.totalIncome > 0) {
    percentageDeficit = (deficit / summary.totalIncome) * 100;
  } else if (isNegative && summary.totalIncome === 0) {
    percentageDeficit = 100; // Complete deficit
  }

  // Top 3 expense categories
  const mainExpenseCategories = breakdown.expenses.slice(0, 3).map(e => ({
    category: e.category,
    amount: e.amount
  }));

  let previousPeriodDeficit = undefined;
  if (previousSummary && previousSummary.netCashFlow < 0) {
    previousPeriodDeficit = Math.abs(previousSummary.netCashFlow);
  }

  return {
    isNegative,
    deficit,
    percentageDeficit,
    mainExpenseCategories,
    previousPeriodDeficit
  };
}
