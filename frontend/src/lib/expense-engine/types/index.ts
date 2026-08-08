import { Transaction } from '../../balance-engine/types';

export enum ExpenseCategoryGroup {
  ESSENTIAL = 'Essential',
  LIFESTYLE = 'Lifestyle',
  TRANSPORTATION = 'Transportation',
  FINANCIAL = 'Financial',
  OTHER = 'Other'
}

export enum ExpenseFixedVariable {
  FIXED = 'Fixed',
  VARIABLE = 'Variable'
}

export interface ExpenseCategory {
  name: string; // e.g. "Housing", "Food"
  group: ExpenseCategoryGroup;
  type: ExpenseFixedVariable;
}

// An Expense is essentially a mapped Transaction with added domain-specific fields
export interface Expense extends Transaction {
  expenseCategory: ExpenseCategory;
}

export interface ExpenseSummary {
  period: string; // e.g., '2026-08'
  startDate: string; // ISO string
  endDate: string; // ISO string
  
  totalSpent: number;
  averageDailySpending: number;
  averageWeeklySpending?: number;
  averageMonthlySpending?: number;
  
  transactionCount: number;
  largestExpense?: Expense;
  smallestExpense?: Expense;
  
  totalFixed: number;
  totalVariable: number;
  fixedRatio: number;
  variableRatio: number;
}

export interface CategoryComparison {
  category: string;
  group: ExpenseCategoryGroup;
  type: ExpenseFixedVariable;
  
  totalAmount: number;
  percentageOfTotal: number;
  transactionCount: number;
  averageTransactionAmount: number;
  
  previousPeriodAmount: number;
  percentageChange: number; // e.g., 15.49 for +15.49%
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface ExpenseTrendDataPoint {
  date: string; // 'YYYY-MM-DD' or 'YYYY-MM' or 'YYYY-Wxx'
  amount: number;
  previousAmount?: number;
  absoluteChange?: number;
  percentageChange?: number;
  direction?: 'UP' | 'DOWN' | 'FLAT';
}

export interface ExpenseTrend {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dataPoints: ExpenseTrendDataPoint[];
  categoryTrends: Record<string, ExpenseTrendDataPoint[]>;
}

export interface RecurringExpense {
  merchant: string;
  expectedAmount: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  lastOccurrence: string; // ISO string
  nextExpectedOccurrence: string; // ISO string
  confidence: number; // 0-100
  history: Expense[];
}

export interface ExpenseAnomaly {
  id: string;
  score: number; // 0-100 anomaly severity score
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  relatedTransaction: Expense;
  expectedRange: {
    min: number;
    max: number;
  };
}

export interface ExpenseForecast {
  currentSpending: number;
  expectedFinalSpending: number;
  expectedRange: {
    min: number;
    max: number;
  };
  confidence: number; // 0-100
  daysElapsed: number;
  daysRemaining: number;
}
