'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentCashFlow } from '../hooks/useCashFlow';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function RecentCashMovements({ limit = 10 }: { limit?: number }) {
  const { data: recent, isLoading, error } = useRecentCashFlow({ limit });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !recent) {
    return null;
  }

  return (
    <Card className="shadow-sm border-slate-100">
      <CardHeader>
        <CardTitle className="text-base">Recent Cash Movements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 rounded-tr-lg font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.transactions.map((txn, i) => {
                const isIncome = txn.type === 'INCOME';
                return (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{txn.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{txn.category}</td>
                    <td className={`px-4 py-3 text-right font-medium flex items-center justify-end gap-1 ${
                      isIncome ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                      {formatCurrency(Math.abs(txn.amount))}
                    </td>
                  </tr>
                );
              })}
              {recent.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No recent cash movements found.
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
