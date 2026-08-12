import {
  IncomeSummary,
  IncomeSourceAnalytics,
  IncomeTypeSummary,
  IncomeTrend,
  RecurringIncomeDetail,

  IncomeAnomaly,
  IncomeForecast,
  IncomeTransaction
} from '../types';

export const IncomeClientAPI = {
  async getSummary(params: {
    currentMonthStart: string;
    currentMonthEnd: string;
    previousMonthStart: string;
    previousMonthEnd: string;
    currentYearStart: string;
    currentYearEnd: string;
  }): Promise<IncomeSummary> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/income/summary?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income summary');
    return res.json();
  },

  async getSources(params: {
    currentStartDate: string;
    currentEndDate: string;
    previousStartDate: string;
    previousEndDate: string;
  }): Promise<IncomeSourceAnalytics[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/income/sources?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income sources');
    return res.json();
  },

  async getTypes(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<IncomeTypeSummary[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/income/types?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income types');
    return res.json();
  },

  async getTrends(params: {
    periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    startDate?: string;
    endDate?: string;
  }): Promise<IncomeTrend> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/income/trends?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income trends');
    return res.json();
  },

  async getRecurring(): Promise<RecurringIncomeDetail[]> {
    const res = await fetch('/api/income/recurring');
    if (!res.ok) throw new Error('Failed to fetch recurring income');
    return res.json();
  },



  async getAnomalies(params: {
    recentStartDate: string;
    recentEndDate: string;
    historicalStartDate: string;
    historicalEndDate: string;
  }): Promise<IncomeAnomaly[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/income/anomalies?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income anomalies');
    return res.json();
  },

  async getForecast(params: {
    currentMonthStart: string;
    currentMonthEnd: string;
    historicalStartDate: string;
    historicalEndDate: string;
  }): Promise<IncomeForecast> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/income/forecast?${query}`);
    if (!res.ok) throw new Error('Failed to fetch income forecast');
    return res.json();
  },

  async getRecent(limit: number = 10): Promise<IncomeTransaction[]> {
    const res = await fetch(`/api/income/recent?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch recent income');
    return res.json();
  }
};
