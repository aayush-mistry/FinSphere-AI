import { BillModel, BillMetrics, BillEngineContext, CashFlowPoint } from './types';
import { differenceInDays, parseISO, startOfDay, addDays, isSameDay, format } from 'date-fns';

export function calculateDaysUntilDue(dueDate: string): number {
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDate));
  return differenceInDays(due, today);
}

export function calculateBaseMetrics(bills: BillModel[]): BillMetrics {
  let monthlyBillTotal = 0;
  let yearlyBillProjection = 0;
  let upcomingCashOutflow = 0;
  let lateFeeRiskTotal = 0;

  bills.forEach(bill => {
    // Basic frequency extrapolation
    let monthlyEquiv = bill.amount;
    if (bill.frequency === 'annual') monthlyEquiv = bill.amount / 12;
    if (bill.frequency === 'weekly') monthlyEquiv = bill.amount * 4.33;
    
    monthlyBillTotal += monthlyEquiv;
    yearlyBillProjection += (monthlyEquiv * 12);
    
    const daysUntilDue = calculateDaysUntilDue(bill.dueDate);
    if (daysUntilDue >= 0 && daysUntilDue <= 30) {
      upcomingCashOutflow += bill.amount;
      if (!bill.autoPayEnabled) {
        lateFeeRiskTotal += bill.lateFee;
      }
    }
  });

  return {
    daysUntilDue: bills.length > 0 ? Math.min(...bills.map(b => Math.max(0, calculateDaysUntilDue(b.dueDate)))) : 0,
    monthlyBillTotal,
    yearlyBillProjection,
    upcomingCashOutflow,
    lateFeeRiskTotal,
    overallMonthlyCommitment: monthlyBillTotal
  };
}

export function generateCashFlowForecast(context: BillEngineContext): CashFlowPoint[] {
  const points: CashFlowPoint[] = [];
  const today = startOfDay(new Date());
  let runningBalance = context.currentLiquidBalance;

  for (let i = 0; i <= 30; i++) {
    const targetDate = addDays(today, i);
    const events: CashFlowPoint['events'] = [];

    // Check Incomes
    context.incomes.forEach(inc => {
      if (isSameDay(parseISO(inc.date), targetDate)) {
        runningBalance += inc.amount;
        events.push({ type: 'income', amount: inc.amount, name: inc.name });
      }
    });

    // Check Bills
    context.bills.forEach(bill => {
      if (isSameDay(parseISO(bill.dueDate), targetDate)) {
        runningBalance -= bill.amount;
        events.push({ type: 'bill', amount: -bill.amount, name: bill.name });
      }
    });

    points.push({
      date: format(targetDate, 'MMM dd'),
      dayOffset: i,
      projectedBalance: runningBalance,
      events
    });
  }

  return points;
}
