import { useQuery } from '@tanstack/react-query';
import { BalanceEngineAPI } from '../services/api';

export const useUser = () => {
  return useQuery({
    queryKey: ['balance-engine', 'user'],
    queryFn: () => BalanceEngineAPI.getUser()
  });
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['balance-engine', 'accounts'],
    queryFn: () => BalanceEngineAPI.getAccounts()
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['balance-engine', 'transactions'],
    queryFn: () => BalanceEngineAPI.getTransactions()
  });
};

export const useFinancialPosition = () => {
  return useQuery({
    queryKey: ['balance-engine', 'financial-position'],
    queryFn: () => BalanceEngineAPI.getFinancialPosition()
  });
};

export const useNetWorth = () => {
  return useQuery({
    queryKey: ['balance-engine', 'net-worth'],
    queryFn: () => BalanceEngineAPI.getNetWorth()
  });
};

export const useMonthlySummary = (date?: Date) => {
  return useQuery({
    queryKey: ['balance-engine', 'monthly-summary', date?.toISOString()],
    queryFn: () => BalanceEngineAPI.getMonthlySummary(date)
  });
};

export const useDailySnapshots = (days: number = 30) => {
  return useQuery({
    queryKey: ['balance-engine', 'daily-snapshots', days],
    queryFn: () => BalanceEngineAPI.getDailySnapshots(days)
  });
};
