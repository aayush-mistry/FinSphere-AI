export type DashboardSummary = {
  totalNetWorth: number;
  monthlyCashFlow: number;
  financialHealthScore: number;
};

export type Transaction = {
  id: number;
  account_id: number;
  amount: number;
  date: string;
  category: string;
  status: string;
  is_flagged_fraud: boolean;
};

export type PortfolioAllocation = {
  name: string;
  value: number;
};

export type SimulationRequest = {
  net_worth: number;
  house_cost: number;
  downpayment: number;
  loan_rate: number;
  job_loss_months: number;
};

export type SimulationPoint = {
  month: number;
  baseline: number;
  simulated: number;
};

export type FraudScanResult = {
  risk_score: number;
  reason: string;
};
