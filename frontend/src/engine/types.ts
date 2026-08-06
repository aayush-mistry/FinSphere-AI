// Raw Entity Types

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution: string;
  apy?: number; // Annual Percentage Yield for savings/investments
  apr?: number; // Annual Percentage Rate for credit_cards/loans
  limit?: number; // Credit limit
}

export type TransactionCategory = 
  | 'Housing' | 'Food' | 'Transportation' | 'Utilities' 
  | 'Insurance' | 'Healthcare' | 'Savings' | 'Personal'
  | 'Entertainment' | 'Income' | 'Transfer' | 'Debt';

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number; // Positive is income, negative is expense (or context dependent)
  category: TransactionCategory;
  merchant: string;
  isRecurring: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isAutoPay: boolean;
  category: string;
}

export interface InsurancePolicy {
  id: string;
  type: 'health' | 'auto' | 'home' | 'life';
  provider: string;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'annual';
  coverageLimit: number;
}

export interface TaxSummary {
  year: number;
  estimatedOwed: number;
  paidYtd: number;
  effectiveTaxRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired';
  annualSalary: number;
  dependents: number;
}

export interface BusinessMetrics {
  mrr: number; // Monthly Recurring Revenue
  runwayMonths: number;
  burnRate: number;
  activeCustomers: number;
}

export interface AIAlert {
  id: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  message: string;
  date: string;
}

// Aggregated Context Types

export interface SpendingSummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
}

export interface CashFlow {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  savingsRate: number; // (netCashFlow / monthlyIncome) * 100
}

export interface PortfolioAllocation {
  assetClass: string;
  value: number;
  percentage: number;
}

export interface FinancialHealth {
  score: number; // 0-100
  factors: {
    emergencyFund: 'poor' | 'fair' | 'good' | 'excellent';
    debtToIncome: 'poor' | 'fair' | 'good' | 'excellent';
    savingsRate: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

export interface FinancialContext {
  // Core Identifiers
  userId: string;
  timestamp: string;

  // Profile
  profile: UserProfile;

  // Aggregates
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  cashFlow: CashFlow;
  spendingSummary: SpendingSummary[];
  financialHealth: FinancialHealth;

  // Raw & Processed Collections
  accounts: Account[];
  recentTransactions: Transaction[]; // Limited to top 10 for AI context
  goals: Goal[];
  upcomingBills: Bill[];
  portfolioAllocation: PortfolioAllocation[];
  insurancePolicies: InsurancePolicy[];
  taxSummary: TaxSummary;
  alerts: AIAlert[];

  // Optional Context
  businessMetrics?: BusinessMetrics;
}
