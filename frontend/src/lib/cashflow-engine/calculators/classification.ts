import { Transaction, TransactionType } from '../../balance-engine/types';
import { CashFlowClass, CashFlowSubClass, CashFlowClassification } from '../types';

export function classifyCashFlowTransaction(transaction: Transaction): CashFlowClassification {
  switch (transaction.type) {
    case TransactionType.SALARY:
      return { primaryClass: CashFlowClass.INCOME, subClass: CashFlowSubClass.INCOME_SALARY };
    case TransactionType.DIVIDEND:
      return { primaryClass: CashFlowClass.INCOME, subClass: CashFlowSubClass.INCOME_DIVIDEND };
    case TransactionType.INTEREST:
      return { primaryClass: CashFlowClass.INCOME, subClass: CashFlowSubClass.INCOME_INTEREST };
    case TransactionType.INCOME:
      return { primaryClass: CashFlowClass.INCOME, subClass: CashFlowSubClass.INCOME_OTHER };
    
    case TransactionType.EXPENSE:
      return { primaryClass: CashFlowClass.EXPENSE, subClass: CashFlowSubClass.EXPENSE_ORDINARY };
    case TransactionType.REFUND:
      return { primaryClass: CashFlowClass.EXPENSE, subClass: CashFlowSubClass.EXPENSE_REFUND };

    case TransactionType.INVESTMENT_PURCHASE:
      return { primaryClass: CashFlowClass.INVESTMENT, subClass: CashFlowSubClass.INVESTMENT_CONTRIBUTION };
    case TransactionType.INVESTMENT_SALE:
      return { primaryClass: CashFlowClass.INVESTMENT, subClass: CashFlowSubClass.INVESTMENT_WITHDRAWAL };
    
    case TransactionType.LOAN_PAYMENT:
      // Note: Full distinction between principal and interest is rarely available in raw transaction type.
      // Usually, it requires checking the category or splitting. Defaulting to principal for now.
      return { primaryClass: CashFlowClass.DEBT, subClass: CashFlowSubClass.DEBT_PRINCIPAL };
    
    case TransactionType.TRANSFER:
    case TransactionType.CASH_DEPOSIT:
    case TransactionType.CASH_WITHDRAWAL:
      // Credit card payments often come in as TRANSFERS between Checking -> Credit Card.
      if (transaction.tags?.includes('bill payment') || transaction.category.toLowerCase().includes('credit card')) {
        return { primaryClass: CashFlowClass.DEBT, subClass: CashFlowSubClass.DEBT_PRINCIPAL };
      }
      return { primaryClass: CashFlowClass.TRANSFER, subClass: CashFlowSubClass.TRANSFER_INTERNAL };
      
    default:
      return { primaryClass: CashFlowClass.OTHER, subClass: CashFlowSubClass.OTHER };
  }
}
