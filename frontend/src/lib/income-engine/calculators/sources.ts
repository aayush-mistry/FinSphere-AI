import { IncomeTransaction, IncomeSourceAnalytics } from '../types';

export const calculateIncomeSources = (
  currentPeriodTxns: IncomeTransaction[],
  previousPeriodTxns: IncomeTransaction[]
): IncomeSourceAnalytics[] => {
  const currentMap = new Map<string, IncomeSourceAnalytics>();
  let currentTotalIncome = 0;

  // Process current period
  for (const txn of currentPeriodTxns) {
    const source = txn.incomeClassification.source;
    const amount = txn.amount;
    const type = txn.incomeClassification.type;

    currentTotalIncome += amount;

    if (!currentMap.has(source)) {
      currentMap.set(source, {
        source,
        totalAmount: 0,
        transactionCount: 0,
        primaryType: type,
        percentageOfTotal: 0,
        averageTransaction: 0,
        previousPeriodTotal: 0,
        percentageChange: 0
      });
    }

    const summary = currentMap.get(source)!;
    summary.totalAmount += amount;
    summary.transactionCount += 1;
  }

  // Process previous period totals
  const previousMap = new Map<string, number>();
  for (const txn of previousPeriodTxns) {
    const source = txn.incomeClassification.source;
    previousMap.set(source, (previousMap.get(source) || 0) + txn.amount);
  }

  // Finalize calculations
  const analytics: IncomeSourceAnalytics[] = Array.from(currentMap.values()).map(summary => {
    summary.percentageOfTotal = currentTotalIncome > 0 ? (summary.totalAmount / currentTotalIncome) * 100 : 0;
    summary.averageTransaction = summary.transactionCount > 0 ? summary.totalAmount / summary.transactionCount : 0;
    summary.previousPeriodTotal = previousMap.get(summary.source) || 0;

    if (summary.previousPeriodTotal > 0) {
      summary.percentageChange = ((summary.totalAmount - summary.previousPeriodTotal) / summary.previousPeriodTotal) * 100;
    } else {
      // If there was no income from this source previously, it's a 100% gain (or infinite, we cap at 100)
      summary.percentageChange = 100; 
    }

    return summary;
  });

  return analytics.sort((a, b) => b.totalAmount - a.totalAmount);
};
