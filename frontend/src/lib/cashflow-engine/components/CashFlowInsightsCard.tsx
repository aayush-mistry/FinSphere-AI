'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowInsights } from '../hooks/useCashFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

export function CashFlowInsightsCard({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data: insightsData, isLoading, error } = useCashFlowInsights({ start_date: startDate, end_date: endDate });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insightsData || insightsData.insights.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border-slate-100 bg-indigo-50/30 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
          Cash Flow Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insightsData.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
