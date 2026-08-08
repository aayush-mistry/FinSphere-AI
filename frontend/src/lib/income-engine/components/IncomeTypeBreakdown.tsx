'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomeTypes } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface IncomeTypeBreakdownProps {
  startDate?: string;
  endDate?: string;
}

export function IncomeTypeBreakdown({ startDate, endDate }: IncomeTypeBreakdownProps) {
  const { data: types, isLoading, error } = useIncomeTypes({ startDate, endDate });

  if (isLoading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !types) {
    return null;
  }

  if (types.length === 0) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle>Income by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Income by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {types.map((type, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium capitalize">{type.type.toLowerCase()}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(type.totalAmount)} ({type.percentageOfTotal.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${Math.max(1, type.percentageOfTotal)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
