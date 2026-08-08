'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentExpenses } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { TransactionType } from '../../balance-engine/types';

export function RecentExpenseTable() {
  const { data: recent, isLoading, error } = useRecentExpenses(10);

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Failed to load recent expenses.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Merchant</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-tr-md">Account</th>
                </tr>
              </thead>
              <tbody>
                {recent?.map((expense, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{expense.merchant || expense.description}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-normal">
                        {expense.expenseCategory.name}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(Math.abs(expense.amount))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {expense.accountId}
                    </td>
                  </tr>
                ))}
                {(!recent || recent.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-foreground">
                      No recent expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
