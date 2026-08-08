'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomeSummary } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, IndianRupee, Activity, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface IncomeSummaryProps {
  currentMonthStart: string;
  currentMonthEnd: string;
  previousMonthStart: string;
  previousMonthEnd: string;
  currentYearStart: string;
  currentYearEnd: string;
}

export function IncomeSummary({
  currentMonthStart,
  currentMonthEnd,
  previousMonthStart,
  previousMonthEnd,
  currentYearStart,
  currentYearEnd
}: IncomeSummaryProps) {
  const { data: summary, isLoading, error } = useIncomeSummary({
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
    currentYearStart,
    currentYearEnd
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="border-red-100 bg-red-50/50">
        <CardContent className="pt-6 text-red-600">Failed to load income summary.</CardContent>
      </Card>
    );
  }

  const change = summary.previousMonthIncome > 0 
    ? ((summary.currentMonthIncome - summary.previousMonthIncome) / summary.previousMonthIncome) * 100
    : 100;
  
  const isPositive = change >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <IndianRupee className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.currentMonthIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className={`flex items-center ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span>from last month</span>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Monthly</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.averageMonthlyIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">Based on current year</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Year to Date</CardTitle>
          <CalendarDays className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.currentYearIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total income this year</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          <Activity className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Income events this month</p>
        </CardContent>
      </Card>
    </div>
  );
}
