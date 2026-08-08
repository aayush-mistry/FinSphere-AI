import { 
  ExpenseCategoryGroup, 
  ExpenseFixedVariable,
  Expense
} from '../../types';
import { classifyExpense } from '../classifier';
import { generateExpenseSummary } from '../summary';
import { generateCategoryAnalytics } from '../analytics';
import { calculateForecast } from '../forecast';
import { detectRecurringExpenses } from '../recurring';
import { detectAnomalies } from '../anomalies';
import { Transaction, TransactionStatus, TransactionType } from '../../../balance-engine/types';

const baseTxn: Omit<Transaction, 'id' | 'category' | 'amount' | 'date'> = {
  accountId: 'acc1',
  merchant: 'Test',
  description: 'Test',
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETED,
  currency: 'INR',
  tags: []
};

describe('Expense Engine Calculators', () => {
  describe('classifier.ts', () => {
    it('classifies known fixed essential expenses', () => {
      const txn: Transaction = { ...baseTxn, id: '1', category: 'Housing', amount: -10000, date: '2026-08-01T10:00:00Z' };
      const expense = classifyExpense(txn);
      expect(expense.expenseCategory.group).toBe(ExpenseCategoryGroup.ESSENTIAL);
      expect(expense.expenseCategory.type).toBe(ExpenseFixedVariable.FIXED);
    });

    it('classifies variable lifestyle expenses', () => {
      const txn: Transaction = { ...baseTxn, id: '2', category: 'Restaurants', amount: -500, date: '2026-08-01T10:00:00Z' };
      const expense = classifyExpense(txn);
      expect(expense.expenseCategory.group).toBe(ExpenseCategoryGroup.LIFESTYLE);
      expect(expense.expenseCategory.type).toBe(ExpenseFixedVariable.VARIABLE);
    });
  });

  describe('summary.ts', () => {
    it('calculates accurate monthly summaries', () => {
      const e1: Expense = classifyExpense({ ...baseTxn, id: '1', category: 'Housing', amount: -10000, date: '2026-08-01T10:00:00Z' });
      const e2: Expense = classifyExpense({ ...baseTxn, id: '2', category: 'Restaurants', amount: -2000, date: '2026-08-15T10:00:00Z' });
      const summary = generateExpenseSummary([e1, e2], '2026-08-01T00:00:00Z', '2026-08-31T23:59:59Z');
      
      expect(summary.totalSpent).toBe(12000);
      expect(summary.totalFixed).toBe(10000);
      expect(summary.totalVariable).toBe(2000);
      expect(summary.largestExpense?.id).toBe('1');
    });
  });

  describe('analytics.ts', () => {
    it('calculates category totals and percentages', () => {
      const current: Expense[] = [
        classifyExpense({ ...baseTxn, id: '1', category: 'Housing', amount: -5000, date: '2026-08-01T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: '2', category: 'Housing', amount: -5000, date: '2026-08-02T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: '3', category: 'Shopping', amount: -10000, date: '2026-08-05T10:00:00Z' })
      ];
      
      const previous: Expense[] = [
        classifyExpense({ ...baseTxn, id: '4', category: 'Housing', amount: -10000, date: '2026-07-01T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: '5', category: 'Shopping', amount: -5000, date: '2026-07-05T10:00:00Z' })
      ];

      const analytics = generateCategoryAnalytics(current, previous);
      
      const housing = analytics.find(a => a.category === 'Housing');
      expect(housing?.totalAmount).toBe(10000);
      expect(housing?.percentageChange).toBe(0); // 10000 -> 10000

      const shopping = analytics.find(a => a.category === 'Shopping');
      expect(shopping?.totalAmount).toBe(10000);
      expect(shopping?.percentageChange).toBe(100); // 5000 -> 10000
    });
  });

  describe('recurring.ts', () => {
    it('detects monthly recurring expenses', () => {
      const expenses: Expense[] = [
        classifyExpense({ ...baseTxn, id: '1', category: '', merchant: 'Netflix', amount: -649, date: '2026-05-01T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: '2', category: '', merchant: 'Netflix', amount: -649, date: '2026-06-01T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: '3', category: '', merchant: 'Netflix', amount: -649, date: '2026-07-01T10:00:00Z' }),
      ];

      const recurring = detectRecurringExpenses(expenses);
      expect(recurring.length).toBe(1);
      expect(recurring[0].merchant).toBe('Netflix');
      expect(recurring[0].frequency).toBe('MONTHLY');
      expect(recurring[0].expectedAmount).toBe(649);
    });
  });

  describe('anomalies.ts', () => {
    it('detects high spending anomalies', () => {
      const history: Expense[] = [
        classifyExpense({ ...baseTxn, id: 'h1', category: 'Food & Dining', amount: -6000, date: '2026-05-15T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: 'h2', category: 'Food & Dining', amount: -6400, date: '2026-06-15T10:00:00Z' }),
        classifyExpense({ ...baseTxn, id: 'h3', category: 'Food & Dining', amount: -6700, date: '2026-07-15T10:00:00Z' }),
      ]; // mean = 6366, stddev = 286

      const recent: Expense[] = [
        classifyExpense({ ...baseTxn, id: 'r1', category: 'Food & Dining', amount: -12800, date: '2026-08-15T10:00:00Z' }),
      ];

      const anomalies = detectAnomalies(recent, history);
      expect(anomalies.length).toBe(1);
      expect(anomalies[0].severity).toBe('HIGH');
      expect(anomalies[0].score).toBe(100);
    });
  });

  describe('forecast.ts', () => {
    it('calculates run-rate projection', () => {
      const expenses: Expense[] = [
        classifyExpense({ ...baseTxn, id: '1', category: '', amount: -27000, date: '2026-08-15T10:00:00Z' }) // Halfway through a 31-day month
      ];
      const history = [50000, 52000, 51000]; // avg = 51000
      
      const forecast = calculateForecast(expenses, history, '2026-08-15T10:00:00Z'); // Day 15
      
      // Run rate = 27000 / 15 * 31 = 55800
      // Expected will be a blend of history (51000) and run rate (55800).
      expect(forecast.expectedFinalSpending).toBeGreaterThan(50000);
      expect(forecast.expectedFinalSpending).toBeLessThan(60000);
      expect(forecast.currentSpending).toBe(27000);
    });
  });
});
