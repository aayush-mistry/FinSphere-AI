import { IncomeTransaction, RecurringIncomeDetail } from '../types';

export const detectRecurringIncome = (transactions: IncomeTransaction[]): IncomeTransaction[] => {
  // Group by source
  const sourceGroups: Record<string, IncomeTransaction[]> = {};
  
  for (const txn of transactions) {
    const source = txn.incomeClassification.source;
    if (!sourceGroups[source]) {
      sourceGroups[source] = [];
    }
    sourceGroups[source].push(txn);
  }

  // Iterate over groups and identify recurring candidates
  const result: IncomeTransaction[] = [];
  
  for (const source in sourceGroups) {
    const group = sourceGroups[source];
    
    // Need at least 2 transactions to detect a pattern
    if (group.length >= 2) {
      // Sort chronologically
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let isRecurring = true;
      let previousAmount = group[0].amount;
      
      // Simple variance check (allow 5% variance)
      for (let i = 1; i < group.length; i++) {
        const currentAmount = group[i].amount;
        const variance = Math.abs(currentAmount - previousAmount) / previousAmount;
        if (variance > 0.05) {
          isRecurring = false;
          break;
        }
        previousAmount = currentAmount;
      }
      
      if (isRecurring) {
        // Simple time interval check
        let avgIntervalDays = 0;
        for (let i = 1; i < group.length; i++) {
          const diffMs = new Date(group[i].date).getTime() - new Date(group[i-1].date).getTime();
          avgIntervalDays += diffMs / (1000 * 60 * 60 * 24);
        }
        avgIntervalDays /= (group.length - 1);
        
        // Allow intervals between ~7 days (weekly) and ~35 days (monthly)
        if (avgIntervalDays > 5 && avgIntervalDays <= 35) {
          group.forEach(t => t.isRecurringCandidate = true);
        } else {
          group.forEach(t => t.isRecurringCandidate = false);
        }
      } else {
        group.forEach(t => t.isRecurringCandidate = false);
      }
    } else {
      group.forEach(t => t.isRecurringCandidate = false);
    }
    
    result.push(...group);
  }
  
  // Sort back by original descending date order typically used
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const analyzeRecurringIncome = (transactions: IncomeTransaction[]): RecurringIncomeDetail[] => {
  const recurringTxns = detectRecurringIncome(transactions).filter(t => t.isRecurringCandidate);
  const sourceGroups: Record<string, IncomeTransaction[]> = {};
  
  for (const txn of recurringTxns) {
    const source = txn.incomeClassification.source;
    if (!sourceGroups[source]) {
      sourceGroups[source] = [];
    }
    sourceGroups[source].push(txn);
  }

  const details: RecurringIncomeDetail[] = [];

  for (const source in sourceGroups) {
    const group = sourceGroups[source];
    group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let sum = 0;
    group.forEach(t => sum += t.amount);
    const expectedAmount = sum / group.length;

    let avgIntervalDays = 0;
    for (let i = 1; i < group.length; i++) {
      const diffMs = new Date(group[i].date).getTime() - new Date(group[i-1].date).getTime();
      avgIntervalDays += diffMs / (1000 * 60 * 60 * 24);
    }
    avgIntervalDays /= (group.length - 1);

    let frequency: 'DAILY' | 'WEEKLY' | 'BI-WEEKLY' | 'MONTHLY' | 'YEARLY' | 'UNKNOWN' = 'UNKNOWN';
    if (avgIntervalDays > 5 && avgIntervalDays <= 8) frequency = 'WEEKLY';
    else if (avgIntervalDays > 12 && avgIntervalDays <= 16) frequency = 'BI-WEEKLY';
    else if (avgIntervalDays > 25 && avgIntervalDays <= 35) frequency = 'MONTHLY';
    else if (avgIntervalDays > 350 && avgIntervalDays <= 380) frequency = 'YEARLY';

    const lastOccurrence = group[group.length - 1].date;
    const nextExpectedTime = new Date(lastOccurrence).getTime() + (avgIntervalDays * 24 * 60 * 60 * 1000);
    const nextExpectedOccurrence = new Date(nextExpectedTime).toISOString();

    // Calculate variance for confidence
    let varianceSum = 0;
    group.forEach(t => {
      varianceSum += Math.pow(t.amount - expectedAmount, 2);
    });
    const standardDeviation = Math.sqrt(varianceSum / group.length);
    const coefficientOfVariation = standardDeviation / expectedAmount;
    
    // Convert CV to confidence (0 to 1). Lower CV = Higher confidence
    let confidence = 1 - (coefficientOfVariation * 10);
    if (confidence < 0) confidence = 0;
    if (confidence > 1) confidence = 1;
    
    // Penalize confidence if very few historical occurrences
    if (group.length < 3) confidence *= 0.8;

    details.push({
      source,
      expectedAmount,
      frequency,
      lastOccurrence,
      nextExpectedOccurrence,
      confidence,
      historicalOccurrences: group.length
    });
  }

  return details.sort((a, b) => b.expectedAmount - a.expectedAmount);
};

