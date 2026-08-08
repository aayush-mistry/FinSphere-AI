'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseSummary } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Progress } from '@/components/ui/progress';

interface FixedVariableCardProps {
  startDate: string;
  endDate: string;
}

export function FixedVariableCard({ startDate, endDate }: FixedVariableCardProps) {
  const { data: summary, isLoading, error } = useExpenseSummary(startDate, endDate);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fixed vs Variable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Failed to load summary.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fixed vs Variable</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Fixed</span>
                <span className="font-bold">{formatCurrency(summary?.totalFixed || 0)}</span>
              </div>
              <Progress value={summary?.fixedRatio || 0} className="h-2 bg-emerald-100 [&>div]:bg-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Variable</span>
                <span className="font-bold">{formatCurrency(summary?.totalVariable || 0)}</span>
              </div>
              <Progress value={summary?.variableRatio || 0} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
