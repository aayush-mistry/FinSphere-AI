import { CashFlowBreakdown } from '../types';
import { IncomeTypeSummary } from '../../income-engine/types';
import { CategoryComparison } from '../../expense-engine/types';

export function calculateCashFlowBreakdown(
  incomeTypes: IncomeTypeSummary[],
  expenseCategories: CategoryComparison[]
): CashFlowBreakdown {
  
  const incomeBreakdown = incomeTypes.map(inc => ({
    category: inc.type,
    amount: inc.totalAmount,
    percentageOfTotal: inc.percentageOfTotal
  }));

  const expensesBreakdown = expenseCategories.map(exp => ({
    category: exp.category,
    amount: exp.totalAmount,
    percentageOfTotal: exp.percentageOfTotal
  }));

  // Ensure they are sorted by highest amount first
  incomeBreakdown.sort((a, b) => b.amount - a.amount);
  expensesBreakdown.sort((a, b) => b.amount - a.amount);

  return {
    income: incomeBreakdown,
    expenses: expensesBreakdown
  };
}
