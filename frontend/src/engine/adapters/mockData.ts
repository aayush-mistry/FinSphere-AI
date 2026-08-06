import {
  Account, Transaction, Goal, Bill, InsurancePolicy, TaxSummary, UserProfile, BusinessMetrics, AIAlert
} from '../types';

export const mockUserProfile: UserProfile = {
  id: 'user-123',
  name: 'Alex Sterling',
  email: 'alex.sterling@example.com',
  age: 34,
  employmentStatus: 'employed',
  annualSalary: 125000,
  dependents: 1,
};

export const mockAccounts: Account[] = [
  { id: 'acc-1', name: 'Main Checking', type: 'checking', balance: 4520.50, currency: 'USD', institution: 'Chase' },
  { id: 'acc-2', name: 'High Yield Savings', type: 'savings', balance: 25400.00, currency: 'USD', institution: 'Ally', apy: 4.2 },
  { id: 'acc-3', name: 'Vanguard 401k', type: 'investment', balance: 85000.00, currency: 'USD', institution: 'Vanguard' },
  { id: 'acc-4', name: 'Auto Loan', type: 'loan', balance: -12500.00, currency: 'USD', institution: 'Capital One', apr: 3.5 },
  { id: 'acc-5', name: 'Rewards Credit Card', type: 'credit_card', balance: -1200.25, currency: 'USD', institution: 'Amex', apr: 19.99, limit: 15000 },
];

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', accountId: 'acc-1', date: new Date().toISOString(), amount: -45.00, category: 'Food', merchant: 'Whole Foods', isRecurring: false },
  { id: 'txn-2', accountId: 'acc-1', date: new Date(Date.now() - 86400000).toISOString(), amount: -12.50, category: 'Food', merchant: 'Starbucks', isRecurring: false },
  { id: 'txn-3', accountId: 'acc-1', date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: -1500.00, category: 'Housing', merchant: 'Downtown Apartments', isRecurring: true },
  { id: 'txn-4', accountId: 'acc-1', date: new Date(Date.now() - 86400000 * 3).toISOString(), amount: 4200.00, category: 'Income', merchant: 'Tech Corp Inc.', isRecurring: true },
  { id: 'txn-5', accountId: 'acc-5', date: new Date(Date.now() - 86400000 * 4).toISOString(), amount: -120.00, category: 'Utilities', merchant: 'Electric Co', isRecurring: true },
  { id: 'txn-6', accountId: 'acc-1', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: -400.00, category: 'Savings', merchant: 'Transfer to Ally', isRecurring: true },
  { id: 'txn-7', accountId: 'acc-5', date: new Date(Date.now() - 86400000 * 6).toISOString(), amount: -85.00, category: 'Entertainment', merchant: 'Netflix', isRecurring: true },
  { id: 'txn-8', accountId: 'acc-5', date: new Date(Date.now() - 86400000 * 7).toISOString(), amount: -45.00, category: 'Transportation', merchant: 'Uber', isRecurring: false },
  { id: 'txn-9', accountId: 'acc-5', date: new Date(Date.now() - 86400000 * 8).toISOString(), amount: -210.00, category: 'Food', merchant: 'Trader Joe\'s', isRecurring: false },
  { id: 'txn-10', accountId: 'acc-1', date: new Date(Date.now() - 86400000 * 9).toISOString(), amount: -65.00, category: 'Personal', merchant: 'Gym Membership', isRecurring: true },
  { id: 'txn-11', accountId: 'acc-1', date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: -25.00, category: 'Food', merchant: 'Sweetgreen', isRecurring: false },
];

export const mockGoals: Goal[] = [
  { id: 'goal-1', name: 'Emergency Fund', targetAmount: 30000, currentAmount: 25400, targetDate: '2027-01-01', category: 'Safety' },
  { id: 'goal-2', name: 'Europe Vacation', targetAmount: 5000, currentAmount: 1200, targetDate: '2026-10-01', category: 'Travel' },
];

export const mockBills: Bill[] = [
  { id: 'bill-1', name: 'Electric Bill', amount: 120.00, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), isAutoPay: true, category: 'Utilities' },
  { id: 'bill-2', name: 'Internet', amount: 80.00, dueDate: new Date(Date.now() + 86400000 * 12).toISOString(), isAutoPay: true, category: 'Utilities' },
  { id: 'bill-3', name: 'Car Insurance', amount: 145.00, dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), isAutoPay: false, category: 'Insurance' },
];

export const mockInsurance: InsurancePolicy[] = [
  { id: 'ins-1', type: 'health', provider: 'BlueCross', premiumAmount: 350, premiumFrequency: 'monthly', coverageLimit: 1000000 },
  { id: 'ins-2', type: 'auto', provider: 'Geico', premiumAmount: 145, premiumFrequency: 'monthly', coverageLimit: 300000 },
];

export const mockTaxSummary: TaxSummary = {
  year: 2026,
  estimatedOwed: 28500,
  paidYtd: 18400,
  effectiveTaxRate: 0.22,
};

export const mockAlerts: AIAlert[] = [
  { id: 'alt-1', type: 'warning', message: 'Dining expenses are 20% higher than last month.', date: new Date().toISOString() },
  { id: 'alt-2', type: 'info', message: 'You have a bill of $145 due in 2 days.', date: new Date().toISOString() },
];

export const mockBusinessMetrics: BusinessMetrics = {
  mrr: 45000,
  runwayMonths: 18,
  burnRate: 32000,
  activeCustomers: 450,
};
