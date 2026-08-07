import { Account, AccountType, FinancialPosition } from '../types';

export const calculateTotalBankBalance = (accounts: Account[]): number => {
  return accounts
    .filter((acc) => acc.type === AccountType.CHECKING || acc.type === AccountType.SAVINGS || acc.type === AccountType.CASH)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);
};

export const calculateTotalAvailableCash = (accounts: Account[]): number => {
  return accounts
    .filter((acc) => acc.type === AccountType.CHECKING || acc.type === AccountType.SAVINGS || acc.type === AccountType.CASH)
    .reduce((sum, acc) => sum + acc.availableBalance, 0);
};

export const calculateTotalCreditUsed = (accounts: Account[]): number => {
  return accounts
    .filter((acc) => acc.type === AccountType.CREDIT_CARD || acc.type === AccountType.LOAN)
    .reduce((sum, acc) => sum + (acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0), 0);
};

export const calculateTotalCreditLimit = (accounts: Account[]): number => {
  return accounts
    .filter((acc) => acc.type === AccountType.CREDIT_CARD || acc.type === AccountType.LOAN)
    .reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
};

export const calculateInvestmentBalance = (accounts: Account[]): number => {
  return accounts
    .filter((acc) => acc.type === AccountType.INVESTMENT || acc.type === AccountType.CRYPTO)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);
};

export const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
};

export const generateFinancialPosition = (accounts: Account[]): FinancialPosition => {
  return {
    totalAvailableCash: calculateTotalAvailableCash(accounts),
    totalBankBalance: calculateTotalBankBalance(accounts),
    totalCreditUsed: calculateTotalCreditUsed(accounts),
    totalCreditLimit: calculateTotalCreditLimit(accounts),
    netWorth: calculateNetWorth(accounts),
  };
};

export const groupAccountsByType = (accounts: Account[]): Record<string, Account[]> => {
  return accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);
};
