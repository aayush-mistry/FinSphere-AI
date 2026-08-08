import { Expense, ExpenseTrend, ExpenseTrendDataPoint } from '../types';

export const generateExpenseTrends = (
  expenses: Expense[],
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY'
): ExpenseTrend => {
  // Sort expenses chronologically
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const groupedData = new Map<string, number>();
  const categoryTrendsMap = new Map<string, Map<string, number>>();

  const getPeriodKey = (dateStr: string) => {
    const d = new Date(dateStr);
    if (periodType === 'MONTHLY') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (periodType === 'WEEKLY') {
      // ISO week roughly
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    } else {
      // DAILY
      return dateStr.split('T')[0];
    }
  };

  for (const e of sortedExpenses) {
    const key = getPeriodKey(e.date);
    const amount = Math.abs(e.amount);
    
    // Total trend
    groupedData.set(key, (groupedData.get(key) || 0) + amount);

    // Category trend
    const cat = e.expenseCategory.name;
    if (!categoryTrendsMap.has(cat)) categoryTrendsMap.set(cat, new Map());
    const catMap = categoryTrendsMap.get(cat)!;
    catMap.set(key, (catMap.get(key) || 0) + amount);
  }

  const buildDataPoints = (dataMap: Map<string, number>): ExpenseTrendDataPoint[] => {
    const points: ExpenseTrendDataPoint[] = [];
    let previousAmount = 0;
    
    // Convert to sorted array
    const sortedKeys = Array.from(dataMap.keys()).sort();
    
    for (const key of sortedKeys) {
      const amount = dataMap.get(key)!;
      let absoluteChange = 0;
      let percentageChange = 0;
      let direction: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
      
      if (previousAmount > 0) {
        absoluteChange = amount - previousAmount;
        percentageChange = (absoluteChange / previousAmount) * 100;
        if (percentageChange > 1) direction = 'UP';
        else if (percentageChange < -1) direction = 'DOWN';
      } else if (amount > 0 && points.length > 0) {
        percentageChange = 100;
        direction = 'UP';
      }

      points.push({
        date: key,
        amount,
        previousAmount: points.length > 0 ? previousAmount : undefined,
        absoluteChange,
        percentageChange,
        direction
      });
      
      previousAmount = amount;
    }
    return points;
  };

  const dataPoints = buildDataPoints(groupedData);
  const categoryTrends: Record<string, ExpenseTrendDataPoint[]> = {};
  
  for (const [cat, map] of categoryTrendsMap.entries()) {
    categoryTrends[cat] = buildDataPoints(map);
  }

  return {
    periodType,
    dataPoints,
    categoryTrends
  };
};
