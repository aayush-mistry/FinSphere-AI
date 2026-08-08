'use client';

import { useState } from 'react';
import { ExpenseSummaryGrid } from '@/lib/expense-engine/components/ExpenseSummaryGrid';
import { ExpenseTrendChart } from '@/lib/expense-engine/components/ExpenseTrendChart';
import { CategoryBreakdown } from '@/lib/expense-engine/components/CategoryBreakdown';
import { FixedVariableCard } from '@/lib/expense-engine/components/FixedVariableCard';
import { RecurringExpenseList } from '@/lib/expense-engine/components/RecurringExpenseList';
import { ExpenseInsights } from '@/lib/expense-engine/components/ExpenseInsights';
import { RecentExpenseTable } from '@/lib/expense-engine/components/RecentExpenseTable';

export default function ExpensesPage() {
  // Hardcoded for demo/reference image purposes. In a real app, this would use a date picker.
  const [currentMonth] = useState({
    start: '2026-08-01T00:00:00Z',
    end: '2026-08-31T23:59:59Z'
  });
  
  const [previousMonth] = useState({
    start: '2026-07-01T00:00:00Z',
    end: '2026-07-31T23:59:59Z'
  });

  const [historical] = useState({
    start: '2026-02-01T00:00:00Z',
    end: '2026-07-31T23:59:59Z'
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
          August 2026
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Summary */}
        <ExpenseSummaryGrid startDate={currentMonth.start} endDate={currentMonth.end} />
        
        {/* Row 2: Trend Chart */}
        <ExpenseTrendChart />

        {/* Row 3: Categories & Fixed/Variable */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <CategoryBreakdown 
              currentStartDate={currentMonth.start}
              currentEndDate={currentMonth.end}
              previousStartDate={previousMonth.start}
              previousEndDate={previousMonth.end}
            />
          </div>
          <div className="lg:col-span-3">
            <FixedVariableCard 
              startDate={currentMonth.start}
              endDate={currentMonth.end}
            />
          </div>
        </div>

        {/* Row 4: Recurring */}
        <RecurringExpenseList />

        {/* Row 5: Insights */}
        <ExpenseInsights 
          currentStartDate={currentMonth.start}
          currentEndDate={currentMonth.end}
          previousStartDate={previousMonth.start}
          previousEndDate={previousMonth.end}
          historicalStartDate={historical.start}
          historicalEndDate={historical.end}
        />

        {/* Row 6: Recent */}
        <RecentExpenseTable />
      </div>
    </div>
  );
}
