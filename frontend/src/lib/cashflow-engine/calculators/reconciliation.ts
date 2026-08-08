import { Account, AccountType, Transaction } from '../../balance-engine/types';
import { CashFlowReconciliation } from '../types';
import { classifyCashFlowTransaction } from './classification';
import { CashFlowSubClass } from '../types';

export function calculateDebtReduction(
  startDate: string,
  endDate: string,
  currentAccounts: Account[],
  allTransactions: Transaction[],
  accountId?: string
): number {
  const debtAccountTypes = [AccountType.CREDIT_CARD, AccountType.LOAN];
  
  let targetAccounts = currentAccounts.filter(a => debtAccountTypes.includes(a.type));
  if (accountId) {
    targetAccounts = targetAccounts.filter(a => a.id === accountId);
  }
  
  const targetAccountIds = new Set(targetAccounts.map(a => a.id));
  
  const currentDebtBalance = targetAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  
  const relevantTransactions = allTransactions.filter(t => targetAccountIds.has(t.accountId));

  const startTarget = new Date(startDate).getTime();
  const endTarget = new Date(endDate);
  endTarget.setUTCHours(23, 59, 59, 999);
  const endTargetTime = endTarget.getTime();

  let startingBalance = currentDebtBalance;
  let endingBalance = currentDebtBalance;

  const txnsAfterStart = relevantTransactions.filter(t => new Date(t.date).getTime() > startTarget);
  const netChangeAfterStart = txnsAfterStart.reduce((sum, t) => sum + t.amount, 0);
  startingBalance = currentDebtBalance - netChangeAfterStart;

  const txnsAfterEnd = relevantTransactions.filter(t => new Date(t.date).getTime() > endTargetTime);
  const netChangeAfterEnd = txnsAfterEnd.reduce((sum, t) => sum + t.amount, 0);
  endingBalance = currentDebtBalance - netChangeAfterEnd;

  // Since debt balances are negative (e.g. -45000), starting debt is negative.
  // If we paid off debt, ending balance is closer to 0 (e.g. -15000).
  // Debt Reduction = endingBalance - startingBalance 
  // Wait, if start is -45000 and end is -15000, ending - starting = -15000 - (-45000) = +30000.
  // That means debt was reduced by 30000. So Debt Reduction = endingBalance - startingBalance.
  return endingBalance - startingBalance;
}

export function calculateInvestmentContributions(
  startDate: string,
  endDate: string,
  allTransactions: Transaction[]
): number {
  const startTarget = new Date(startDate).getTime();
  const endTarget = new Date(endDate);
  endTarget.setUTCHours(23, 59, 59, 999);
  const endTargetTime = endTarget.getTime();

  const periodTxns = allTransactions.filter(t => {
    const time = new Date(t.date).getTime();
    return time >= startTarget && time <= endTargetTime;
  });

  let contributions = 0;
  for (const t of periodTxns) {
    const classification = classifyCashFlowTransaction(t);
    // If it's a contribution (money leaving an account to go to investment)
    if (classification.subClass === CashFlowSubClass.INVESTMENT_CONTRIBUTION) {
      // It will usually appear as a negative transaction in the checking account
      if (t.amount < 0) {
        contributions += Math.abs(t.amount);
      } else if (t.amount > 0 && t.type === 'Investment Purchase' && !t.accountId) {
        // Just in case it's recorded differently
        contributions += t.amount;
      }
    } else if (classification.subClass === CashFlowSubClass.INVESTMENT_WITHDRAWAL) {
      if (t.amount > 0) {
        // If it's a withdrawal coming into checking, it's a negative contribution
        contributions -= t.amount;
      }
    }
  }

  return contributions;
}

export function generateReconciliation(
  netCashFlow: number,
  cashPositionChange: number,
  investmentContributions: number,
  debtReduction: number
): CashFlowReconciliation {
  
  const difference = netCashFlow - (cashPositionChange + investmentContributions + debtReduction);
  
  return {
    netCashFlow,
    cashPositionChange,
    investmentContributions,
    debtReduction,
    reconciled: Math.abs(difference) < 1,
    difference
  };
}
