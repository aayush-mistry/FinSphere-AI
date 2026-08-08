import { Expense, RecurringExpense } from '../types';

export const detectRecurringExpenses = (expenses: Expense[]): RecurringExpense[] => {
  // Sort chronologically
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group by Merchant
  const merchantGroups = new Map<string, Expense[]>();
  for (const e of sortedExpenses) {
    if (!e.merchant) continue; // Need a merchant to identify recurring
    if (!merchantGroups.has(e.merchant)) merchantGroups.set(e.merchant, []);
    merchantGroups.get(e.merchant)!.push(e);
  }

  const recurring: RecurringExpense[] = [];

  for (const [merchant, history] of merchantGroups.entries()) {
    if (history.length < 2) continue; // Need at least 2 to establish a pattern

    // Check amount similarity
    const amounts = history.map(h => Math.abs(h.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const isAmountConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.2); // Within 20% variance

    if (!isAmountConsistent) continue;

    // Check time interval
    const intervals: number[] = [];
    for (let i = 1; i < history.length; i++) {
      const d1 = new Date(history[i-1].date).getTime();
      const d2 = new Date(history[i].date).getTime();
      intervals.push((d2 - d1) / (1000 * 60 * 60 * 24)); // Days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    let frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null = null;
    let isIntervalConsistent = false;

    if (avgInterval >= 6 && avgInterval <= 8) {
      frequency = 'WEEKLY';
      isIntervalConsistent = intervals.every(i => i >= 5 && i <= 9);
    } else if (avgInterval >= 25 && avgInterval <= 35) {
      frequency = 'MONTHLY';
      isIntervalConsistent = intervals.every(i => i >= 20 && i <= 40);
    } else if (avgInterval >= 350 && avgInterval <= 380) {
      frequency = 'YEARLY';
      isIntervalConsistent = intervals.every(i => i >= 340 && i <= 390);
    }

    if (frequency && isIntervalConsistent) {
      const lastOccurrence = history[history.length - 1].date;
      const nextExpected = new Date(lastOccurrence);
      if (frequency === 'MONTHLY') nextExpected.setMonth(nextExpected.getMonth() + 1);
      else if (frequency === 'WEEKLY') nextExpected.setDate(nextExpected.getDate() + 7);
      else if (frequency === 'YEARLY') nextExpected.setFullYear(nextExpected.getFullYear() + 1);

      // Confidence based on number of occurrences
      let confidence = 50;
      if (history.length >= 3) confidence = 80;
      if (history.length >= 5) confidence = 95;

      recurring.push({
        merchant,
        expectedAmount: avgAmount,
        frequency,
        lastOccurrence,
        nextExpectedOccurrence: nextExpected.toISOString(),
        confidence,
        history
      });
    }
  }

  // Sort by highest confidence and then largest amount
  return recurring.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.expectedAmount - a.expectedAmount;
  });
};
