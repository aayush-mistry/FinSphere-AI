'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowComparison } from '../hooks/useCashFlow';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function CashFlowComparison({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data: comparison, isLoading, error } = useCashFlowComparison({ start_date: startDate, end_date: endDate });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !comparison) {
    return null;
  }

  // Ensure we sort descending so newest is at top, and limit to recent 6 months for table
  const displayData = [...comparison]
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .slice(0, 6);

  return (
    <Card className="shadow-sm h-full border-slate-100">
      <CardHeader>
        <CardTitle className="text-base">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-medium">Month</th>
                <th className="px-4 py-3 font-medium text-right">Income</th>
                <th className="px-4 py-3 font-medium text-right">Expenses</th>
                <th className="px-4 py-3 rounded-tr-lg font-medium text-right">Net Flow</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.income)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.expenses)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.netCashFlow >= 0 ? '+' : ''}{formatCurrency(row.netCashFlow)}
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No historical data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
