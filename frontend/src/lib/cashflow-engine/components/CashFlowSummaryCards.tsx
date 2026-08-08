import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowSummary } from '../hooks/useCashFlow';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, IndianRupee, PieChart, Activity, PiggyBank } from 'lucide-react';

export function CashFlowSummaryCards({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data: summary, isLoading, error } = useCashFlowSummary({ start_date: startDate, end_date: endDate });

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
        <CardContent className="pt-6 text-red-600">Failed to load cash flow summary.</CardContent>
      </Card>
    );
  }

  const isNetPositive = summary.netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total Income</CardTitle>
          <IndianRupee className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalIncome)}</div>
          <p className="text-xs text-slate-500 mt-1">Money coming in</p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
          <PieChart className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-slate-500 mt-1">Money going out</p>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Net Cash Flow</CardTitle>
          <Activity className={`h-4 w-4 ${isNetPositive ? 'text-indigo-600' : 'text-rose-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">
            {isNetPositive ? '+' : '-'}{formatCurrency(Math.abs(summary.netCashFlow))}
          </div>
          <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${isNetPositive ? 'text-indigo-600' : 'text-rose-600'}`}>
            {isNetPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isNetPositive ? 'Positive Cash Flow' : 'Negative Cash Flow'}
          </p>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="shadow-sm border-slate-100 bg-emerald-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800">Savings Rate</CardTitle>
          <PiggyBank className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">{summary.savingsRate.toFixed(1)}%</div>
          <p className="text-xs text-emerald-700/80 mt-1">Percentage of income remaining</p>
        </CardContent>
      </Card>
    </div>
  );
}
