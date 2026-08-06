import { Account, PortfolioAllocation } from '../types';

export function aggregateAccounts(accounts: Account[]): {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  portfolioAllocation: PortfolioAllocation[];
} {
  let totalAssets = 0;
  let totalLiabilities = 0;

  accounts.forEach((acc) => {
    if (acc.balance >= 0) {
      totalAssets += acc.balance;
    } else {
      totalLiabilities += Math.abs(acc.balance);
    }
  });

  const netWorth = totalAssets - totalLiabilities;

  // Calculate portfolio allocation strictly for investment and savings accounts
  const assetAccounts = accounts.filter(a => a.type === 'investment' || a.type === 'savings');
  const portfolioTotal = assetAccounts.reduce((sum, acc) => sum + Math.max(0, acc.balance), 0);
  
  const portfolioAllocation: PortfolioAllocation[] = assetAccounts.map(acc => ({
    assetClass: acc.name,
    value: Math.max(0, acc.balance),
    percentage: portfolioTotal > 0 ? (Math.max(0, acc.balance) / portfolioTotal) * 100 : 0,
  }));

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    portfolioAllocation,
  };
}
