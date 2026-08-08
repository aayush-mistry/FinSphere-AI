'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRecurringIncome } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, CalendarDays, ShieldCheck } from 'lucide-react';

export function RecurringIncome() {
  const { data: recurring, isLoading, error } = useRecurringIncome();

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !recurring) {
    return null;
  }

  if (recurring.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recurring Income</CardTitle>
          <CardDescription>Predicted ongoing income streams.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recurring income detected yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recurring Income</CardTitle>
        <CardDescription>Predicted ongoing income streams based on history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {recurring.map((item, index) => {
            const confidencePercentage = Math.round(item.confidence * 100);
            return (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                <div className="space-y-1">
                  <h4 className="font-semibold text-base">{item.source}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      <span className="capitalize">{item.frequency.toLowerCase()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Next: {new Date(item.nextExpectedOccurrence).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-0 flex flex-col sm:items-end gap-1">
                  <span className="font-bold text-lg text-emerald-700">{formatCurrency(item.expectedAmount)}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-blue-500" />
                    {confidencePercentage}% confidence
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
