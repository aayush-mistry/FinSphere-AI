import { useState, useMemo } from 'react';
import { AlertModel, AlertEngineResult } from '../types';
import { runSecurityEvaluations } from '../evaluators';
import { useBillEngine } from '@/lib/bill-engine/hooks/useBillEngine';
import { mockBillsExtended, mockIncomes, mockCurrentLiquidBalance } from '@/lib/bill-engine/mockData';
import { mockAccounts, mockTransactions } from '@/engine/adapters/mockData';

export function useAlertEngine() {
  // In a real app, these would come from global context or React Query
  // We're bridging the BillEngine explicitly here to get cross-domain insights
  const billEngine = useBillEngine(mockBillsExtended, mockIncomes, mockCurrentLiquidBalance);
  
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  const engineResult: AlertEngineResult = useMemo(() => {
    const { alerts, metrics } = runSecurityEvaluations(mockTransactions, mockAccounts, billEngine.engineResult);
    
    // Filter out resolved or ignored alerts from the active list
    const activeAlerts = alerts.filter(a => !resolvedIds.has(a.id) && !ignoredIds.has(a.id));

    return {
      alerts: activeAlerts,
      metrics
    };
  }, [billEngine.engineResult, resolvedIds, ignoredIds]);

  const resolveAlert = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const ignoreAlert = (id: string) => {
    setIgnoredIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return {
    engineResult,
    resolveAlert,
    ignoreAlert
  };
}
