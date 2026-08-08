import { Transaction, TransactionType } from '../../balance-engine/types';
import { 
  IncomeTransaction, 
  IncomeCategoryGroup, 
  IncomeType, 
  IncomeClassificationResult 
} from '../types';

export const isGenuineIncome = (transaction: Transaction): boolean => {
  // Must be incoming funds
  if (transaction.amount <= 0) return false;

  // Explicitly excluded transaction types
  const excludedTypes = [
    TransactionType.TRANSFER,
    TransactionType.LOAN_PAYMENT, // Loan payments are outgoing, but just in case
    TransactionType.CASH_DEPOSIT, // Cash deposits are usually transfers, not income
  ];
  if (excludedTypes.includes(transaction.type)) return false;

  // Exclude internal balance adjustments or known non-income tags
  const excludedTags = ['transfer', 'internal', 'loan', 'credit card payment', 'credit card'];
  if (transaction.tags?.some(tag => excludedTags.includes(tag.toLowerCase()))) return false;

  // Exclude if category strongly implies transfer
  const lowerCat = transaction.category?.toLowerCase() || '';
  if (lowerCat.includes('transfer') || lowerCat.includes('credit card')) return false;

  return true;
};

export const classifyIncome = (transaction: Transaction): IncomeClassificationResult => {
  const merchant = (transaction.merchant || '').toLowerCase();
  const desc = (transaction.description || '').toLowerCase();
  const category = (transaction.category || '').toLowerCase();
  const tags = transaction.tags?.map(t => t.toLowerCase()) || [];

  let type = IncomeType.OTHER;
  let group = IncomeCategoryGroup.OTHER;
  let confidence = 0.5;
  let reason = 'Default classification based on positive amount';
  
  // Extract source - prioritize merchant, fallback to description, fallback to 'Unknown Source'
  let source = transaction.merchant || transaction.description || 'Unknown Source';

  // 1. Direct TransactionType mapping (highest confidence)
  if (transaction.type === TransactionType.SALARY) {
    type = IncomeType.SALARY;
    group = IncomeCategoryGroup.PRIMARY;
    confidence = 1.0;
    reason = 'Transaction type explicitly marked as Salary';
  } else if (transaction.type === TransactionType.DIVIDEND) {
    type = IncomeType.DIVIDEND;
    group = IncomeCategoryGroup.PASSIVE;
    confidence = 1.0;
    reason = 'Transaction type explicitly marked as Dividend';
  } else if (transaction.type === TransactionType.INTEREST) {
    type = IncomeType.INTEREST;
    group = IncomeCategoryGroup.PASSIVE;
    confidence = 1.0;
    reason = 'Transaction type explicitly marked as Interest';
  } else if (transaction.type === TransactionType.REFUND) {
    type = IncomeType.REFUND;
    group = IncomeCategoryGroup.OTHER;
    confidence = 1.0;
    reason = 'Transaction type explicitly marked as Refund';
  }
  
  // 2. Keyword matching on merchant/description/category (medium-high confidence)
  else if (merchant.includes('upwork') || merchant.includes('fiverr') || desc.includes('freelance') || tags.includes('freelance')) {
    type = IncomeType.FREELANCE;
    group = IncomeCategoryGroup.PRIMARY;
    confidence = 0.8;
    reason = 'Keyword match for Freelance platforms';
  } else if (desc.includes('salary') || desc.includes('payroll') || tags.includes('salary')) {
    type = IncomeType.SALARY;
    group = IncomeCategoryGroup.PRIMARY;
    confidence = 0.9;
    reason = 'Keyword match for Salary/Payroll in description or tags';
  } else if (desc.includes('bonus') || tags.includes('bonus')) {
    type = IncomeType.BONUS;
    group = IncomeCategoryGroup.OTHER;
    confidence = 0.8;
    reason = 'Keyword match for Bonus';
  } else if (desc.includes('cashback') || category.includes('cashback') || tags.includes('cashback') || merchant.includes('cashback')) {
    type = IncomeType.CASHBACK;
    group = IncomeCategoryGroup.OTHER;
    confidence = 0.9;
    reason = 'Keyword match for Cashback';
  } else if (desc.includes('refund') || category.includes('refund') || tags.includes('refund')) {
    type = IncomeType.REFUND;
    group = IncomeCategoryGroup.OTHER;
    confidence = 0.9;
    reason = 'Keyword match for Refund';
  } else if (desc.includes('interest') || category.includes('interest')) {
    type = IncomeType.INTEREST;
    group = IncomeCategoryGroup.PASSIVE;
    confidence = 0.8;
    reason = 'Keyword match for Interest';
  } else if (desc.includes('dividend') || category.includes('dividend')) {
    type = IncomeType.DIVIDEND;
    group = IncomeCategoryGroup.PASSIVE;
    confidence = 0.8;
    reason = 'Keyword match for Dividend';
  } else if (desc.includes('rent') || category.includes('rent') || tags.includes('rental')) {
    type = IncomeType.RENTAL;
    group = IncomeCategoryGroup.PASSIVE;
    confidence = 0.7;
    reason = 'Keyword match for Rental Income';
  }

  return {
    group,
    type,
    source,
    confidence,
    reason
  };
};

export const processIncomeTransactions = (transactions: Transaction[]): IncomeTransaction[] => {
  return transactions
    .filter(isGenuineIncome)
    .map(t => {
      return {
        ...t,
        incomeClassification: classifyIncome(t)
      };
    });
};
