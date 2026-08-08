import { CashFlowSummary } from '../types';
import { IncomeTransaction } from '../../income-engine/types';
import { Expense } from '../../expense-engine/types';

export function calculateCashFlowSummary(
  incomeTransactions: IncomeTransaction[],
  expenses: Expense[],
  startingCashPosition: number,
  endingCashPosition: number
): CashFlowSummary {
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = (netCashFlow / totalIncome) * 100;
  } else if (totalIncome === 0 && netCashFlow < 0) {
    // If there is no income but there are expenses, savings rate is fundamentally not positive.
    // By convention in personal finance, this is often represented as 0% or negative infinity.
    // We will stick to 0% to avoid extreme UI artifacts.
    savingsRate = 0;
  }

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    startingCashPosition,
    endingCashPosition,
    cashPositionChange: endingCashPosition - startingCashPosition,
    savingsRate,
    incomeTransactionCount: incomeTransactions.length,
    expenseTransactionCount: expenses.length,
    isPositive: netCashFlow >= 0
  };
}
