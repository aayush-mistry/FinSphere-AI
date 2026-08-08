'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRecentIncome } from '../hooks/useIncome';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function RecentIncomeTable() {
  const { data: recent, isLoading, error } = useRecentIncome(10);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Income</CardTitle>
        <CardDescription>Latest classified income transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(txn.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {txn.incomeClassification.source}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                    {txn.incomeClassification.type.toLowerCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-700">
                  {formatCurrency(txn.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
