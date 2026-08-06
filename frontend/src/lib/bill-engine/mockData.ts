import { BillModel, IncomeEvent } from './types';
import { addDays, setDate } from 'date-fns';

const today = new Date();

export const mockBillsExtended: BillModel[] = [
  {
    id: 'bill-ex-1',
    name: 'Mortgage Payment',
    category: 'housing',
    provider: 'Chase Bank',
    amount: 1800,
    dueDate: setDate(addDays(today, 12), 1).toISOString(), // 1st of next month usually
    frequency: 'monthly',
    paymentMethod: 'Checking (...1234)',
    autoPayEnabled: true,
    lateFee: 50,
    status: 'pending',
    priority: 'critical',
    linkedAccountId: 'acc-1',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'bill-ex-2',
    name: 'Electric Bill',
    category: 'utilities',
    provider: 'ConEdison',
    amount: 145.50,
    dueDate: addDays(today, 4).toISOString(), // Due in 4 days
    frequency: 'monthly',
    paymentMethod: 'Credit Card (...9988)',
    autoPayEnabled: false,
    lateFee: 15,
    status: 'pending',
    priority: 'high',
    linkedAccountId: 'acc-5',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'bill-ex-3',
    name: 'Netflix Premium',
    category: 'subscriptions',
    provider: 'Netflix',
    amount: 22.99,
    dueDate: addDays(today, 8).toISOString(), // Due in 8 days
    frequency: 'monthly',
    paymentMethod: 'Credit Card (...9988)',
    autoPayEnabled: true,
    lateFee: 0,
    status: 'pending',
    priority: 'low',
    linkedAccountId: 'acc-5',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'bill-ex-4',
    name: 'Car Insurance',
    category: 'insurance',
    provider: 'Geico',
    amount: 120.00,
    dueDate: addDays(today, 18).toISOString(), // Due in 18 days
    frequency: 'monthly',
    paymentMethod: 'Checking (...1234)',
    autoPayEnabled: true,
    lateFee: 25,
    status: 'pending',
    priority: 'high',
    linkedAccountId: 'acc-1',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'bill-ex-5',
    name: 'Personal Loan EMI',
    category: 'loans',
    provider: 'Discover',
    amount: 350.00,
    dueDate: addDays(today, 25).toISOString(), // Due in 25 days
    frequency: 'monthly',
    paymentMethod: 'Checking (...1234)',
    autoPayEnabled: true,
    lateFee: 40,
    status: 'pending',
    priority: 'high',
    linkedAccountId: 'acc-1',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  }
];

export const mockIncomes: IncomeEvent[] = [
  {
    id: 'inc-1',
    name: 'Tech Corp Salary',
    amount: 4200.00,
    date: addDays(today, 10).toISOString(), // Paid in 10 days
    isRecurring: true
  }
];

// Current liquid balance across all checkings/savings
export const mockCurrentLiquidBalance = 2400.00; 
