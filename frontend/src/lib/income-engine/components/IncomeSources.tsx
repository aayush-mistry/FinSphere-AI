'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomeSources } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface IncomeSourcesProps {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

export function IncomeSources({
  currentStartDate,
  currentEndDate,
  previousStartDate,
  previousEndDate
}: IncomeSourcesProps) {
  const { data: sources, isLoading, error } = useIncomeSources({
    currentStartDate,
    currentEndDate,
    previousStartDate,
    previousEndDate
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !sources) {
    return null;
  }

  if (sources.length === 0) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle>Top Income Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No income sources found for this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Top Income Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sources.map((source, index) => {
            const isPositive = source.percentageChange > 0;
            const isNegative = source.percentageChange < 0;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{source.source}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium">
                      {source.percentageOfTotal.toFixed(1)}%
                    </span>
                    <span className="capitalize">{source.primaryType.toLowerCase()}</span>
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold">{formatCurrency(source.totalAmount)}</span>
                  <span className={`text-xs flex items-center ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : isNegative ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                    {Math.abs(source.percentageChange).toFixed(1)}% vs prev
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
