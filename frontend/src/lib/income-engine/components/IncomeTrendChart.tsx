'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIncomeTrends } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface IncomeTrendChartProps {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
}

export function IncomeTrendChart({ periodType, startDate, endDate }: IncomeTrendChartProps) {
  const { data: trend, isLoading, error } = useIncomeTrends({ periodType, startDate, endDate });

  const formattedData = useMemo(() => {
    if (!trend) return [];
    return trend.dataPoints.map(dp => ({
      ...dp,
      displayDate: periodType === 'MONTHLY' 
        ? new Date(dp.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [trend, periodType]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !trend) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Income Trend</CardTitle>
        <CardDescription>
          {trend.direction === 'UP' ? 'Trending upwards' : trend.direction === 'DOWN' ? 'Trending downwards' : 'Stable income'} 
          {trend.percentageChange ? ` by ${Math.abs(trend.percentageChange).toFixed(1)}%` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'Income']}
                labelStyle={{ color: '#374151', fontWeight: 500 }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
