import { Expense, ExpenseForecast } from '../types';

export const calculateForecast = (
  currentMonthExpenses: Expense[], 
  historicalMonthlyTotals: number[],
  currentDateStr: string = new Date().toISOString()
): ExpenseForecast => {
  const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  const currentDate = new Date(currentDateStr);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Total days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = currentDate.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  let expectedFinalSpending = 0;
  let minRange = 0;
  let maxRange = 0;
  let confidence = 0;

  if (daysElapsed === 0) {
    // Cannot forecast accurately on day 0, rely entirely on history
    const avgHistory = historicalMonthlyTotals.length > 0 
      ? historicalMonthlyTotals.reduce((a, b) => a + b, 0) / historicalMonthlyTotals.length
      : 0;
    expectedFinalSpending = avgHistory;
    minRange = avgHistory * 0.9;
    maxRange = avgHistory * 1.1;
    confidence = historicalMonthlyTotals.length > 0 ? 50 : 10;
  } else {
    // Run-rate projection based on current spending
    const dailyRunRate = currentTotal / daysElapsed;
    const projectedRunRate = currentTotal + (dailyRunRate * daysRemaining);

    if (historicalMonthlyTotals.length > 0) {
      // Blend run-rate with historical average
      const avgHistory = historicalMonthlyTotals.reduce((a, b) => a + b, 0) / historicalMonthlyTotals.length;
      
      // Weight the run rate higher as the month progresses
      const runRateWeight = daysElapsed / daysInMonth;
      const historyWeight = 1 - runRateWeight;

      expectedFinalSpending = (projectedRunRate * runRateWeight) + (avgHistory * historyWeight);
      
      // Calculate variance in history to estimate range
      const variance = historicalMonthlyTotals.reduce((acc, val) => acc + Math.pow(val - avgHistory, 2), 0) / historicalMonthlyTotals.length;
      const stdDev = Math.sqrt(variance);

      minRange = expectedFinalSpending - stdDev;
      maxRange = expectedFinalSpending + stdDev;
      
      // Higher confidence towards the end of the month or with stable history
      confidence = Math.min(95, 40 + (runRateWeight * 50));
    } else {
      // No history, purely run-rate
      expectedFinalSpending = projectedRunRate;
      minRange = expectedFinalSpending * 0.85;
      maxRange = expectedFinalSpending * 1.15;
      confidence = Math.min(80, 20 + (daysElapsed / daysInMonth * 60));
    }
  }

  return {
    currentSpending: currentTotal,
    expectedFinalSpending,
    expectedRange: {
      min: Math.max(currentTotal, minRange), // Final can't be less than what's already spent
      max: Math.max(currentTotal * 1.05, maxRange)
    },
    confidence: Math.round(confidence),
    daysElapsed,
    daysRemaining
  };
};
