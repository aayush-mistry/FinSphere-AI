import { Account, AccountStatus, AccountType, Transaction, TransactionStatus, TransactionType, User } from '../types';

export const mockUser: User = {
  id: 'usr_1',
  name: 'Alex Sterling',
  email: 'alex@example.com',
  baseCurrency: 'INR'
};

export const mockAccounts: Account[] = [
  {
    id: 'acc_checking_1',
    userId: 'usr_1',
    name: 'Main Checking',
    type: AccountType.CHECKING,
    currentBalance: 125000,
    availableBalance: 125000,
    currency: 'INR',
    institution: { id: 'inst_1', name: 'HDFC Bank' },
    lastUpdated: new Date().toISOString(),
    status: AccountStatus.ACTIVE
  },
  {
    id: 'acc_savings_1',
    userId: 'usr_1',
    name: 'Emergency Fund',
    type: AccountType.SAVINGS,
    currentBalance: 850000,
    availableBalance: 850000,
    currency: 'INR',
    institution: { id: 'inst_1', name: 'HDFC Bank' },
    lastUpdated: new Date().toISOString(),
    status: AccountStatus.ACTIVE,
    apr: 4.5
  },
  {
    id: 'acc_credit_1',
    userId: 'usr_1',
    name: 'Rewards Credit Card',
    type: AccountType.CREDIT_CARD,
    currentBalance: -45000,
    availableBalance: 255000, // Limit is 300000
    creditLimit: 300000,
    currency: 'INR',
    institution: { id: 'inst_2', name: 'Amex' },
    lastUpdated: new Date().toISOString(),
    status: AccountStatus.ACTIVE,
    apr: 19.99
  },
  {
    id: 'acc_invest_1',
    userId: 'usr_1',
    name: 'Vanguard Mutual Funds',
    type: AccountType.INVESTMENT,
    currentBalance: 1540000,
    availableBalance: 1540000,
    currency: 'INR',
    institution: { id: 'inst_3', name: 'Vanguard' },
    lastUpdated: new Date().toISOString(),
    status: AccountStatus.ACTIVE
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    accountId: 'acc_checking_1',
    category: 'Income',
    merchant: 'Tech Corp Inc.',
    description: 'Salary',
    amount: 180000,
    type: TransactionType.SALARY,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['salary', 'income']
  },
  {
    id: 'txn_2',
    accountId: 'acc_credit_1',
    category: 'Food & Dining',
    merchant: 'Swiggy',
    description: 'Dinner delivery',
    amount: -850,
    type: TransactionType.EXPENSE,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['food', 'delivery']
  },
  {
    id: 'txn_3',
    accountId: 'acc_credit_1',
    category: 'Shopping',
    merchant: 'Amazon',
    description: 'Electronics',
    amount: -12500,
    type: TransactionType.EXPENSE,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['shopping']
  },
  {
    id: 'txn_4',
    accountId: 'acc_checking_1',
    category: 'Housing',
    merchant: 'Prime Apartments',
    description: 'Monthly Rent',
    amount: -45000,
    type: TransactionType.EXPENSE,
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['rent', 'fixed']
  },
  {
    id: 'txn_5',
    accountId: 'acc_checking_1',
    category: 'Transfer',
    merchant: 'Vanguard',
    description: 'Monthly SIP',
    amount: -25000,
    type: TransactionType.INVESTMENT_PURCHASE,
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['investment', 'sip']
  },
  {
    id: 'txn_6',
    accountId: 'acc_checking_1',
    category: 'Transfer',
    merchant: 'HDFC Credit Card',
    description: 'Credit Card Bill Payment',
    amount: -32000,
    type: TransactionType.TRANSFER,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['bill payment']
  },
  {
    id: 'txn_7',
    accountId: 'acc_credit_1',
    category: 'Transfer',
    merchant: 'HDFC Checking',
    description: 'Payment Received',
    amount: 32000,
    type: TransactionType.TRANSFER,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['bill payment']
  },
  {
    id: 'txn_8',
    accountId: 'acc_credit_1',
    category: 'Utilities',
    merchant: 'Jio',
    description: 'Internet Bill',
    amount: -1500,
    type: TransactionType.EXPENSE,
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['utility', 'fixed']
  },
  {
    id: 'txn_9',
    accountId: 'acc_credit_1',
    category: 'Transportation',
    merchant: 'Uber',
    description: 'Ride to airport',
    amount: -1200,
    type: TransactionType.EXPENSE,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: TransactionStatus.COMPLETED,
    currency: 'INR',
    tags: ['travel']
  }
];
