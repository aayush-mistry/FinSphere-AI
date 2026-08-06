import { AlertModel, GlobalRiskMetrics, AlertCategory } from './types';
import { Transaction, Account } from '@/engine/types';
import { BillEngineResult } from '@/lib/bill-engine/types';
import { differenceInDays, parseISO } from 'date-fns';

export function runSecurityEvaluations(
  transactions: Transaction[],
  accounts: Account[],
  billEngineResult: BillEngineResult
): { alerts: AlertModel[], metrics: GlobalRiskMetrics } {
  const alerts: AlertModel[] = [];
  const now = new Date().toISOString();

  // 1. Credit Utilization Anomaly
  accounts.filter(a => a.type === 'credit_card' && a.limit).forEach(card => {
    const limit = card.limit!;
    const balance = Math.abs(card.balance);
    const utilization = balance / limit;

    if (utilization > 0.45) { // Threshold: 45%
      alerts.push({
        id: `alt-credit-${card.id}`,
        title: 'High Credit Utilization',
        description: `${card.name} utilization is at ${(utilization * 100).toFixed(0)}%.`,
        category: 'credit',
        severity: utilization > 0.8 ? 'critical' : 'high',
        riskScore: utilization * 100,
        confidenceScore: 1.0,
        financialImpact: balance,
        reason: 'High credit utilization negatively impacts your credit score.',
        suggestedAction: 'Pay down the balance before the statement closes.',
        affectedAccounts: [card.id],
        timestamp: now,
        status: 'active',
        aiExplanation: `Your credit card utilization on ${card.name} has exceeded the recommended 30% threshold. Currently sitting at ${(utilization * 100).toFixed(0)}%, this indicates high reliance on credit and will likely cause a dip in your credit score if reported.`,
        recommendations: [
          {
            priority: 'high',
            confidence: 0.95,
            estimatedSavings: 0, // Hard to quantify credit score drop accurately here
            estimatedFinancialImpact: balance,
            reason: 'Paying down the balance reduces utilization and saves on interest.',
            actionPlan: `Make a payment of at least $${(balance - (limit * 0.3)).toFixed(0)} to bring utilization back to the safe 30% zone.`
          }
        ]
      });
    }
  });

  // 2. Fraud / Duplicate Transaction Anomaly Detection
  // Simple O(N^2) check for identical amounts on same day for same merchant
  const recentTxns = transactions.filter(t => differenceInDays(new Date(), parseISO(t.date)) <= 7);
  for (let i = 0; i < recentTxns.length; i++) {
    for (let j = i + 1; j < recentTxns.length; j++) {
      const t1 = recentTxns[i];
      const t2 = recentTxns[j];
      if (t1.amount === t2.amount && t1.merchant === t2.merchant && t1.accountId === t2.accountId) {
        alerts.push({
          id: `alt-fraud-${t1.id}-${t2.id}`,
          title: 'Possible Duplicate Transaction',
          description: `Two identical charges of $${Math.abs(t1.amount)} at ${t1.merchant} detected.`,
          category: 'fraud',
          severity: 'high',
          riskScore: 85,
          confidenceScore: 0.9,
          financialImpact: Math.abs(t1.amount),
          reason: 'Identical charges closely spaced in time often indicate an accidental double-swipe or billing error.',
          suggestedAction: 'Review the transactions and contact the merchant if necessary.',
          affectedAccounts: [t1.accountId],
          relatedTransactions: [t1.id, t2.id],
          timestamp: now,
          status: 'active',
          aiExplanation: `I noticed two exact identical charges for $${Math.abs(t1.amount)} at ${t1.merchant}. While some merchants split shipments, this strongly resembles a point-of-sale terminal error or a double-click on an online checkout.`,
          recommendations: [
            {
              priority: 'high',
              confidence: 0.9,
              estimatedSavings: Math.abs(t1.amount),
              estimatedFinancialImpact: Math.abs(t1.amount),
              reason: 'Reversing a duplicate charge restores your cash balance immediately.',
              actionPlan: `Contact ${t1.merchant} support to confirm if this was an error. If they cannot resolve it, file a chargeback dispute with your bank.`
            }
          ]
        });
      }
    }
  }

  // 3. Import Bill Engine Overdraft Risks (Bridging the Engines)
  const billNegatives = billEngineResult.cashFlowForecast.filter(p => p.projectedBalance < 0);
  if (billNegatives.length > 0) {
    const firstDrop = billNegatives[0];
    alerts.push({
      id: `alt-cf-overdraft`,
      title: 'Overdraft Risk Predicted',
      description: `Account balance projected to drop to $${firstDrop.projectedBalance.toFixed(0)} by ${firstDrop.date}.`,
      category: 'cash_flow',
      severity: 'critical',
      riskScore: 98,
      confidenceScore: 0.95,
      financialImpact: Math.abs(firstDrop.projectedBalance),
      reason: 'Upcoming bill payments exceed your current liquid balance prior to your next salary deposit.',
      suggestedAction: 'Reschedule AutoPays or transfer funds from savings.',
      affectedAccounts: [], // all checking implicitly
      timestamp: now,
      status: 'active',
      aiExplanation: `By analyzing your upcoming bills against your expected income dates, I project your checking account will go negative by ${firstDrop.date}. Your bills are front-loaded before your salary arrives.`,
      recommendations: [
        {
          priority: 'critical',
          confidence: 0.95,
          estimatedSavings: 35, // Typical overdraft fee
          estimatedFinancialImpact: Math.abs(firstDrop.projectedBalance),
          reason: 'Avoiding overdraft prevents expensive bank fees and bounced payments.',
          actionPlan: 'Transfer funds from your High Yield Savings, or log into your biller portals to push the due dates back by 3-5 days.'
        }
      ]
    });
  }

  // Calculate Global Metrics
  let overallRiskScore = 0;
  let criticalCount = 0;
  let highCount = 0;
  const distribution: Record<AlertCategory, number> = {
    cash_flow: 0, bills: 0, loans: 0, investments: 0, savings: 0, credit: 0, insurance: 0, taxes: 0, fraud: 0, business: 0
  };

  alerts.forEach(a => {
    overallRiskScore = Math.max(overallRiskScore, a.riskScore); // Risk score of dashboard is max of individual risks
    if (a.severity === 'critical') criticalCount++;
    if (a.severity === 'high') highCount++;
    if (distribution[a.category] !== undefined) {
      distribution[a.category]++;
    }
  });

  return {
    alerts,
    metrics: {
      overallRiskScore,
      criticalAlertsCount: criticalCount,
      highAlertsCount: highCount,
      categoryDistribution: distribution
    }
  };
}
