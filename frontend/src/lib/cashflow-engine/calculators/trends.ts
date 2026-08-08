import { CashFlowTrend, CashFlowDataPoint } from '../types';
import { IncomeTrend } from '../../income-engine/types';
import { ExpenseTrend } from '../../expense-engine/types';

export function calculateCashFlowTrends(
  incomeTrend: IncomeTrend,
  expenseTrend: ExpenseTrend,
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): CashFlowTrend {
  
  const dateMap = new Map<string, CashFlowDataPoint>();

  // Initialize with income data
  for (const dp of incomeTrend.dataPoints) {
    dateMap.set(dp.date, {
      date: dp.date,
      income: dp.amount,
      expenses: 0,
      netCashFlow: dp.amount
    });
  }

  // Merge expense data
  for (const dp of expenseTrend.dataPoints) {
    if (dateMap.has(dp.date)) {
      const existing = dateMap.get(dp.date)!;
      existing.expenses = dp.amount;
      existing.netCashFlow = existing.income - existing.expenses;
    } else {
      dateMap.set(dp.date, {
        date: dp.date,
        income: 0,
        expenses: dp.amount,
        netCashFlow: 0 - dp.amount
      });
    }
  }

  const dataPoints = Array.from(dateMap.values());
  // Sort chronologically
  dataPoints.sort((a, b) => a.date.localeCompare(b.date));

  return {
    periodType,
    dataPoints
  };
}
