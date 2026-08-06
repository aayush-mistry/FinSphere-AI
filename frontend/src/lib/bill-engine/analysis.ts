import { BillEngineContext, SmartAlert, BillRecommendation, CashFlowPoint } from './types';
import { calculateDaysUntilDue } from './calculators';

export function runBillAnalysis(context: BillEngineContext, forecast: CashFlowPoint[]): { alerts: SmartAlert[], recommendations: BillRecommendation[] } {
  const alerts: SmartAlert[] = [];
  const recommendations: BillRecommendation[] = [];

  // 1. Negative Balance Risk (from CashFlow)
  const negativeDays = forecast.filter(p => p.projectedBalance < 0);
  if (negativeDays.length > 0) {
    const firstNegative = negativeDays[0];
    alerts.push({
      id: `alert-neg-${Date.now()}`,
      severity: 'critical',
      reason: `Account balance projected to drop below zero by ${firstNegative.date}.`,
      financialImpact: firstNegative.projectedBalance,
      suggestedAction: 'Transfer funds or delay a non-critical bill payment.',
      confidenceScore: 0.95,
      date: new Date().toISOString()
    });

    // Recommendation based on this
    recommendations.push({
      priority: 'critical',
      confidence: 0.95,
      estimatedFinancialImpact: Math.abs(firstNegative.projectedBalance),
      reason: `Your upcoming salary does not arrive before your scheduled bills, leading to an overdraft risk on ${firstNegative.date}.`,
      actionPlan: `Consider rescheduling AutoPay for bills due between today and ${firstNegative.date}.`
    });
  }

  // 2. Subscription Analysis
  const subs = context.bills.filter(b => b.category === 'subscriptions');
  const subsTotal = subs.reduce((sum, b) => sum + b.amount, 0);
  if (subsTotal > 50) { // arbitrary threshold
    recommendations.push({
      priority: 'medium',
      confidence: 0.8,
      estimatedFinancialImpact: subsTotal,
      reason: `You have ${subs.length} active subscriptions totaling $${subsTotal}/month.`,
      actionPlan: `Audit your subscriptions. Cancelling unused ones could save you $${(subsTotal * 12).toFixed(0)} annually.`
    });
  }

  // 3. Immediate Due Alerts
  context.bills.forEach(bill => {
    const days = calculateDaysUntilDue(bill.dueDate);
    if (days >= 0 && days <= 5) {
      alerts.push({
        id: `alert-due-${bill.id}`,
        severity: days <= 2 ? 'high' : 'medium',
        reason: `${bill.name} is due in ${days} days.`,
        financialImpact: bill.amount,
        suggestedAction: bill.autoPayEnabled ? 'Ensure sufficient balance for AutoPay.' : 'Schedule payment immediately.',
        confidenceScore: 1.0,
        date: new Date().toISOString()
      });
    }
  });

  return { alerts, recommendations };
}
