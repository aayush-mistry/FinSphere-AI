import { useQuery } from '@tanstack/react-query';
import { IncomeClientAPI } from '../services/client-api';

export function useIncomeSummary(params: {
  currentMonthStart: string;
  currentMonthEnd: string;
  previousMonthStart: string;
  previousMonthEnd: string;
  currentYearStart: string;
  currentYearEnd: string;
}) {
  return useQuery({
    queryKey: ['income', 'summary', params],
    queryFn: () => IncomeClientAPI.getSummary(params)
  });
}

export function useIncomeSources(params: {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
}) {
  return useQuery({
    queryKey: ['income', 'sources', params],
    queryFn: () => IncomeClientAPI.getSources(params)
  });
}

export function useIncomeTypes(params: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['income', 'types', params],
    queryFn: () => IncomeClientAPI.getTypes(params)
  });
}

export function useIncomeTrends(params: {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['income', 'trends', params],
    queryFn: () => IncomeClientAPI.getTrends(params)
  });
}

export function useRecurringIncome() {
  return useQuery({
    queryKey: ['income', 'recurring'],
    queryFn: () => IncomeClientAPI.getRecurring()
  });
}


export function useIncomeAnomalies(params: {
  recentStartDate: string;
  recentEndDate: string;
  historicalStartDate: string;
  historicalEndDate: string;
}) {
  return useQuery({
    queryKey: ['income', 'anomalies', params],
    queryFn: () => IncomeClientAPI.getAnomalies(params)
  });
}

export function useIncomeForecast(params: {
  currentMonthStart: string;
  currentMonthEnd: string;
  historicalStartDate: string;
  historicalEndDate: string;
}) {
  return useQuery({
    queryKey: ['income', 'forecast', params],
    queryFn: () => IncomeClientAPI.getForecast(params)
  });
}

export function useRecentIncome(limit: number = 10) {
  return useQuery({
    queryKey: ['income', 'recent', limit],
    queryFn: () => IncomeClientAPI.getRecent(limit)
  });
}
