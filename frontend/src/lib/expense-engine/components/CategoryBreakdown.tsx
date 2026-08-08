'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseCategories } from '../hooks/useExpenses';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Progress } from '@/components/ui/progress';

interface CategoryBreakdownProps {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

export function CategoryBreakdown({ 
  currentStartDate, currentEndDate, previousStartDate, previousEndDate 
}: CategoryBreakdownProps) {
  const { data: categories, isLoading, error } = useExpenseCategories(
    currentStartDate, currentEndDate, previousStartDate, previousEndDate
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Failed to load categories.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {categories?.slice(0, 6).map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="font-bold">{formatCurrency(cat.totalAmount)}</span>
                </div>
                <Progress value={cat.percentageOfTotal} className="h-2" />
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No categorical spending found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
