import { Transaction } from '../../balance-engine/types';
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseCategoryGroup, 
  ExpenseFixedVariable 
} from '../types';

// Deterministic mapping for expense categories
const CATEGORY_MAPPINGS: Record<string, { group: ExpenseCategoryGroup, type: ExpenseFixedVariable }> = {
  // Essential
  'Housing': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },
  'Rent': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },
  'Groceries': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.VARIABLE },
  'Utilities': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.VARIABLE },
  'Healthcare': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.VARIABLE },
  'Education': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },
  'Insurance': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },
  'Loan EMI': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },
  'Internet': { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED },

  // Lifestyle
  'Restaurants': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Food & Dining': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Shopping': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Entertainment': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Travel': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Gaming': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE },
  'Subscriptions': { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.FIXED },

  // Transportation
  'Fuel': { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE },
  'Public Transport': { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE },
  'Taxi': { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE },
  'Transportation': { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE },
  'Vehicle': { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE },

  // Financial
  'Bank Fees': { group: ExpenseCategoryGroup.FINANCIAL, type: ExpenseFixedVariable.VARIABLE },
  'Credit Card Payment': { group: ExpenseCategoryGroup.FINANCIAL, type: ExpenseFixedVariable.FIXED },
  'Loan Payment': { group: ExpenseCategoryGroup.FINANCIAL, type: ExpenseFixedVariable.FIXED },
  
  // Other
  'Miscellaneous': { group: ExpenseCategoryGroup.OTHER, type: ExpenseFixedVariable.VARIABLE },
  'Cash': { group: ExpenseCategoryGroup.OTHER, type: ExpenseFixedVariable.VARIABLE },
  'Cash Withdrawal': { group: ExpenseCategoryGroup.FINANCIAL, type: ExpenseFixedVariable.VARIABLE },
};

export const classifyExpense = (transaction: Transaction): Expense => {
  // Determine if it matches any known tags
  let mappedCategory = CATEGORY_MAPPINGS[transaction.category];
  
  // Fallback heuristics based on tags if category is not directly mapped
  if (!mappedCategory) {
    if (transaction.tags?.includes('fixed') || transaction.tags?.includes('rent') || transaction.tags?.includes('utility')) {
      mappedCategory = { group: ExpenseCategoryGroup.ESSENTIAL, type: ExpenseFixedVariable.FIXED };
    } else if (transaction.tags?.includes('shopping') || transaction.tags?.includes('food')) {
      mappedCategory = { group: ExpenseCategoryGroup.LIFESTYLE, type: ExpenseFixedVariable.VARIABLE };
    } else if (transaction.tags?.includes('travel') || transaction.tags?.includes('transport')) {
      mappedCategory = { group: ExpenseCategoryGroup.TRANSPORTATION, type: ExpenseFixedVariable.VARIABLE };
    }
  }

  // Default fallback
  if (!mappedCategory) {
    mappedCategory = { group: ExpenseCategoryGroup.OTHER, type: ExpenseFixedVariable.VARIABLE };
  }

  const expenseCategory: ExpenseCategory = {
    name: transaction.category || 'Miscellaneous',
    group: mappedCategory.group,
    type: mappedCategory.type
  };

  return {
    ...transaction,
    expenseCategory
  };
};

export const filterExpenses = (transactions: Transaction[]): Expense[] => {
  return transactions
    .filter(t => t.amount < 0) // Only outgoing
    // Optionally exclude transfers/investments if they shouldn't count as expenses
    .filter(t => t.type !== 'Transfer' && t.type !== 'Investment Purchase')
    .map(classifyExpense);
};
