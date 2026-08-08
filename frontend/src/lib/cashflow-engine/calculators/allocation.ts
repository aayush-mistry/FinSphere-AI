import { CashFlowAllocation } from '../types';

export function calculateCashFlowAllocation(
  totalIncome: number,
  totalExpenses: number,
  cashPositionChange: number,
  investmentContributions: number,
  debtReduction: number
): CashFlowAllocation {
  return {
    income: totalIncome,
    expenses: totalExpenses,
    remainingCashFlow: totalIncome - totalExpenses,
    allocation: {
      cash: cashPositionChange,
      investments: investmentContributions,
      debtReduction: debtReduction
    }
  };
}
