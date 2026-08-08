import { IncomeTransaction, IncomeTrend, IncomeTrendDataPoint } from '../types';

export const calculateIncomeTrends = (
  transactions: IncomeTransaction[],
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): IncomeTrend => {
  const buckets = new Map<string, number>();

  for (const txn of transactions) {
    const d = new Date(txn.date);
    let key = '';

    if (periodType === 'DAILY') {
      key = txn.date.substring(0, 10); // YYYY-MM-DD
    } else if (periodType === 'MONTHLY') {
      key = txn.date.substring(0, 7); // YYYY-MM
    } else if (periodType === 'YEARLY') {
      key = txn.date.substring(0, 4); // YYYY
    } else if (periodType === 'WEEKLY') {
      // Get the Monday of the week
      const day = d.getDay() || 7;
      if (day !== 1) d.setHours(-24 * (day - 1));
      key = d.toISOString().substring(0, 10);
    }

    buckets.set(key, (buckets.get(key) || 0) + txn.amount);
  }

  // Sort keys chronologically
  const sortedKeys = Array.from(buckets.keys()).sort();
  const dataPoints: IncomeTrendDataPoint[] = sortedKeys.map(k => ({
    date: k,
    amount: buckets.get(k)!
  }));

  let absoluteChange = 0;
  let percentageChange = 0;
  let direction: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';

  if (dataPoints.length >= 2) {
    const current = dataPoints[dataPoints.length - 1].amount;
    const previous = dataPoints[dataPoints.length - 2].amount;
    
    absoluteChange = current - previous;
    if (previous > 0) {
      percentageChange = (absoluteChange / previous) * 100;
    } else {
      percentageChange = current > 0 ? 100 : 0;
    }

    if (absoluteChange > 0) direction = 'UP';
    else if (absoluteChange < 0) direction = 'DOWN';
  }

  return {
    periodType,
    dataPoints,
    absoluteChange,
    percentageChange,
    direction
  };
};
