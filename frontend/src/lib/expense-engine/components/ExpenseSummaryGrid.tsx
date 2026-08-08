'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { useExpenseSummary, useExpenseForecast } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';

interface ExpenseSummaryGridProps {
  startDate: string;
  endDate: string;
}

export function ExpenseSummaryGrid({ startDate, endDate }: ExpenseSummaryGridProps) {
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useExpenseSummary(startDate, endDate);
  const { data: forecast, isLoading: isForecastLoading } = useExpenseForecast(startDate, endDate);

  if (summaryError) {
    return <div className="text-red-500 text-sm">Failed to load summary.</div>;
  }

  const isLoading = isSummaryLoading || isForecastLoading;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalSpent || 0)}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {summary?.transactionCount || 0} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg / Day</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(summary?.averageDailySpending || 0)}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Across {summary?.period.split(' to ')?.[0] ? 'period' : 'selected days'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(forecast?.expectedFinalSpending || 0)}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Expected by end of month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
