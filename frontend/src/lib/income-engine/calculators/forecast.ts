import { IncomeTransaction, IncomeForecast } from '../types';
import { analyzeRecurringIncome } from './recurring';

export const calculateIncomeForecast = (
  currentMonthTransactions: IncomeTransaction[],
  historicalTransactions: IncomeTransaction[],
  currentMonthStart: string,
  currentMonthEnd: string
): IncomeForecast => {
  let receivedSoFar = 0;
  currentMonthTransactions.forEach(t => receivedSoFar += t.amount);

  // 1. Calculate expected remaining recurring
  const recurringDetails = analyzeRecurringIncome(historicalTransactions);
  let expectedRecurring = 0;
  
  const endOfMonthTime = new Date(currentMonthEnd).getTime();
  const startOfMonthTime = new Date(currentMonthStart).getTime();
  const now = Date.now();

  recurringDetails.forEach(detail => {
    const nextExpectedTime = new Date(detail.nextExpectedOccurrence).getTime();
    
    // If the next expected occurrence is in the future, but still within this month
    // AND it hasn't already been received (to avoid double counting, we assume if 
    // a transaction from this source is in currentMonthTransactions, it's paid, 
    // unless frequency is weekly/bi-weekly and multiple are expected).
    // For simplicity, we just check if it's within the remaining month window.
    if (nextExpectedTime > now && nextExpectedTime <= endOfMonthTime) {
      // Very basic check: did we already get paid from this source recently?
      const alreadyPaidThisMonth = currentMonthTransactions.some(t => t.incomeClassification.source === detail.source);
      
      // If it's a monthly payout and already paid, skip. 
      // If weekly, we might expect more, but for simplicity we will just add expected if nextExpectedTime is in future.
      if (!(detail.frequency === 'MONTHLY' && alreadyPaidThisMonth)) {
        // Multiply by confidence to be conservative
        expectedRecurring += detail.expectedAmount * detail.confidence;
      }
    }
  });

  // 2. Calculate historical variable average
  const recurringSources = new Set(recurringDetails.map(d => d.source));
  const variableHistorical = historicalTransactions.filter(t => !recurringSources.has(t.incomeClassification.source));
  
  // Find out how many months of historical data we have
  const monthsSet = new Set(historicalTransactions.map(t => t.date.substring(0, 7)));
  const numMonths = monthsSet.size > 0 ? monthsSet.size : 1;
  
  const totalVariableHistorical = variableHistorical.reduce((sum, t) => sum + t.amount, 0);
  const averageMonthlyVariable = totalVariableHistorical / numMonths;

  // Prorate the variable expectation based on days remaining in the month
  const totalDaysInMonth = (endOfMonthTime - startOfMonthTime) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, (endOfMonthTime - now) / (1000 * 60 * 60 * 24));
  
  let expectedVariable = 0;
  if (totalDaysInMonth > 0) {
    expectedVariable = averageMonthlyVariable * (daysRemaining / totalDaysInMonth);
  }

  const expectedFinal = receivedSoFar + expectedRecurring + expectedVariable;
  
  // Create a confidence band (e.g. +/- 10% based on historical variance, here simplified)
  // Higher expectedVariable = wider range, since variable is less predictable
  const varianceFactor = expectedVariable * 0.3 + expectedRecurring * 0.05;
  const expectedRangeMin = expectedFinal - varianceFactor;
  const expectedRangeMax = expectedFinal + varianceFactor;

  // Overall confidence metric
  const confidence = expectedFinal > 0 
    ? (receivedSoFar + expectedRecurring * 0.9) / expectedFinal 
    : 0;

  return {
    receivedSoFar,
    expectedRecurring,
    expectedVariable,
    expectedFinal,
    expectedRangeMin: Math.max(receivedSoFar, expectedRangeMin), // Can't be less than what we already have
    expectedRangeMax,
    confidence: Math.min(1, Math.max(0, confidence))
  };
};
