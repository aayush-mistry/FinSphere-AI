'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCashFlowTrends } from '../hooks/useCashFlow';
import { formatCurrency } from '@/lib/utils';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CashFlowTrendChartProps {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
}

export function CashFlowTrendChart({ period, startDate, endDate }: CashFlowTrendChartProps) {
  const { data: trend, isLoading, error } = useCashFlowTrends({ period, start_date: startDate, end_date: endDate });

  const formattedData = useMemo(() => {
    if (!trend) return [];
    return trend.dataPoints.map(dp => ({
      ...dp,
      displayDate: period === 'MONTHLY' 
        ? new Date(dp.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [trend, period]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
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
        <CardTitle>Cash Flow Trend</CardTitle>
        <CardDescription>
          Income, expenses and net movement over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  formatCurrency(value as number), 
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Cash Flow'
                ]}
                labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Area 
                type="monotone" 
                dataKey="netCashFlow" 
                name="Net Cash Flow"
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNet)" 
                dot={{ r: 4, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
