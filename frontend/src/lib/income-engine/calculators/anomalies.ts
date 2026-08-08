import { IncomeTransaction, IncomeAnomaly } from '../types';
import { analyzeRecurringIncome } from './recurring';

export const detectIncomeAnomalies = (
  recentTransactions: IncomeTransaction[],
  historicalTransactions: IncomeTransaction[]
): IncomeAnomaly[] => {
  const anomalies: IncomeAnomaly[] = [];

  // Get baseline expected amounts from historical data
  const recurringDetails = analyzeRecurringIncome(historicalTransactions);
  const baselineMap = new Map<string, number>();
  recurringDetails.forEach(d => baselineMap.set(d.source, d.expectedAmount));

  // Detect massive spikes from non-recurring sources
  const nonRecurringHistorical = historicalTransactions.filter(
    t => !baselineMap.has(t.incomeClassification.source)
  );
  
  let historicalNonRecurringAvg = 0;
  if (nonRecurringHistorical.length > 0) {
    historicalNonRecurringAvg = nonRecurringHistorical.reduce((sum, t) => sum + t.amount, 0) / nonRecurringHistorical.length;
  }

  for (const txn of recentTransactions) {
    const source = txn.incomeClassification.source;
    const amount = txn.amount;

    if (baselineMap.has(source)) {
      const baseline = baselineMap.get(source)!;
      const difference = amount - baseline;
      const percentDiff = Math.abs(difference / baseline);

      // Anomaly: Salary/Recurring drop of > 20% or spike of > 50%
      if (percentDiff > 0.2) {
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        let explanation = '';

        if (difference < 0) {
          severity = percentDiff > 0.5 ? 'HIGH' : 'MEDIUM';
          explanation = `Income from ${source} is significantly below historical expected amount. Expected: ${baseline.toFixed(0)}, Received: ${amount.toFixed(0)}`;
        } else if (percentDiff > 0.5) {
          severity = 'MEDIUM';
          explanation = `Unusually large income from ${source}. Expected: ${baseline.toFixed(0)}, Received: ${amount.toFixed(0)}`;
        }

        if (explanation) {
          anomalies.push({
            transaction: txn,
            historicalBaseline: baseline,
            difference,
            anomalyScore: Math.min(1, percentDiff),
            severity,
            explanation
          });
        }
      }
    } else {
      // Non-recurring massive spike (e.g. random freelance payout 5x larger than usual average)
      if (historicalNonRecurringAvg > 0 && amount > historicalNonRecurringAvg * 3) {
        const difference = amount - historicalNonRecurringAvg;
        anomalies.push({
          transaction: txn,
          historicalBaseline: historicalNonRecurringAvg,
          difference,
          anomalyScore: Math.min(1, amount / (historicalNonRecurringAvg * 5)), // Cap at 1
          severity: amount > historicalNonRecurringAvg * 5 ? 'HIGH' : 'MEDIUM',
          explanation: `Unusually large non-recurring income from ${source}. Baseline average for non-recurring is ${historicalNonRecurringAvg.toFixed(0)}.`
        });
      }
    }
  }

  return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
};
