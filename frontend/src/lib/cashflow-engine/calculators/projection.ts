import { addDays, format, parseISO, isSameDay } from 'date-fns';
import { CashFlowProjection, CashFlowTimelinePoint, CashFlowEvent } from '../types';
import { UpcomingBillOccurrence } from '../../bills-engine/types';

export function calculateCashFlowProjection(
  startingCash: number,
  expectedMonthlyIncome: number,
  expectedMonthlyNonBillExpense: number,
  upcomingBills: UpcomingBillOccurrence[],
  horizonDays: number,
  referenceDateStr: string,
  incomeProjectionAvailable: boolean
): CashFlowProjection {
  
  // Normalized daily rates
  const dailyIncome = expectedMonthlyIncome / 30;
  const dailyExpense = Math.max(0, expectedMonthlyNonBillExpense) / 30;
  
  const referenceDate = parseISO(referenceDateStr);
  const timeline: CashFlowTimelinePoint[] = [];
  const events: CashFlowEvent[] = [];
  
  let currentCash = startingCash;
  let minProjectedCash = startingCash;
  let minCashDate: string | null = null;
  let cashShortfall = startingCash < 0;
  let shortfallAmount = startingCash < 0 ? Math.abs(startingCash) : 0;
  let shortfallDate: string | undefined = startingCash < 0 ? referenceDateStr : undefined;
  
  let projectedIncomeSum = 0;
  let projectedExpenseSum = 0;
  let projectedBillsSum = 0;

  for (let d = 0; d <= horizonDays; d++) {
    const currentDate = addDays(referenceDate, d);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Create the day's timeline point
    const dailyEvents: CashFlowEvent[] = [];
    
    // Only apply daily rates if d > 0, because day 0 is the starting point (reference date end of day)
    if (d > 0) {
      if (incomeProjectionAvailable) {
        currentCash += dailyIncome;
        projectedIncomeSum += dailyIncome;
      }
      
      currentCash -= dailyExpense;
      projectedExpenseSum += dailyExpense;
    }
    
    // Find bills occurring on this EXACT day
    const billsToday = upcomingBills.filter(b => {
      // due_date from API is typically 'YYYY-MM-DD'
      // If it contains time, slice it
      const bDateStr = b.due_date.substring(0, 10);
      return bDateStr === dateStr;
    });
    
    for (const bill of billsToday) {
      currentCash -= bill.amount;
      projectedBillsSum += bill.amount;
      
      const event: CashFlowEvent = {
        date: dateStr,
        type: 'BILL',
        description: bill.bill_name,
        amount: -bill.amount
      };
      dailyEvents.push(event);
      events.push(event);
    }
    
    // If we want to record the "steady" inflow/outflow, we could add pseudo-events, 
    // but the prompt says "Do not create fake transaction IDs. Represent future events explicitly. For normal projected spending: Use the existing expense projection representation."
    // We'll keep events to discrete things like Bills and Salary (if we had discrete salary). For daily variable we just adjust the balance.
    
    if (currentCash < minProjectedCash) {
      minProjectedCash = currentCash;
      minCashDate = dateStr;
    }
    
    if (currentCash < 0 && !cashShortfall) {
      cashShortfall = true;
      shortfallAmount = Math.abs(currentCash);
      shortfallDate = dateStr;
    }
    
    timeline.push({
      date: dateStr,
      balance: currentCash,
      events: dailyEvents
    });
  }

  return {
    reference_date: referenceDateStr,
    horizon_days: horizonDays,
    starting_cash: startingCash,
    projected_income: incomeProjectionAvailable ? projectedIncomeSum : 0,
    projected_expenses: projectedExpenseSum,
    projected_bills: projectedBillsSum,
    ending_cash: currentCash,
    minimum_projected_cash: minProjectedCash,
    minimum_cash_date: minCashDate,
    cash_shortfall: cashShortfall,
    shortfall_amount: cashShortfall ? shortfallAmount : undefined,
    shortfall_date: shortfallDate,
    income_projection_available: incomeProjectionAvailable,
    events,
    timeline
  };
}
