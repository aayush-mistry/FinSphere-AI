import { useQuery } from '@tanstack/react-query';
import { CashFlowClientAPI } from '../services/client-api';

export function useCashFlowSummary(params: { start_date: string; end_date: string; account?: string }) {
  return useQuery({
    queryKey: ['cashflow', 'summary', params],
    queryFn: () => CashFlowClientAPI.getSummary(params)
  });
}

export function useCashFlowTrends(params: { start_date: string; end_date: string; period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' }) {
  return useQuery({
    queryKey: ['cashflow', 'trends', params],
    queryFn: () => CashFlowClientAPI.getTrends(params)
  });
}

export function useCashFlowReconciliation(params: { start_date: string; end_date: string; account?: string }) {
  return useQuery({
    queryKey: ['cashflow', 'reconciliation', params],
    queryFn: () => CashFlowClientAPI.getReconciliation(params)
  });
}

export function useCashFlowAllocation(params: { start_date: string; end_date: string; account?: string }) {
  return useQuery({
    queryKey: ['cashflow', 'allocation', params],
    queryFn: () => CashFlowClientAPI.getAllocation(params)
  });
}

export function useCashFlowComparison(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['cashflow', 'comparison', params],
    queryFn: () => CashFlowClientAPI.getComparison(params)
  });
}

export function useCashFlowInsights(params: { start_date: string; end_date: string; account?: string }) {
  return useQuery({
    queryKey: ['cashflow', 'insights', params],
    queryFn: () => CashFlowClientAPI.getInsights(params)
  });
}

export function useRecentCashFlow(params: { limit?: number; account?: string } = {}) {
  return useQuery({
    queryKey: ['cashflow', 'recent', params],
    queryFn: () => CashFlowClientAPI.getRecent(params)
  });
}
