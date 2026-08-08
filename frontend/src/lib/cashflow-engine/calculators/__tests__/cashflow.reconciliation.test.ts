import { calculateDebtReduction, calculateInvestmentContributions, generateReconciliation } from '../reconciliation';
import { Account, AccountStatus, AccountType, Transaction, TransactionStatus, TransactionType } from '../../../balance-engine/types';

describe('Cash Flow Engine Reconciliation', () => {
  
  describe('calculateDebtReduction', () => {
    it('calculates true debt reduction from account balance rollback', () => {
      const currentAccounts: Account[] = [
        {
          id: 'acc_credit_1',
          userId: 'user1',
          name: 'Rewards CC',
          type: AccountType.CREDIT_CARD,
          currentBalance: -45000,
          availableBalance: 255000,
          currency: 'INR',
          institution: { id: 'bank1', name: 'Bank' },
          lastUpdated: new Date().toISOString(),
          status: AccountStatus.ACTIVE
        }
      ];

      const today = new Date().getTime();
      const startDate = new Date(today - 10 * 86400000).toISOString().split('T')[0];
      const endDate = new Date(today - 1 * 86400000).toISOString().split('T')[0];
      
      const allTransactions: Transaction[] = [
        {
          id: 't1',
          accountId: 'acc_credit_1',
          amount: 32000, // Payment towards CC
          date: new Date(today - 5 * 86400000).toISOString(),
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          category: 'Transfer',
          merchant: 'Payment',
          description: '',
          currency: 'INR',
          tags: ['bill payment']
        },
        {
          id: 't2',
          accountId: 'acc_credit_1',
          amount: -16050, // CC Spending
          date: new Date(today - 4 * 86400000).toISOString(),
          type: TransactionType.EXPENSE,
          status: TransactionStatus.COMPLETED,
          category: 'Shopping',
          merchant: 'Amazon',
          description: '',
          currency: 'INR',
          tags: []
        }
      ];

      // End Date is yesterday. Transactions are 4-5 days ago.
      // So they fall within the window.
      // Current Balance = -45000
      // Since no txns happened AFTER endDate, Ending Balance = -45000.
      // Txns during period: 32000 (payment) - 16050 (spending) = 15950 net positive flow to CC.
      // Starting Balance = -45000 - 15950 = -60950.
      // Debt Reduction = Ending Balance (-45000) - Starting Balance (-60950) = 15950.
      
      const reduction = calculateDebtReduction(startDate, endDate, currentAccounts, allTransactions);
      
      expect(reduction).toBe(15950);
    });
  });

  describe('generateReconciliation', () => {
    it('successfully reconciles perfectly matched cash flows', () => {
      // Income: ₹180,000, Expenses: ₹61,050 => Net Cash Flow: ₹118,950
      // Liquid cash change: ₹78,000
      // Investment contribution: ₹25,000
      // Debt reduction: ₹15,950
      
      const rec = generateReconciliation(118950, 78000, 25000, 15950);
      
      expect(rec.reconciled).toBe(true);
      expect(rec.difference).toBe(0);
      expect(rec.netCashFlow).toBe(118950);
    });

    it('fails reconciliation when there is a discrepancy', () => {
      // Net Cash Flow is 120,000 but allocations only sum to 100,000
      const rec = generateReconciliation(120000, 75000, 25000, 0);
      
      expect(rec.reconciled).toBe(false);
      expect(rec.difference).toBe(20000); // 120000 - 100000
    });
    
    it('reconciles within floating point tolerances', () => {
      const rec = generateReconciliation(100.005, 50, 25.002, 25.003);
      
      expect(rec.reconciled).toBe(true);
    });
  });

});
