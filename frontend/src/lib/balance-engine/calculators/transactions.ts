import { Transaction, MonthlySummary, TransactionType } from '../types';

export const filterTransactionsByMonth = (transactions: Transaction[], year: number, month: number): Transaction[] => {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

export const calculateIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount > 0 && t.type !== TransactionType.TRANSFER && t.type !== TransactionType.REFUND)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount < 0 && t.type !== TransactionType.TRANSFER && t.type !== TransactionType.INVESTMENT_PURCHASE)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const calculateSavings = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === TransactionType.INVESTMENT_PURCHASE)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const calculateCashFlow = (income: number, expenses: number): number => {
  return income - expenses;
};

export const getLargestExpense = (transactions: Transaction[]): Transaction | undefined => {
  const expenses = transactions.filter(t => t.amount < 0 && t.type !== TransactionType.TRANSFER);
  if (expenses.length === 0) return undefined;
  return expenses.reduce((prev, current) => (Math.abs(current.amount) > Math.abs(prev.amount) ? current : prev));
};

export const getLargestIncome = (transactions: Transaction[]): Transaction | undefined => {
  const incomes = transactions.filter(t => t.amount > 0 && t.type !== TransactionType.TRANSFER);
  if (incomes.length === 0) return undefined;
  return incomes.reduce((prev, current) => (current.amount > prev.amount ? current : prev));
};

export const calculateAverageDailySpending = (transactions: Transaction[], daysInPeriod: number): number => {
  const totalExpenses = calculateExpenses(transactions);
  return daysInPeriod > 0 ? totalExpenses / daysInPeriod : 0;
};

export const generateMonthlySummary = (transactions: Transaction[], date: Date): MonthlySummary => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthString = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  
  const monthlyTxns = filterTransactionsByMonth(transactions, year, month);
  const income = calculateIncome(monthlyTxns);
  const expenses = calculateExpenses(monthlyTxns);
  const savings = calculateSavings(monthlyTxns);
  const cashFlow = calculateCashFlow(income, expenses);
  
  // Calculate days passed in the month for average daily spending
  const today = new Date();
  let daysInPeriod = new Date(year, month + 1, 0).getDate(); // Total days in month by default
  if (today.getFullYear() === year && today.getMonth() === month) {
    daysInPeriod = today.getDate(); // Days passed so far this month
  }
  
  const averageDailySpending = calculateAverageDailySpending(monthlyTxns, daysInPeriod);

  return {
    month: monthString,
    income,
    expenses,
    savings,
    cashFlow,
    largestExpense: getLargestExpense(monthlyTxns),
    largestIncome: getLargestIncome(monthlyTxns),
    averageDailySpending
  };
};
