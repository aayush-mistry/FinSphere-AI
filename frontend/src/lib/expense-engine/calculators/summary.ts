import { Expense, ExpenseSummary, ExpenseFixedVariable } from '../types';

export const generateExpenseSummary = (expenses: Expense[], startDateStr: string, endDateStr: string): ExpenseSummary => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

  let totalSpent = 0;
  let totalFixed = 0;
  let totalVariable = 0;
  let largestExpense: Expense | undefined;
  let smallestExpense: Expense | undefined;

  for (const expense of expenses) {
    const absAmount = Math.abs(expense.amount);
    totalSpent += absAmount;

    if (expense.expenseCategory.type === ExpenseFixedVariable.FIXED) {
      totalFixed += absAmount;
    } else {
      totalVariable += absAmount;
    }

    if (!largestExpense || absAmount > Math.abs(largestExpense.amount)) {
      largestExpense = expense;
    }
    
    if (!smallestExpense || absAmount < Math.abs(smallestExpense.amount)) {
      smallestExpense = expense;
    }
  }

  const averageDailySpending = diffDays > 0 ? totalSpent / diffDays : 0;
  const averageWeeklySpending = averageDailySpending * 7;
  const averageMonthlySpending = averageDailySpending * 30; // Approx 30 days

  const fixedRatio = totalSpent > 0 ? (totalFixed / totalSpent) * 100 : 0;
  const variableRatio = totalSpent > 0 ? (totalVariable / totalSpent) * 100 : 0;

  return {
    period: `${startDateStr} to ${endDateStr}`,
    startDate: startDateStr,
    endDate: endDateStr,
    totalSpent,
    averageDailySpending,
    averageWeeklySpending,
    averageMonthlySpending,
    transactionCount: expenses.length,
    largestExpense,
    smallestExpense,
    totalFixed,
    totalVariable,
    fixedRatio,
    variableRatio
  };
};
