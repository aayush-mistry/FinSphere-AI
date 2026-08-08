import { CashPosition } from '../types';
import { Account, AccountType, Transaction } from '../../balance-engine/types';

/**
 * Calculates the cash position (total liquid balance) at specific start and end dates.
 * It does this by starting from the present (current balance) and mathematically
 * reversing the raw transactions to find the precise balance at the target dates.
 */
export function calculateCashPosition(
  startDate: string,
  endDate: string,
  currentAccounts: Account[],
  allTransactions: Transaction[],
  accountId?: string
): CashPosition {
  const liquidAccountTypes = [
    AccountType.CHECKING,
    AccountType.SAVINGS,
    AccountType.CASH,
    AccountType.BUSINESS
  ];

  // Filter accounts
  let targetAccounts = currentAccounts.filter(a => liquidAccountTypes.includes(a.type));
  if (accountId) {
    targetAccounts = targetAccounts.filter(a => a.id === accountId);
  }

  const targetAccountIds = new Set(targetAccounts.map(a => a.id));
  
  // Base current cash balance
  const currentCashBalance = targetAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  // Relevant transactions affecting the cash position
  const relevantTransactions = allTransactions.filter(t => targetAccountIds.has(t.accountId));

  const now = new Date().getTime();
  const startTarget = new Date(startDate).getTime();
  // We want the balance at the end of the day for endDate, so we push it to 23:59:59
  const endTarget = new Date(endDate);
  endTarget.setUTCHours(23, 59, 59, 999);
  const endTargetTime = endTarget.getTime();

  let startingBalance = currentCashBalance;
  let endingBalance = currentCashBalance;

  // Rollback starting balance
  // We need to reverse all transactions that occurred AFTER startTarget
  const txnsAfterStart = relevantTransactions.filter(t => new Date(t.date).getTime() > startTarget);
  const netChangeAfterStart = txnsAfterStart.reduce((sum, t) => sum + t.amount, 0);
  startingBalance = currentCashBalance - netChangeAfterStart;

  // Rollback ending balance
  // We need to reverse all transactions that occurred AFTER endTargetTime
  const txnsAfterEnd = relevantTransactions.filter(t => new Date(t.date).getTime() > endTargetTime);
  const netChangeAfterEnd = txnsAfterEnd.reduce((sum, t) => sum + t.amount, 0);
  endingBalance = currentCashBalance - netChangeAfterEnd;

  return {
    startDate,
    endDate,
    startingBalance,
    endingBalance,
    netChange: endingBalance - startingBalance
  };
}
