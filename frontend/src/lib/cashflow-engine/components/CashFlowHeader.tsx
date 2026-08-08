import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashFlowHeaderProps {
  dateRange: { startDate: string; endDate: string };
  setDateRange: (range: { startDate: string; endDate: string }) => void;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  setPeriod: (period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY') => void;
}

export function CashFlowHeader({ dateRange, setDateRange, period, setPeriod }: CashFlowHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Cash Flow</h2>
        <p className="text-muted-foreground mt-1 text-sm">Understand how money moves through your financial life.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select 
          value={period} 
          onValueChange={(val: any) => setPeriod(val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value="august" 
          onValueChange={() => {
            // Placeholder: in a real app this would generate custom date ranges
            setDateRange({ startDate: '2026-08-01', endDate: '2026-08-31' });
          }}
        >
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="august">August 2026</SelectItem>
            <SelectItem value="july">July 2026</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="ytd">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
