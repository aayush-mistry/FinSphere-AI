import { useState, useMemo } from 'react';
import { BillModel, IncomeEvent, BillEngineContext, BillEngineResult } from '../types';
import { calculateBaseMetrics, generateCashFlowForecast } from '../calculators';
import { runBillAnalysis } from '../analysis';

export function useBillEngine(initialBills: BillModel[], initialIncomes: IncomeEvent[], initialLiquidBalance: number) {
  const [bills, setBills] = useState<BillModel[]>(initialBills);
  const [incomes] = useState<IncomeEvent[]>(initialIncomes);
  const [currentLiquidBalance] = useState<number>(initialLiquidBalance);

  const engineResult: BillEngineResult = useMemo(() => {
    const context: BillEngineContext = {
      currentLiquidBalance,
      bills,
      incomes
    };

    const metrics = calculateBaseMetrics(bills);
    const cashFlowForecast = generateCashFlowForecast(context);
    const { alerts, recommendations } = runBillAnalysis(context, cashFlowForecast);

    return {
      metrics,
      cashFlowForecast,
      alerts,
      recommendations
    };
  }, [bills, incomes, currentLiquidBalance]);

  const toggleAutoPay = (billId: string) => {
    setBills(prev => prev.map(b => b.id === billId ? { ...b, autoPayEnabled: !b.autoPayEnabled } : b));
  };

  const payBillEarly = (billId: string) => {
    // For simulation, just remove it or mark as paid.
    setBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'paid' } : b));
  };

  return {
    bills,
    engineResult,
    toggleAutoPay,
    payBillEarly
  };
}
