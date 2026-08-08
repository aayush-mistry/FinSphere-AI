'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIncomeForecast } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';

interface IncomeForecastProps {
  currentMonthStart: string;
  currentMonthEnd: string;
  historicalStartDate: string;
  historicalEndDate: string;
}

export function IncomeForecast({
  currentMonthStart,
  currentMonthEnd,
  historicalStartDate,
  historicalEndDate
}: IncomeForecastProps) {
  const { data: forecast, isLoading, error } = useIncomeForecast({
    currentMonthStart,
    currentMonthEnd,
    historicalStartDate,
    historicalEndDate
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !forecast) {
    return null;
  }

  // To visualize the forecast, we'll create a simple 3-point dataset: 
  // Start (0), Current (receivedSoFar), End (expectedFinal)
  const data = [
    { name: 'Start', amount: 0 },
    { name: 'Received', amount: forecast.receivedSoFar },
    { name: 'Forecast', amount: forecast.expectedFinal, min: forecast.expectedRangeMin, max: forecast.expectedRangeMax }
  ];

  const confidencePct = Math.round(forecast.confidence * 100);

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Month Forecast</CardTitle>
        <CardDescription>Deterministic projection for end of month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Received</span>
            <div className="text-xl font-bold">{formatCurrency(forecast.receivedSoFar)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Expected Final</span>
            <div className="text-xl font-bold text-indigo-700">{formatCurrency(forecast.expectedFinal)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Pending Recurring</span>
            <div className="text-sm font-medium">{formatCurrency(forecast.expectedRecurring)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</span>
            <div className="text-sm font-medium">{confidencePct}%</div>
          </div>
        </div>

        <div className="h-32 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis hide domain={[0, 'dataMax + 10000']} />
              
              {/* Highlight the forecasted range at the end */}
              {forecast.expectedRangeMax > forecast.expectedFinal && (
                <ReferenceArea 
                  x1="Received" 
                  x2="Forecast" 
                  y1={forecast.expectedRangeMin} 
                  y2={forecast.expectedRangeMax} 
                  fill="#4f46e5" 
                  fillOpacity={0.1} 
                />
              )}
              
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Expected range: {formatCurrency(forecast.expectedRangeMin)} — {formatCurrency(forecast.expectedRangeMax)}
        </p>
      </CardContent>
    </Card>
  );
}
