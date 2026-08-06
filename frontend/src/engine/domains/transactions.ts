import { Transaction, CashFlow, SpendingSummary } from '../types';

export function aggregateTransactions(transactions: Transaction[]): {
  cashFlow: CashFlow;
  spendingSummary: SpendingSummary[];
} {
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  const categoryMap = new Map<string, number>();

  transactions.forEach((txn) => {
    if (txn.amount > 0) {
      monthlyIncome += txn.amount;
    } else {
      const expense = Math.abs(txn.amount);
      // Don't count transfers or savings as expenses for pure spending
      if (txn.category !== 'Transfer' && txn.category !== 'Savings') {
        monthlyExpenses += expense;
        
        // Aggregate for SpendingSummary
        const current = categoryMap.get(txn.category) || 0;
        categoryMap.set(txn.category, current + expense);
      }
    }
  });

  const netCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (netCashFlow / monthlyIncome) * 100 : 0;

  const spendingSummary: SpendingSummary[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category: category as TransactionCategory,
    amount,
    percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    cashFlow: {
      monthlyIncome,
      monthlyExpenses,
      netCashFlow,
      savingsRate,
    },
    spendingSummary,
  };
}
