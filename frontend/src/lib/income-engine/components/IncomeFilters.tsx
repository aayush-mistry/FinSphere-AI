'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';

interface IncomeFiltersProps {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  setPeriodType: (val: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY') => void;
}

export function IncomeFilters({ periodType, setPeriodType }: IncomeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mb-2">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search sources or types..." 
            className="w-full pl-9 h-9 text-sm rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4" />
          Aug 2026
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={periodType} onValueChange={(val: any) => setPeriodType(val)}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
