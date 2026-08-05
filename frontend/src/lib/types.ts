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

// New Types for Dashboard Widgets

export type InsightSeverity = "success" | "info" | "warning" | "critical";

export type Insight = {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  estimatedCompletion: string;
  recommendation: string;
};

export type BillStatus = "paid" | "upcoming" | "overdue" | "critical";

export type Bill = {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  status: BillStatus;
  paymentMethod: string;
  companyLogo?: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type AIAlert = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  suggestedAction: string;
  timestamp: string;
};
