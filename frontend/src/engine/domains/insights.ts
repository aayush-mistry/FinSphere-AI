import { CashFlow } from '../types';

export function calculateFinancialHealth(cashFlow: CashFlow, totalLiabilities: number): {
  score: number;
  factors: {
    emergencyFund: 'poor' | 'fair' | 'good' | 'excellent';
    debtToIncome: 'poor' | 'fair' | 'good' | 'excellent';
    savingsRate: 'poor' | 'fair' | 'good' | 'excellent';
  };
} {
  // 1. Savings Rate Analysis
  let savingsFactor: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
  let savingsPoints = 0;
  if (cashFlow.savingsRate >= 20) {
    savingsFactor = 'excellent';
    savingsPoints = 35;
  } else if (cashFlow.savingsRate >= 10) {
    savingsFactor = 'good';
    savingsPoints = 25;
  } else if (cashFlow.savingsRate > 0) {
    savingsFactor = 'fair';
    savingsPoints = 15;
  }

  // 2. Debt to Income Ratio
  let dtiFactor: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
  let dtiPoints = 0;
  // Approximation for DTI (Monthly Liabilities / Monthly Income)
  const estimatedMonthlyDebtPayment = totalLiabilities * 0.02; 
  const dti = cashFlow.monthlyIncome > 0 ? (estimatedMonthlyDebtPayment / cashFlow.monthlyIncome) * 100 : 100;
  
  if (dti < 15) {
    dtiFactor = 'excellent';
    dtiPoints = 35;
  } else if (dti < 30) {
    dtiFactor = 'good';
    dtiPoints = 25;
  } else if (dti < 45) {
    dtiFactor = 'fair';
    dtiPoints = 10;
  }

  // 3. Emergency Fund Proxy (simulated via CashFlow positivity)
  let emergencyFactor: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
  let emergencyPoints = 0;
  if (cashFlow.netCashFlow > cashFlow.monthlyExpenses) {
    emergencyFactor = 'excellent';
    emergencyPoints = 30;
  } else if (cashFlow.netCashFlow > 0) {
    emergencyFactor = 'good';
    emergencyPoints = 20;
  } else if (cashFlow.netCashFlow > -500) {
    emergencyFactor = 'fair';
    emergencyPoints = 10;
  }

  const score = Math.min(100, savingsPoints + dtiPoints + emergencyPoints);

  return {
    score,
    factors: {
      emergencyFund: emergencyFactor,
      debtToIncome: dtiFactor,
      savingsRate: savingsFactor,
    }
  };
}
