export type GoalType = 
  | 'house' 
  | 'car' 
  | 'emergency_fund' 
  | 'retirement' 
  | 'vacation' 
  | 'education' 
  | 'wedding' 
  | 'business' 
  | 'investment' 
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export interface GoalModel {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  expectedReturnRate: number; // e.g., 0.05 for 5% APY
  inflationRate: number; // e.g., 0.025 for 2.5% inflation
  priority: GoalPriority;
  deadline: string; // ISO Date String
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioModifiers {
  monthlyContributionAdjustment: number;
  salaryIncrease: number; // Additional monthly income available for goals
  medicalExpense: number; // Immediate deduction from current savings
  inflationAdjustment: number; // E.g., +0.01 for 1% higher inflation
  returnRateAdjustment: number; // E.g., -0.02 for market crash
}

export interface ScenarioPoint {
  month: number;
  date: string;
  expectedValue: number;
  bestCaseValue: number;
  worstCaseValue: number;
  inflationAdjustedTarget: number;
}

export interface PredictionMetrics {
  currentProgressPercent: number;
  remainingAmount: number;
  requiredMonthlySavings: number; // To hit deadline
  projectedCompletionDate: string | null; // Date if achievable, null if impossible
  successProbability: number; // 0-100%
  impactOfInflation: number; // Extra money required due to inflation
  compoundGrowthTotal: number; // Total interest earned
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
}

export interface GoalRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  estimatedFinancialImpact: number;
  reason: string;
  actionPlan: string;
}

export interface GoalEngineResult {
  goal: GoalModel;
  metrics: PredictionMetrics;
  timeline: ScenarioPoint[];
  recommendations: GoalRecommendation[];
}
