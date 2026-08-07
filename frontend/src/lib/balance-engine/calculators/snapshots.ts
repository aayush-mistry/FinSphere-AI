import { Account, BalanceSnapshot, Transaction } from '../types';
import { calculateNetWorth } from './balance';
import { calculateIncome, calculateExpenses, calculateSavings, calculateCashFlow } from './transactions';

export const generateDailySnapshots = (accounts: Account[], transactions: Transaction[], days: number): BalanceSnapshot[] => {
  const snapshots: BalanceSnapshot[] = [];
  const today = new Date();
  
  // Base current net worth
  let currentNetWorth = calculateNetWorth(accounts);
  
  // Sort transactions descending by date to walk backwards
  const sortedTxns = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateString = targetDate.toISOString().split('T')[0];
    
    // Find transactions for this specific day
    const dailyTxns = sortedTxns.filter(t => t.date.startsWith(dateString));
    
    const income = calculateIncome(dailyTxns);
    const expenses = calculateExpenses(dailyTxns);
    const savings = calculateSavings(dailyTxns);
    const cashFlow = calculateCashFlow(income, expenses);
    
    snapshots.push({
      date: dateString,
      balance: currentNetWorth, // Approximate balance for the day
      income,
      expenses,
      savings,
      cashFlow,
      netWorth: currentNetWorth,
      transactionCount: dailyTxns.length
    });
    
    // Reverse the cash flow to get the previous day's net worth
    // If I had a cash flow of +100 today, yesterday my net worth was (current - 100)
    currentNetWorth -= cashFlow;
  }
  
  return snapshots.reverse(); // Return in chronological order
};
