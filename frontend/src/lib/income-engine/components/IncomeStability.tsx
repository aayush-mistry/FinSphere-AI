'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIncomeStability } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface IncomeStabilityProps {
  startDate?: string;
  endDate?: string;
}

export function IncomeStability({ startDate, endDate }: IncomeStabilityProps) {
  const { data: stability, isLoading, error } = useIncomeStability({ startDate, endDate });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stability) {
    return null;
  }

  const data = [
    { name: 'Recurring', value: stability.recurringAmount, color: '#10b981' },
    { name: 'Variable', value: stability.variableAmount, color: '#6366f1' }
  ];

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle>Income Stability</CardTitle>
        <CardDescription>Ratio of predictable recurring income versus variable income.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-40 w-40 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold">{(stability.recurringRatio * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stable</span>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                  Recurring
                </span>
                <span className="font-medium">{formatCurrency(stability.recurringAmount)}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4.5">
                Reliable income from sources with consistent historical frequency and amounts.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                  Variable
                </span>
                <span className="font-medium">{formatCurrency(stability.variableAmount)}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4.5">
                Fluctuating income such as one-off freelance gigs or intermittent payments.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
