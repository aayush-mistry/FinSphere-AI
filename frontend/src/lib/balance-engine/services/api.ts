import { Account, BalanceSnapshot, FinancialPosition, MonthlySummary, Transaction, User } from '../types';
import { mockAccounts, mockTransactions, mockUser } from '../utils/mockData';
import { generateFinancialPosition } from '../calculators/balance';
import { generateMonthlySummary } from '../calculators/transactions';
import { generateDailySnapshots } from '../calculators/snapshots';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class BalanceEngineAPI {
  // Fetch the current user
  static async getUser(): Promise<User> {
    await delay(300);
    return mockUser;
  }

  // Fetch all accounts
  static async getAccounts(): Promise<Account[]> {
    await delay(400);
    return mockAccounts;
  }

  // Fetch all transactions
  static async getTransactions(): Promise<Transaction[]> {
    await delay(500);
    return mockTransactions;
  }

  // Get the complete financial position (balances, net worth, credit)
  static async getFinancialPosition(): Promise<FinancialPosition> {
    const accounts = await this.getAccounts();
    return generateFinancialPosition(accounts);
  }

  // Get current net worth directly
  static async getNetWorth(): Promise<number> {
    const position = await this.getFinancialPosition();
    return position.netWorth;
  }

  // Get the monthly summary for a specific date
  static async getMonthlySummary(date: Date = new Date()): Promise<MonthlySummary> {
    const transactions = await this.getTransactions();
    return generateMonthlySummary(transactions, date);
  }

  // Get a history of balance snapshots
  static async getDailySnapshots(days: number = 30): Promise<BalanceSnapshot[]> {
    const accounts = await this.getAccounts();
    const transactions = await this.getTransactions();
    return generateDailySnapshots(accounts, transactions, days);
  }
}
