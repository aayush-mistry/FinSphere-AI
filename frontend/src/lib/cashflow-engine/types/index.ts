import { IncomeTransaction } from '../../income-engine/types';
import { Expense } from '../../expense-engine/types';

export enum CashFlowClass {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
  DEBT = 'DEBT',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

export enum CashFlowSubClass {
  INCOME_SALARY = 'Income - Salary',
  INCOME_DIVIDEND = 'Income - Dividend',
  INCOME_INTEREST = 'Income - Interest',
  INCOME_OTHER = 'Income - Other',
  
  EXPENSE_ORDINARY = 'Expense',
  EXPENSE_REFUND = 'Refund',
  
  INVESTMENT_CONTRIBUTION = 'Investment Contribution',
  INVESTMENT_WITHDRAWAL = 'Investment Withdrawal',
  
  DEBT_PRINCIPAL = 'Debt Principal Payment',
  DEBT_INTEREST = 'Debt Interest Payment',
  DEBT_PROCEEDS = 'Loan Proceeds',
  
  TRANSFER_INTERNAL = 'Internal Transfer',
  
  OTHER = 'Other'
}

export interface CashFlowClassification {
  primaryClass: CashFlowClass;
  subClass: CashFlowSubClass;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  startingCashPosition: number;
  endingCashPosition: number;
  cashPositionChange: number;
  savingsRate: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  isPositive: boolean;
}

export interface CashFlowDataPoint {
  date: string; // YYYY-MM-DD or YYYY-MM based on period
  income: number;
  expenses: number;
  netCashFlow: number;
}

export interface CashFlowTrend {
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  dataPoints: CashFlowDataPoint[];
}

export interface CashFlowBreakdownItem {
  category: string;
  amount: number;
  percentageOfTotal: number;
}

export interface CashFlowBreakdown {
  income: CashFlowBreakdownItem[];
  expenses: CashFlowBreakdownItem[];
}

export interface CashPosition {
  startDate: string;
  endDate: string;
  startingBalance: number;
  endingBalance: number;
  netChange: number;
}

export type CashFlowTransaction = IncomeTransaction | Expense;

export interface CashFlowRecent {
  transactions: {
    id: string;
    date: string;
    amount: number;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    accountId: string;
  }[];
}

export interface CashFlowReconciliation {
  netCashFlow: number;
  cashPositionChange: number;
  investmentContributions: number;
  debtReduction: number;
  reconciled: boolean;
  difference: number;
}

export interface CashFlowAllocation {
  income: number;
  expenses: number;
  remainingCashFlow: number;
  allocation: {
    cash: number;
    investments: number;
    debtReduction: number;
  };
}

export interface CashFlowComparison {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
}

export interface NegativeCashFlowAnalysis {
  isNegative: boolean;
  deficit: number;
  percentageDeficit: number;
  mainExpenseCategories: { category: string; amount: number }[];
  previousPeriodDeficit?: number;
}

export interface CashFlowInsights {
  insights: string[];
}
