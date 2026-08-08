import { IncomeTransaction, IncomeSummary } from '../types';

export const calculateIncomeSummary = (
  currentPeriodTxns: IncomeTransaction[],
  previousMonthTxns: IncomeTransaction[],
  currentYearTxns: IncomeTransaction[]
): IncomeSummary => {
  let currentMonthIncome = 0;
  let transactionCount = 0;
  let largestTransaction: IncomeTransaction | undefined;
  let smallestTransaction: IncomeTransaction | undefined;

  for (const txn of currentPeriodTxns) {
    currentMonthIncome += txn.amount;
    transactionCount++;

    if (!largestTransaction || txn.amount > largestTransaction.amount) {
      largestTransaction = txn;
    }
    
    // For income, smallest means smallest positive amount
    if (!smallestTransaction || txn.amount < smallestTransaction.amount) {
      smallestTransaction = txn;
    }
  }

  const previousMonthIncome = previousMonthTxns.reduce((sum, t) => sum + t.amount, 0);
  const currentYearIncome = currentYearTxns.reduce((sum, t) => sum + t.amount, 0);

  // Group by month to calculate average monthly income for the year
  const monthsInYear = new Set(currentYearTxns.map(t => t.date.substring(0, 7))).size;
  const averageMonthlyIncome = monthsInYear > 0 ? currentYearIncome / monthsInYear : 0;

  // Assuming a 30 day month for average daily income approximation of current period
  const averageDailyIncome = currentMonthIncome / 30;

  return {
    currentMonthIncome,
    previousMonthIncome,
    currentYearIncome,
    averageMonthlyIncome,
    averageDailyIncome,
    transactionCount,
    largestTransaction,
    smallestTransaction
  };
};
