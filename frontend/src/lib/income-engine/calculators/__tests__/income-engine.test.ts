import { Transaction, TransactionType, TransactionStatus } from '../../../balance-engine/types';
import { isGenuineIncome, classifyIncome } from '../classifier';
import { detectRecurringIncome } from '../recurring';
import { IncomeType, IncomeCategoryGroup, IncomeTransaction } from '../../types';

describe('Income Engine Calculators', () => {
  const baseTxn: Transaction = {
    id: 'txn_1',
    accountId: 'acc_1',
    category: '',
    merchant: '',
    description: '',
    amount: 1000,
    type: TransactionType.INCOME,
    date: '2026-08-01T10:00:00Z',
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: []
  };

  describe('classifier.ts - Exclusions', () => {
    it('excludes outgoing transactions', () => {
      const expense = { ...baseTxn, amount: -5000 };
      expect(isGenuineIncome(expense)).toBe(false);
    });

    it('excludes explicit transfer types', () => {
      const transfer = { ...baseTxn, amount: 5000, type: TransactionType.TRANSFER };
      expect(isGenuineIncome(transfer)).toBe(false);
    });

    it('excludes loan proceeds', () => {
      const loan = { ...baseTxn, amount: 50000, tags: ['loan'] };
      expect(isGenuineIncome(loan)).toBe(false);
    });

    it('excludes credit card payments', () => {
      const ccPayment = { ...baseTxn, amount: 15000, category: 'Credit Card Payment' };
      expect(isGenuineIncome(ccPayment)).toBe(false);
    });
  });

  describe('classifier.ts - Classifications', () => {
    it('classifies explicit Salary transaction', () => {
      const txn = { ...baseTxn, amount: 80000, type: TransactionType.SALARY, merchant: 'ABC Corp' };
      const result = classifyIncome(txn);
      expect(result.type).toBe(IncomeType.SALARY);
      expect(result.group).toBe(IncomeCategoryGroup.PRIMARY);
      expect(result.source).toBe('ABC Corp');
    });

    it('classifies Freelance income based on merchant keyword', () => {
      const txn = { ...baseTxn, amount: 12000, merchant: 'Upwork Escrow' };
      const result = classifyIncome(txn);
      expect(result.type).toBe(IncomeType.FREELANCE);
    });

    it('classifies Interest income', () => {
      const txn = { ...baseTxn, amount: 500, type: TransactionType.INTEREST, merchant: 'HDFC Bank' };
      const result = classifyIncome(txn);
      expect(result.type).toBe(IncomeType.INTEREST);
    });

    it('classifies Dividend income', () => {
      const txn = { ...baseTxn, amount: 1500, type: TransactionType.DIVIDEND, merchant: 'Vanguard' };
      const result = classifyIncome(txn);
      expect(result.type).toBe(IncomeType.DIVIDEND);
    });

    it('classifies Refund transactions', () => {
      const txn = { ...baseTxn, amount: 450, type: TransactionType.REFUND, merchant: 'Amazon' };
      const result = classifyIncome(txn);
      expect(result.type).toBe(IncomeType.REFUND);
    });
  });

  describe('recurring.ts', () => {
    it('detects recurring income from same source with similar amount', () => {
      const getTxn = (id: string, date: string, amount: number): IncomeTransaction => {
        const t = { ...baseTxn, id, amount, date, type: TransactionType.SALARY, merchant: 'Tech Corp' };
        return {
          ...t,
          incomeClassification: classifyIncome(t)
        };
      };

      const transactions = [
        getTxn('1', '2026-05-01T10:00:00Z', 80000),
        getTxn('2', '2026-06-01T10:00:00Z', 80000),
        getTxn('3', '2026-07-01T10:00:00Z', 80000),
      ];

      const recurring = detectRecurringIncome(transactions);
      expect(recurring.length).toBe(3);
      recurring.forEach(r => expect(r.isRecurringCandidate).toBe(true));
    });

    it('rejects highly variable amounts', () => {
      const getTxn = (id: string, date: string, amount: number): IncomeTransaction => {
        const t = { ...baseTxn, id, amount, date, type: TransactionType.INCOME, merchant: 'Random Payer' };
        return {
          ...t,
          incomeClassification: classifyIncome(t)
        };
      };

      const transactions = [
        getTxn('1', '2026-05-01T10:00:00Z', 1000),
        getTxn('2', '2026-06-01T10:00:00Z', 5000),
        getTxn('3', '2026-07-01T10:00:00Z', 200),
      ];

      const recurring = detectRecurringIncome(transactions);
      recurring.forEach(r => expect(r.isRecurringCandidate).toBe(false));
    });
  });
});
