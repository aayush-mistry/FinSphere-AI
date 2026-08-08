import { useQuery } from '@tanstack/react-query';
import { ExpenseClientAPI } from '../services/client-api';

export const useExpenseSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['expenses', 'summary', startDate, endDate],
    queryFn: () => ExpenseClientAPI.getSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useExpenseCategories = (
  currentStartDate: string, 
  currentEndDate: string, 
  previousStartDate: string, 
  previousEndDate: string
) => {
  return useQuery({
    queryKey: ['expenses', 'categories', currentStartDate, currentEndDate, previousStartDate, previousEndDate],
    queryFn: () => ExpenseClientAPI.getCategories(currentStartDate, currentEndDate, previousStartDate, previousEndDate),
    enabled: !!currentStartDate && !!currentEndDate && !!previousStartDate && !!previousEndDate,
  });
};

export const useExpenseTrends = (
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', 
  startDate?: string, 
  endDate?: string
) => {
  return useQuery({
    queryKey: ['expenses', 'trends', periodType, startDate, endDate],
    queryFn: () => ExpenseClientAPI.getTrends(periodType, startDate, endDate),
  });
};

export const useRecurringExpenses = () => {
  return useQuery({
    queryKey: ['expenses', 'recurring'],
    queryFn: () => ExpenseClientAPI.getRecurring(),
  });
};

export const useExpenseAnomalies = (
  recentStartDate: string, 
  recentEndDate: string, 
  historicalStartDate: string, 
  historicalEndDate: string
) => {
  return useQuery({
    queryKey: ['expenses', 'anomalies', recentStartDate, recentEndDate, historicalStartDate, historicalEndDate],
    queryFn: () => ExpenseClientAPI.getAnomalies(recentStartDate, recentEndDate, historicalStartDate, historicalEndDate),
    enabled: !!recentStartDate && !!recentEndDate && !!historicalStartDate && !!historicalEndDate,
  });
};

export const useExpenseForecast = (
  currentMonthStartDate: string, 
  currentMonthEndDate: string
) => {
  return useQuery({
    queryKey: ['expenses', 'forecast', currentMonthStartDate, currentMonthEndDate],
    queryFn: () => ExpenseClientAPI.getForecast(currentMonthStartDate, currentMonthEndDate),
    enabled: !!currentMonthStartDate && !!currentMonthEndDate,
  });
};

export const useRecentExpenses = (limit: number = 10) => {
  return useQuery({
    queryKey: ['expenses', 'recent', limit],
    queryFn: () => ExpenseClientAPI.getRecent(limit),
  });
};
