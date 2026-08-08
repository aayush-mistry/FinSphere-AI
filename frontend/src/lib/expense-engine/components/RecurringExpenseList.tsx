'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecurringExpenses } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export function RecurringExpenseList() {
  const { data: recurring, isLoading, error } = useRecurringExpenses();

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Failed to load recurring expenses.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recurring Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>Merchant</div>
              <div>Amount</div>
              <div>Frequency</div>
              <div>Next Expected</div>
            </div>
            {recurring?.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 text-sm items-center py-2">
                <div className="font-medium">{item.merchant}</div>
                <div>{formatCurrency(item.expectedAmount)}</div>
                <div className="capitalize">{item.frequency.toLowerCase()}</div>
                <div className="text-muted-foreground">{new Date(item.nextExpectedOccurrence).toLocaleDateString()}</div>
              </div>
            ))}
            {(!recurring || recurring.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recurring expenses detected.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
