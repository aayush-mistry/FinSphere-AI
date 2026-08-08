import { IncomeTransaction, IncomeStabilityMetrics } from '../types';
import { analyzeRecurringIncome } from './recurring';

export const calculateIncomeStability = (
  allTransactions: IncomeTransaction[]
): IncomeStabilityMetrics => {
  let recurringAmount = 0;
  let variableAmount = 0;

  // Use the recurring detector to find recurring candidates
  const recurringDetails = analyzeRecurringIncome(allTransactions);
  const recurringSources = new Set(recurringDetails.map(d => d.source));

  const monthlyTotals = new Map<string, number>();
  const sources = new Set<string>();

  for (const txn of allTransactions) {
    const source = txn.incomeClassification.source;
    sources.add(source);

    // Month bucket for consistency check
    const month = txn.date.substring(0, 7);
    monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + txn.amount);

    if (recurringSources.has(source)) {
      recurringAmount += txn.amount;
    } else {
      variableAmount += txn.amount;
    }
  }

  const totalAmount = recurringAmount + variableAmount;
  const recurringRatio = totalAmount > 0 ? recurringAmount / totalAmount : 0;
  const variableRatio = totalAmount > 0 ? variableAmount / totalAmount : 0;

  // Calculate consistency using Coefficient of Variation across months
  let incomeConsistency = 0;
  const totals = Array.from(monthlyTotals.values());
  
  if (totals.length >= 2) {
    const mean = totalAmount / totals.length;
    let varianceSum = 0;
    totals.forEach(t => {
      varianceSum += Math.pow(t - mean, 2);
    });
    const standardDeviation = Math.sqrt(varianceSum / totals.length);
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;

    // Convert CV to a consistency score (0 to 1). 
    // CV of 0 = 100% consistent. CV > 1 = 0% consistent.
    incomeConsistency = Math.max(0, 1 - coefficientOfVariation);
  } else if (totals.length === 1) {
    incomeConsistency = 1; // Only one month of data, perfectly consistent relative to itself
  }

  return {
    recurringAmount,
    variableAmount,
    recurringRatio,
    variableRatio,
    incomeVariance: totals.length >= 2 ? Math.sqrt(totals.reduce((sum, t) => sum + Math.pow(t - (totalAmount / totals.length), 2), 0) / totals.length) : 0,
    incomeConsistency,
    numberOfSources: sources.size
  };
};
