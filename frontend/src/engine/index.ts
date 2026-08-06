import { FinancialContext } from './types';
import { aggregateTransactions } from './domains/transactions';
import { aggregateAccounts } from './domains/accounts';
import { calculateFinancialHealth } from './domains/insights';
import { processProfile } from './domains/profile';

// Import Adapters
import {
  mockUserProfile,
  mockAccounts,
  mockTransactions,
  mockGoals,
  mockBills,
  mockInsurance,
  mockTaxSummary,
  mockAlerts,
  mockBusinessMetrics
} from './adapters/mockData';

export interface ContextOptions {
  isBusinessMode?: boolean;
}

/**
 * Core Orchestrator: Fetches raw data and synthesizes the global FinancialContext
 */
export async function getFinancialContext(userId: string, options?: ContextOptions): Promise<FinancialContext> {
  // 1. In a real app, we would fetch data for `userId` here.
  // For the context engine foundation, we use the mock adapters.
  const rawProfile = mockUserProfile;
  const accounts = mockAccounts;
  const transactions = mockTransactions;
  const goals = mockGoals;
  const bills = mockBills;
  const insurance = mockInsurance;
  const tax = mockTaxSummary;
  const alerts = mockAlerts;

  // 2. Pass data through Domain Aggregators
  const { cashFlow, spendingSummary } = aggregateTransactions(transactions);
  const { netWorth, totalAssets, totalLiabilities, portfolioAllocation } = aggregateAccounts(accounts);
  const financialHealth = calculateFinancialHealth(cashFlow, totalLiabilities);
  const { profile, insurancePolicies, taxSummary } = processProfile(rawProfile, insurance, tax);

  // 3. Assemble the deterministic Context Object
  const context: FinancialContext = {
    userId,
    timestamp: new Date().toISOString(),
    
    // Aggregates
    profile,
    netWorth,
    totalAssets,
    totalLiabilities,
    cashFlow,
    spendingSummary,
    financialHealth,
    
    // Raw collections (Transactions limited to top 10 for AI efficiency)
    accounts,
    recentTransactions: transactions.slice(0, 10),
    goals,
    upcomingBills: bills,
    portfolioAllocation,
    insurancePolicies,
    taxSummary,
    alerts,
  };

  if (options?.isBusinessMode) {
    context.businessMetrics = mockBusinessMetrics;
  }

  return context;
}
