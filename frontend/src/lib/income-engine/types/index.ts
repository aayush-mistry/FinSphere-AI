import { Transaction } from '../../balance-engine/types';

export enum IncomeCategoryGroup {
  PRIMARY = 'Primary Income',
  PASSIVE = 'Passive Income',
  OTHER = 'Other Income'
}

export enum IncomeType {
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  BUSINESS = 'Business Income',
  CONTRACT = 'Contract Income',
  INTEREST = 'Interest',
  DIVIDEND = 'Dividend',
  RENTAL = 'Rental Income',
  BONUS = 'Bonus',
  CASHBACK = 'Cashback',
  REFUND = 'Refund',
  GIFT = 'Gift',
  OTHER = 'Other'
}

export interface IncomeClassificationResult {
  group: IncomeCategoryGroup;
  type: IncomeType;
  source: string;
  confidence: number; // 0 to 1
  reason: string;
}

export interface IncomeTransaction extends Transaction {
  incomeClassification: IncomeClassificationResult;
  isRecurringCandidate?: boolean;
}

export interface IncomeSourceSummary {
  source: string;
  totalAmount: number;
  transactionCount: number;
  primaryType: IncomeType;
}

export interface IncomeTypeSummary {
  type: IncomeType;
  group: IncomeCategoryGroup;
  totalAmount: number;
  percentageOfTotal: number;
}

export interface IncomeSummary {
  currentMonthIncome: number;
  previousMonthIncome: number;
  currentYearIncome: number;
  averageMonthlyIncome: number;
  averageDailyIncome: number;
  transactionCount: number;
  largestTransaction?: IncomeTransaction;
  smallestTransaction?: IncomeTransaction;
}

export interface IncomeSourceAnalytics extends IncomeSourceSummary {
  percentageOfTotal: number;
  averageTransaction: number;
  previousPeriodTotal: number;
  percentageChange: number;
}

export interface IncomeTrendDataPoint {
  date: string; // ISO date or 'YYYY-MM' / 'YYYY-MM-DD'
  amount: number;
}

export interface IncomeTrend {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  dataPoints: IncomeTrendDataPoint[];
  absoluteChange: number;
  percentageChange: number;
  direction: 'UP' | 'DOWN' | 'FLAT';
}

export interface RecurringIncomeDetail {
  source: string;
  expectedAmount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'BI-WEEKLY' | 'MONTHLY' | 'YEARLY' | 'UNKNOWN';
  lastOccurrence: string; // ISO date
  nextExpectedOccurrence: string; // ISO date
  confidence: number; // 0 to 1
  historicalOccurrences: number;
}



export interface IncomeAnomaly {
  transaction: IncomeTransaction;
  historicalBaseline: number;
  difference: number;
  anomalyScore: number; // 0 to 1
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

export interface IncomeForecast {
  receivedSoFar: number;
  expectedRecurring: number;
  expectedVariable: number;
  expectedFinal: number;
  expectedRangeMin: number;
  expectedRangeMax: number;
  confidence: number;
}

