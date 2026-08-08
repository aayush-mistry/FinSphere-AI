import { Expense, ExpenseAnomaly } from '../types';

export const detectAnomalies = (recentExpenses: Expense[], historicalExpenses: Expense[]): ExpenseAnomaly[] => {
  const anomalies: ExpenseAnomaly[] = [];
  
  // Calculate historical averages and stddev per category
  const historicalByCategory = new Map<string, number[]>();
  for (const e of historicalExpenses) {
    const cat = e.expenseCategory.name;
    if (!historicalByCategory.has(cat)) historicalByCategory.set(cat, []);
    historicalByCategory.get(cat)!.push(Math.abs(e.amount));
  }

  const categoryStats = new Map<string, { mean: number; stdDev: number; count: number }>();
  for (const [cat, amounts] of historicalByCategory.entries()) {
    if (amounts.length < 3) continue; // Need at least 3 to form a decent baseline
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    categoryStats.set(cat, { mean, stdDev, count: amounts.length });
  }

  // Check recent expenses against baseline
  for (const e of recentExpenses) {
    const cat = e.expenseCategory.name;
    const amount = Math.abs(e.amount);
    const stats = categoryStats.get(cat);
    
    if (stats) {
      // Define anomaly threshold (e.g., > mean + 2 * stdDev)
      // Also ensure the difference is non-trivial (e.g. at least 20% more than mean)
      const threshold = stats.mean + (2 * stats.stdDev);
      const isSignificantlyHigher = amount > threshold && amount > stats.mean * 1.2;

      if (isSignificantlyHigher) {
        const deviation = amount - stats.mean;
        const score = Math.min(100, Math.round((deviation / stats.mean) * 100));
        
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (score > 80) severity = 'HIGH';
        else if (score > 50) severity = 'MEDIUM';

        anomalies.push({
          id: `anomaly_${e.id}`,
          score,
          severity,
          reason: `Unusually high spending in ${cat}. Average is typically ${Math.round(stats.mean)}, but this was ${Math.round(amount)}.`,
          relatedTransaction: e,
          expectedRange: {
            min: Math.max(0, stats.mean - stats.stdDev),
            max: threshold
          }
        });
      }
    }
  }

  return anomalies.sort((a, b) => b.score - a.score);
};
