import { BalanceEngineAPI } from '../../balance-engine/services/api';
import { Expense } from '../types';
import { filterExpenses } from '../calculators/classifier';
import { generateExpenseSummary } from '../calculators/summary';
import { generateCategoryAnalytics } from '../calculators/analytics';
import { generateExpenseTrends } from '../calculators/trends';
import { detectRecurringExpenses } from '../calculators/recurring';
import { detectAnomalies } from '../calculators/anomalies';
import { calculateForecast } from '../calculators/forecast';

export class ExpenseEngineAPI {
  /**
   * Retrieves all expenses mapped from transactions.
   */
  static async getExpenses(): Promise<Expense[]> {
    const transactions = await BalanceEngineAPI.getTransactions();
    return filterExpenses(transactions);
  }

  /**
   * Retrieves expenses within a specific date range.
   */
  static async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return expenses.filter(e => {
      const d = new Date(e.date).getTime();
      return d >= start && d <= end;
    });
  }

  static async getSummary(startDate: string, endDate: string) {
    const expenses = await this.getExpensesByDateRange(startDate, endDate);
    return generateExpenseSummary(expenses, startDate, endDate);
  }

  static async getCategories(currentStartDate: string, currentEndDate: string, previousStartDate: string, previousEndDate: string) {
    const currentExpenses = await this.getExpensesByDateRange(currentStartDate, currentEndDate);
    const previousExpenses = await this.getExpensesByDateRange(previousStartDate, previousEndDate);
    return generateCategoryAnalytics(currentExpenses, previousExpenses);
  }

  static async getTrends(periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', startDate?: string, endDate?: string) {
    let expenses = await this.getExpenses();
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      expenses = expenses.filter(e => {
        const d = new Date(e.date).getTime();
        return d >= start && d <= end;
      });
    }
    return generateExpenseTrends(expenses, periodType);
  }

  static async getRecurring() {
    const expenses = await this.getExpenses();
    return detectRecurringExpenses(expenses);
  }

  static async getAnomalies(recentStartDate: string, recentEndDate: string, historicalStartDate: string, historicalEndDate: string) {
    const recentExpenses = await this.getExpensesByDateRange(recentStartDate, recentEndDate);
    const historicalExpenses = await this.getExpensesByDateRange(historicalStartDate, historicalEndDate);
    return detectAnomalies(recentExpenses, historicalExpenses);
  }

  static async getForecast(currentMonthStartDate: string, currentMonthEndDate: string) {
    const currentMonthExpenses = await this.getExpensesByDateRange(currentMonthStartDate, currentMonthEndDate);
    
    // Calculate historical monthly totals
    const trends = await this.getTrends('MONTHLY');
    // Exclude the current month from historical average calculation
    const currentMonthPrefix = currentMonthStartDate.substring(0, 7); // 'YYYY-MM'
    const historicalTotals = trends.dataPoints
      .filter(dp => dp.date !== currentMonthPrefix)
      .map(dp => dp.amount);

    return calculateForecast(currentMonthExpenses, historicalTotals);
  }
}
