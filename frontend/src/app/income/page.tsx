'use client';

import React, { useState } from 'react';
import { IncomeSummary } from '@/lib/income-engine/components/IncomeSummary';
import { IncomeTrendChart } from '@/lib/income-engine/components/IncomeTrendChart';
import { IncomeSources } from '@/lib/income-engine/components/IncomeSources';
import { IncomeTypeBreakdown } from '@/lib/income-engine/components/IncomeTypeBreakdown';
import { RecurringIncome } from '@/lib/income-engine/components/RecurringIncome';
import { IncomeAnomalies } from '@/lib/income-engine/components/IncomeAnomalies';
import { IncomeForecast } from '@/lib/income-engine/components/IncomeForecast';
import { RecentIncomeTable } from '@/lib/income-engine/components/RecentIncomeTable';
import { IncomeFilters } from '@/lib/income-engine/components/IncomeFilters';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function IncomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <IncomeWorkspace />
    </QueryClientProvider>
  );
}

function IncomeWorkspace() {
  const [periodType, setPeriodType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Using deterministic dates for the context of Phase 2 (August 2026)
  const dates = {
    currentMonthStart: '2026-08-01T00:00:00Z',
    currentMonthEnd: '2026-08-31T23:59:59Z',
    previousMonthStart: '2026-07-01T00:00:00Z',
    previousMonthEnd: '2026-07-31T23:59:59Z',
    currentYearStart: '2026-01-01T00:00:00Z',
    currentYearEnd: '2026-12-31T23:59:59Z',
    historicalStartDate: '2026-01-01T00:00:00Z',
    historicalEndDate: '2026-07-31T23:59:59Z'
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Income Workspace</h2>
      </div>

      <IncomeFilters periodType={periodType} setPeriodType={setPeriodType} />

      {/* Primary summary metrics */}
      <IncomeSummary 
        currentMonthStart={dates.currentMonthStart}
        currentMonthEnd={dates.currentMonthEnd}
        previousMonthStart={dates.previousMonthStart}
        previousMonthEnd={dates.previousMonthEnd}
        currentYearStart={dates.currentYearStart}
        currentYearEnd={dates.currentYearEnd}
      />

      {/* Trend chart full width */}
      <div className="grid gap-4 grid-cols-1">
        <IncomeTrendChart 
          periodType={periodType} 
          startDate={dates.currentYearStart} 
          endDate={dates.currentMonthEnd} 
        />
      </div>

      {/* Split grid: Sources and Types */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <IncomeSources 
          currentStartDate={dates.currentMonthStart}
          currentEndDate={dates.currentMonthEnd}
          previousStartDate={dates.previousMonthStart}
          previousEndDate={dates.previousMonthEnd}
        />
        <IncomeTypeBreakdown 
          startDate={dates.currentMonthStart}
          endDate={dates.currentMonthEnd}
        />
      </div>

      {/* Recurring */}
      <div className="grid gap-4 grid-cols-1">
        <RecurringIncome />
      </div>

      {/* Anomalies and Forecast */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <IncomeAnomalies 
          recentStartDate={dates.currentMonthStart}
          recentEndDate={dates.currentMonthEnd}
          historicalStartDate={dates.historicalStartDate}
          historicalEndDate={dates.historicalEndDate}
        />
        <IncomeForecast 
          currentMonthStart={dates.currentMonthStart}
          currentMonthEnd={dates.currentMonthEnd}
          historicalStartDate={dates.historicalStartDate}
          historicalEndDate={dates.historicalEndDate}
        />
      </div>

      {/* Recent income table full width */}
      <div className="grid gap-4 grid-cols-1">
        <RecentIncomeTable />
      </div>
    </div>
  );
}
