export type BillCategory = 
  | 'utilities'
  | 'housing'
  | 'loans'
  | 'credit_cards'
  | 'insurance'
  | 'investments'
  | 'subscriptions'
  | 'taxes'
  | 'business'
  | 'custom';

export type BillFrequency = 'monthly' | 'annual' | 'quarterly' | 'weekly';
export type BillStatus = 'paid' | 'pending' | 'overdue' | 'paused';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface BillModel {
  id: string;
  name: string;
  category: BillCategory;
  provider: string;
  amount: number;
  dueDate: string; // ISO date
  frequency: BillFrequency;
  paymentMethod: string;
  autoPayEnabled: boolean;
  lateFee: number;
  status: BillStatus;
  priority: PriorityLevel;
  linkedAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeEvent {
  id: string;
  name: string;
  amount: number;
  date: string;
  isRecurring: boolean;
}

export interface CashFlowPoint {
  date: string;
  dayOffset: number; // 0 = today, 1 = tomorrow
  projectedBalance: number;
  events: {
    type: 'income' | 'bill';
    amount: number;
    name: string;
  }[];
}

export interface BillMetrics {
  daysUntilDue: number;
  monthlyBillTotal: number; // For the entire profile
  yearlyBillProjection: number; // For the entire profile
  upcomingCashOutflow: number; // Over next 30 days
  lateFeeRiskTotal: number;
  overallMonthlyCommitment: number;
}

export interface BillRecommendation {
  priority: PriorityLevel;
  confidence: number;
  estimatedFinancialImpact: number;
  reason: string;
  actionPlan: string;
}

export interface SmartAlert {
  id: string;
  severity: PriorityLevel;
  reason: string;
  financialImpact: number;
  suggestedAction: string;
  confidenceScore: number;
  date: string;
}

export interface BillEngineContext {
  currentLiquidBalance: number;
  bills: BillModel[];
  incomes: IncomeEvent[];
}

export interface BillEngineResult {
  metrics: BillMetrics;
  cashFlowForecast: CashFlowPoint[];
  alerts: SmartAlert[];
  recommendations: BillRecommendation[];
}
