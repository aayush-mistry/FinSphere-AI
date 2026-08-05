// Core Financial Profile Types

export type AccountType = "checking" | "savings" | "credit_card" | "brokerage" | "loan";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  currency: string;
  mask: string; // e.g., "1234"
  lastUpdated: string;
}

export type TransactionCategory =
  | "Housing"
  | "Food & Dining"
  | "Auto & Transport"
  | "Travel"
  | "Bills & Utilities"
  | "Shopping"
  | "Entertainment"
  | "Income"
  | "Transfer"
  | "Investments"
  | "Healthcare"
  | "Other";

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  merchantName: string;
  category: TransactionCategory;
  isPending: boolean;
}

export type AssetClass = "Equity" | "Fixed Income" | "Crypto" | "Real Estate" | "Commodities";

export interface Investment {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  shares: number;
  price: number;
  currentValue: number;
  assetClass: AssetClass;
  dayChange: number;
  totalReturn: number;
}

export type LoanType = "Mortgage" | "Auto" | "Personal" | "Student";

export interface Loan {
  id: string;
  name: string;
  provider: string;
  type: LoanType;
  totalAmount: number;
  remainingBalance: number;
  interestRate: number; // percentage
  nextEmiDate: string;
  nextEmiAmount: number;
}

export type InsuranceType = "Health" | "Life" | "Auto" | "Home";

export interface InsurancePolicy {
  id: string;
  provider: string;
  type: InsuranceType;
  coverageAmount: number;
  premiumAmount: number;
  renewalDate: string;
}

export interface TaxRecord {
  year: number;
  totalIncome: number;
  estimatedTax: number;
  taxPaid: number;
  deductions: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: string;
}

export interface FinancialProfile {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  investments: Investment[];
  loans: Loan[];
  insurance: InsurancePolicy[];
  taxes: TaxRecord[];
}
