export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  INVESTMENT = 'Investment Account',
  CRYPTO = 'Crypto Wallet',
  BUSINESS = 'Business Account',
  LOAN = 'Loan Account',
  OTHER = 'Other'
}

export enum AccountStatus {
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  FROZEN = 'Frozen'
}

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currentBalance: number;
  availableBalance: number;
  currency: Currency;
  institution: Institution;
  lastUpdated: string; // ISO date string
  status: AccountStatus;
  creditLimit?: number; // Applicable for credit cards/lines of credit
  apr?: number;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
  REFUND = 'Refund',
  INVESTMENT_PURCHASE = 'Investment Purchase',
  INVESTMENT_SALE = 'Investment Sale',
  INTEREST = 'Interest',
  DIVIDEND = 'Dividend',
  LOAN_PAYMENT = 'Loan Payment',
  SALARY = 'Salary',
  CASH_WITHDRAWAL = 'Cash Withdrawal',
  CASH_DEPOSIT = 'Cash Deposit'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled'
}

export interface Transaction {
  id: string;
  accountId: string;
  category: string;
  merchant: string;
  description: string;
  amount: number; // Positive for income/credits, Negative for expenses/debits
  type: TransactionType;
  date: string; // ISO date string
  status: TransactionStatus;
  currency: Currency;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  baseCurrency: Currency;
}

export interface BalanceSnapshot {
  date: string; // ISO date string (or just YYYY-MM-DD)
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  cashFlow: number;
  netWorth: number;
  transactionCount: number;
}

export interface FinancialPosition {
  totalAvailableCash: number;
  totalBankBalance: number;
  totalCreditUsed: number;
  totalCreditLimit: number;
  netWorth: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  savings: number;
  cashFlow: number;
  largestExpense?: Transaction;
  largestIncome?: Transaction;
  averageDailySpending: number;
}
