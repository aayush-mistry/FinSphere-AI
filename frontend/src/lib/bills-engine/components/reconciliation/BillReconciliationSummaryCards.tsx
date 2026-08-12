import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationSummary } from '../../types';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { formatCurrency } from '@/lib/format';

interface SummaryCardsProps {
  summary: ReconciliationSummary;
}

export function BillReconciliationSummaryCards({ summary }: SummaryCardsProps) {
  const { isPrivacyMode } = usePrivacyMode();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.total_expected)} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {summary.total_bills} bill occurrences
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.total_paid)} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.paid + summary.paid_late + summary.partially_paid + summary.overpaid} bills with payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.total_remaining)} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Amount still outstanding
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-600">Overdue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">
            {summary.overdue}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bills past their due date
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
