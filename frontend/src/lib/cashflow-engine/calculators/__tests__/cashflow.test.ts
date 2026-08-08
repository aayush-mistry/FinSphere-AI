import { calculateCashFlowSummary } from '../summary';
import { calculateCashPosition } from '../position';
import { IncomeTransaction } from '../../../income-engine/types';
import { Expense, ExpenseCategoryGroup, ExpenseFixedVariable } from '../../../expense-engine/types';
import { Account, AccountStatus, AccountType, Transaction, TransactionStatus, TransactionType } from '../../../balance-engine/types';

describe('Cash Flow Engine Core Calculations', () => {
  
  describe('calculateCashFlowSummary', () => {
    it('calculates positive cash flow and savings rate correctly', () => {
      const incomeTxns = [
        { amount: 100000 } as IncomeTransaction
      ];
      const expenses = [
        { amount: 60000 } as Expense
      ];
      
      const summary = calculateCashFlowSummary(incomeTxns, expenses, 100000, 140000);
      
      expect(summary.totalIncome).toBe(100000);
      expect(summary.totalExpenses).toBe(60000);
      expect(summary.netCashFlow).toBe(40000);
      expect(summary.savingsRate).toBe(40);
      expect(summary.isPositive).toBe(true);
    });

    it('calculates negative cash flow correctly', () => {
      const incomeTxns = [
        { amount: 50000 } as IncomeTransaction
      ];
      const expenses = [
        { amount: 60000 } as Expense
      ];
      
      const summary = calculateCashFlowSummary(incomeTxns, expenses, 100000, 90000);
      
      expect(summary.netCashFlow).toBe(-10000);
      expect(summary.savingsRate).toBe(-20);
      expect(summary.isPositive).toBe(false);
    });

    it('handles zero income and zero expenses', () => {
      const summary = calculateCashFlowSummary([], [], 1000, 1000);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.netCashFlow).toBe(0);
      expect(summary.savingsRate).toBe(0);
      expect(summary.isPositive).toBe(true);
    });

    it('handles zero income with expenses (negative cash flow)', () => {
      const summary = calculateCashFlowSummary([], [{ amount: 5000 } as Expense], 10000, 5000);
      expect(summary.totalIncome).toBe(0);
      expect(summary.netCashFlow).toBe(-5000);
      expect(summary.savingsRate).toBe(0); // Should not divide by zero
      expect(summary.isPositive).toBe(false);
    });
  });

  describe('calculateCashPosition', () => {
    it('rolls back transactions to find correct starting and ending balances', () => {
      const currentAccounts: Account[] = [
        {
          id: 'acc1',
          userId: 'user1',
          name: 'Checking',
          type: AccountType.CHECKING,
          currentBalance: 1500, // Today's balance
          availableBalance: 1500,
          currency: 'USD',
          institution: { id: 'bank1', name: 'Bank' },
          lastUpdated: new Date().toISOString(),
          status: AccountStatus.ACTIVE
        }
      ];

      // Assuming today is 2026-08-08
      const today = new Date().getTime();
      
      // A transaction yesterday (+500)
      const yesterday = new Date(today - 86400000).toISOString();
      // A transaction a week ago (-200)
      const lastWeek = new Date(today - 7 * 86400000).toISOString();

      const allTransactions: Transaction[] = [
        {
          id: 't1',
          accountId: 'acc1',
          amount: 500, // Income
          date: yesterday,
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETED,
          category: 'Salary',
          merchant: 'Employer',
          description: '',
          currency: 'USD',
          tags: []
        },
        {
          id: 't2',
          accountId: 'acc1',
          amount: -200, // Expense
          date: lastWeek,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.COMPLETED,
          category: 'Food',
          merchant: 'Grocery',
          description: '',
          currency: 'USD',
          tags: []
        }
      ];

      // Start date: 10 days ago, End Date: 2 days ago
      const startDate = new Date(today - 10 * 86400000).toISOString().split('T')[0];
      const endDate = new Date(today - 2 * 86400000).toISOString().split('T')[0];

      // Math:
      // Current balance = 1500
      // Yesterday txn (+500) happened AFTER endDate.
      // So at endDate, balance was 1500 - 500 = 1000.
      // Last week txn (-200) happened AFTER startDate but BEFORE endDate.
      // So at startDate, balance was 1000 - (-200) = 1200.

      const position = calculateCashPosition(startDate, endDate, currentAccounts, allTransactions);

      expect(position.endingBalance).toBe(1000);
      expect(position.startingBalance).toBe(1200);
      expect(position.netChange).toBe(-200);
    });
  });

});
