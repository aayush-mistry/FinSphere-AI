import { useQuery } from '@tanstack/react-query';
import { BillsClientAPI } from '../services/client-api';
import { BillReconciliationStatus } from '../types';

export function useBillsReconciliation(userId: number, startDate: string, endDate: string, statusFilter?: BillReconciliationStatus | 'ALL') {
  return useQuery({
    queryKey: ['bill-reconciliation', userId, startDate, endDate, statusFilter],
    queryFn: () => BillsClientAPI.getBillReconciliation(userId, startDate, endDate, statusFilter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
