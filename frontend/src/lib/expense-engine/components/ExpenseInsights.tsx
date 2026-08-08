'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseAnomalies, useRecurringExpenses, useExpenseCategories } from '../hooks/useExpenses';
import { Loader2, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ExpenseInsightsProps {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  historicalStartDate: string;
  historicalEndDate: string;
}

export function ExpenseInsights({
  currentStartDate,
  currentEndDate,
  previousStartDate,
  previousEndDate,
  historicalStartDate,
  historicalEndDate,
}: ExpenseInsightsProps) {
  const { data: anomalies, isLoading: isLoadingAnomalies } = useExpenseAnomalies(
    currentStartDate, currentEndDate, historicalStartDate, historicalEndDate
  );
  const { data: recurring, isLoading: isLoadingRecurring } = useRecurringExpenses();
  const { data: categories, isLoading: isLoadingCategories } = useExpenseCategories(
    currentStartDate, currentEndDate, previousStartDate, previousEndDate
  );

  const isLoading = isLoadingAnomalies || isLoadingRecurring || isLoadingCategories;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display Anomalies */}
            {anomalies?.map((anomaly, idx) => (
              <Alert key={`anomaly-${idx}`} variant={anomaly.severity === 'HIGH' ? 'destructive' : 'default'} className={anomaly.severity === 'MEDIUM' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}>
                <AlertTriangle className={`h-4 w-4 ${anomaly.severity === 'MEDIUM' ? 'text-yellow-600' : ''}`} />
                <AlertTitle>Unusual Spending Detected</AlertTitle>
                <AlertDescription>
                  {anomaly.reason}
                </AlertDescription>
              </Alert>
            ))}

            {/* Highlight largest increasing category */}
            {categories && categories.length > 0 && categories[0].percentageChange > 0 && (
              <div className="flex items-center gap-3 text-sm p-3 border rounded-lg bg-emerald-50 border-emerald-100 text-emerald-800">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span>
                  <strong>{categories[0].category}</strong> spending is up by <strong>{categories[0].percentageChange.toFixed(0)}%</strong> compared to the previous period.
                </span>
              </div>
            )}

            {/* Recurring subscriptions insight */}
            {recurring && recurring.length > 0 && (
              <div className="flex items-center gap-3 text-sm p-3 border rounded-lg bg-blue-50 border-blue-100 text-blue-800">
                <Info className="h-5 w-5 text-blue-600" />
                <span>
                  <strong>{recurring.length}</strong> recurring subscriptions detected, totaling <strong>₹{recurring.reduce((a, b) => a + b.expectedAmount, 0).toLocaleString('en-IN')}</strong> per period.
                </span>
              </div>
            )}
            
            {!anomalies?.length && (!categories || categories[0]?.percentageChange <= 0) && !recurring?.length && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No significant insights to report for this period.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
