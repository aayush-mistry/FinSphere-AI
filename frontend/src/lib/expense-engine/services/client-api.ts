import { 
  CategoryComparison, 
  Expense, 
  ExpenseAnomaly, 
  ExpenseForecast, 
  ExpenseSummary, 
  ExpenseTrend, 
  RecurringExpense 
} from '../types';

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

export const ExpenseClientAPI = {
  getSummary: (startDate: string, endDate: string) => 
    fetcher<ExpenseSummary>(`/api/expenses/summary?startDate=${startDate}&endDate=${endDate}`),
    
  getCategories: (currentStart: string, currentEnd: string, prevStart: string, prevEnd: string) =>
    fetcher<CategoryComparison[]>(`/api/expenses/categories?currentStartDate=${currentStart}&currentEndDate=${currentEnd}&previousStartDate=${prevStart}&previousEndDate=${prevEnd}`),
    
  getTrends: (periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', startDate?: string, endDate?: string) => {
    let url = `/api/expenses/trends?periodType=${periodType}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return fetcher<ExpenseTrend>(url);
  },
  
  getRecurring: () => 
    fetcher<RecurringExpense[]>(`/api/expenses/recurring`),
    
  getAnomalies: (recentStart: string, recentEnd: string, histStart: string, histEnd: string) =>
    fetcher<ExpenseAnomaly[]>(`/api/expenses/anomalies?recentStartDate=${recentStart}&recentEndDate=${recentEnd}&historicalStartDate=${histStart}&historicalEndDate=${histEnd}`),
    
  getForecast: (currentStart: string, currentEnd: string) =>
    fetcher<ExpenseForecast>(`/api/expenses/forecast?currentMonthStartDate=${currentStart}&currentMonthEndDate=${currentEnd}`),
    
  getRecent: (limit: number = 10) =>
    fetcher<Expense[]>(`/api/expenses/recent?limit=${limit}`)
};
