import { BalanceEngineAPI } from '../../balance-engine/services/api';
import { processIncomeTransactions } from '../calculators/classifier';
import { detectRecurringIncome, analyzeRecurringIncome } from '../calculators/recurring';
import { calculateIncomeSummary } from '../calculators/summary';
import { calculateIncomeSources } from '../calculators/sources';
import { calculateIncomeTrends } from '../calculators/trends';

import { detectIncomeAnomalies } from '../calculators/anomalies';
import { calculateIncomeForecast } from '../calculators/forecast';
import { 
  IncomeTransaction, 
  IncomeSourceAnalytics, 
  IncomeTypeSummary,
  IncomeSummary,
  IncomeTrend,
  RecurringIncomeDetail,

  IncomeAnomaly,
  IncomeForecast
} from '../types';

export class IncomeEngineAPI {
  /**
   * Retrieves and processes all income transactions from the balance engine.
   */
  static async getIncomeTransactions(
    startDate?: string, 
    endDate?: string,
    type?: string,
    source?: string
  ): Promise<IncomeTransaction[]> {
    const rawTransactions = await BalanceEngineAPI.getTransactions();
    let incomeTransactions = processIncomeTransactions(rawTransactions);
    incomeTransactions = detectRecurringIncome(incomeTransactions);

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      incomeTransactions = incomeTransactions.filter(t => {
        const d = new Date(t.date).getTime();
        return d >= start && d <= end;
      });
    }

    if (type) {
      incomeTransactions = incomeTransactions.filter(t => t.incomeClassification.type === type);
    }

    if (source) {
      incomeTransactions = incomeTransactions.filter(t => t.incomeClassification.source === source);
    }

    return incomeTransactions;
  }

  static async getSummary(currentMonthStart: string, currentMonthEnd: string, previousMonthStart: string, previousMonthEnd: string, currentYearStart: string, currentYearEnd: string): Promise<IncomeSummary> {
    const current = await this.getIncomeTransactions(currentMonthStart, currentMonthEnd);
    const prev = await this.getIncomeTransactions(previousMonthStart, previousMonthEnd);
    const year = await this.getIncomeTransactions(currentYearStart, currentYearEnd);
    return calculateIncomeSummary(current, prev, year);
  }

  static async getSources(currentStartDate: string, currentEndDate: string, previousStartDate: string, previousEndDate: string): Promise<IncomeSourceAnalytics[]> {
    const current = await this.getIncomeTransactions(currentStartDate, currentEndDate);
    const previous = await this.getIncomeTransactions(previousStartDate, previousEndDate);
    return calculateIncomeSources(current, previous);
  }

  static async getTypes(startDate?: string, endDate?: string): Promise<IncomeTypeSummary[]> {
    const transactions = await this.getIncomeTransactions(startDate, endDate);
    const typeMap = new Map<string, IncomeTypeSummary>();
    let totalIncome = 0;

    for (const txn of transactions) {
      const type = txn.incomeClassification.type;
      const group = txn.incomeClassification.group;
      const amount = txn.amount;

      totalIncome += amount;

      if (!typeMap.has(type)) {
        typeMap.set(type, {
          type,
          group,
          totalAmount: 0,
          percentageOfTotal: 0
        });
      }

      const summary = typeMap.get(type)!;
      summary.totalAmount += amount;
    }

    const summaries = Array.from(typeMap.values());
    if (totalIncome > 0) {
      summaries.forEach(s => {
        s.percentageOfTotal = (s.totalAmount / totalIncome) * 100;
      });
    }

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static async getTrends(periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY', startDate?: string, endDate?: string): Promise<IncomeTrend> {
    const transactions = await this.getIncomeTransactions(startDate, endDate);
    return calculateIncomeTrends(transactions, periodType);
  }

  static async getRecurring(): Promise<RecurringIncomeDetail[]> {
    const all = await this.getIncomeTransactions();
    return analyzeRecurringIncome(all);
  }



  static async getAnomalies(recentStartDate: string, recentEndDate: string, historicalStartDate: string, historicalEndDate: string): Promise<IncomeAnomaly[]> {
    const recent = await this.getIncomeTransactions(recentStartDate, recentEndDate);
    const historical = await this.getIncomeTransactions(historicalStartDate, historicalEndDate);
    return detectIncomeAnomalies(recent, historical);
  }

  static async getForecast(currentMonthStart: string, currentMonthEnd: string, historicalStartDate: string, historicalEndDate: string): Promise<IncomeForecast> {
    const current = await this.getIncomeTransactions(currentMonthStart, currentMonthEnd);
    const historical = await this.getIncomeTransactions(historicalStartDate, historicalEndDate);
    return calculateIncomeForecast(current, historical, currentMonthStart, currentMonthEnd);
  }
}
