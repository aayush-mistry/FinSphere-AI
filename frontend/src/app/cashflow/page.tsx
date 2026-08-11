'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CashFlowHeader } from '@/lib/cashflow-engine/components/CashFlowHeader';
import { CashFlowSummaryCards } from '@/lib/cashflow-engine/components/CashFlowSummaryCards';
import { CashFlowTrendChart } from '@/lib/cashflow-engine/components/CashFlowTrendChart';
import { CashFlowReconciliation } from '@/lib/cashflow-engine/components/CashFlowReconciliation';
import { CashFlowComparison } from '@/lib/cashflow-engine/components/CashFlowComparison';
import { CashFlowInsightsCard } from '@/lib/cashflow-engine/components/CashFlowInsightsCard';
import { RecentCashMovements } from '@/lib/cashflow-engine/components/RecentCashMovements';
import { FinancialOutlook } from '@/lib/cashflow-engine/components/FinancialOutlook';

const queryClient = new QueryClient();

export default function CashFlowPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CashFlowWorkspace />
    </QueryClientProvider>
  );
}

function CashFlowWorkspace() {
  // We use deterministic dates for the mock data context (August 2026)
  // In a real app, this state would be updated by the CashFlowHeader date picker
  const [dateRange, setDateRange] = useState({
    startDate: '2026-08-01',
    endDate: '2026-08-31'
  });
  
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      <CashFlowHeader 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        period={period} 
        setPeriod={setPeriod} 
      />

      {/* Phase 6.4B: Financial Outlook */}
      <FinancialOutlook userId={1} />

      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Historical Cash Flow Analysis</h3>
      </div>

      {/* Primary KPI Summary */}
      <CashFlowSummaryCards 
        startDate={dateRange.startDate} 
        endDate={dateRange.endDate} 
      />

      {/* Main Trend Chart */}
      <div className="grid gap-4 grid-cols-1">
        <CashFlowTrendChart 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate} 
          period={period}
        />
      </div>

      {/* Cash Position & Money Allocation */}
      <div className="grid gap-4 grid-cols-1">
        <CashFlowReconciliation 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate} 
        />
      </div>

      {/* Split grid: Insights and Monthly Performance */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <CashFlowInsightsCard 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate} 
        />
        <CashFlowComparison 
          startDate={'2026-01-01'} // Broad history for comparison
          endDate={dateRange.endDate} 
        />
      </div>

      {/* Recent Cash Flow events */}
      <div className="grid gap-4 grid-cols-1">
        <RecentCashMovements />
      </div>
    </div>
  );
}
