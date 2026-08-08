'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIncomeAnomalies } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface IncomeAnomaliesProps {
  recentStartDate: string;
  recentEndDate: string;
  historicalStartDate: string;
  historicalEndDate: string;
}

export function IncomeAnomalies({
  recentStartDate,
  recentEndDate,
  historicalStartDate,
  historicalEndDate
}: IncomeAnomaliesProps) {
  const { data: anomalies, isLoading, error } = useIncomeAnomalies({
    recentStartDate,
    recentEndDate,
    historicalStartDate,
    historicalEndDate
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !anomalies) {
    return null;
  }

  if (anomalies.length === 0) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle>Income Anomalies</CardTitle>
          <CardDescription>Unusual events detected in recent income.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-slate-50/50">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No unusual income patterns detected this month.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Income Anomalies</CardTitle>
        <CardDescription>Unusual events detected compared to historical baselines.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {anomalies.map((anomaly, index) => {
            const isDrop = anomaly.difference < 0;
            const isHighSeverity = anomaly.severity === 'HIGH';
            
            return (
              <div 
                key={index} 
                className={`p-4 border rounded-xl flex gap-3 ${
                  isHighSeverity ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className={`mt-0.5 ${isDrop ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isDrop ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-slate-900">{anomaly.transaction.incomeClassification.source}</h4>
                    <span className="font-medium text-sm">{formatCurrency(anomaly.transaction.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {anomaly.explanation}
                  </p>
                  <div className="pt-2 flex gap-4 text-xs font-medium">
                    <span className="text-slate-500">Baseline: {formatCurrency(anomaly.historicalBaseline)}</span>
                    <span className={isDrop ? 'text-red-600' : 'text-emerald-600'}>
                      Diff: {isDrop ? '' : '+'}{formatCurrency(anomaly.difference)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
