'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseTrends } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/format';

export function ExpenseTrendChart() {
  const { data: trendData, isLoading, error } = useExpenseTrends('DAILY'); // defaulting to daily for this view, or could be monthly

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Failed to load trend data.</div>
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = trendData?.dataPoints.map(dp => ({
    name: dp.date,
    total: dp.amount
  })) || [];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => {
                    // if it's daily, just show day
                    return new Date(value).getDate().toString();
                  }}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
