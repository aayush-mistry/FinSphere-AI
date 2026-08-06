export type AlertCategory = 
  | 'cash_flow'
  | 'bills'
  | 'loans'
  | 'investments'
  | 'savings'
  | 'credit'
  | 'insurance'
  | 'taxes'
  | 'fraud'
  | 'business';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'ignored';

export interface AlertRecommendation {
  priority: AlertSeverity;
  confidence: number;
  estimatedSavings: number;
  estimatedFinancialImpact: number;
  reason: string;
  actionPlan: string;
}

export interface AlertModel {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  riskScore: number; // 0-100
  confidenceScore: number; // 0-1
  financialImpact: number;
  reason: string;
  suggestedAction: string;
  affectedAccounts: string[];
  relatedTransactions?: string[];
  timestamp: string;
  status: AlertStatus;
  aiExplanation: string;
  recommendations: AlertRecommendation[];
}

export interface GlobalRiskMetrics {
  overallRiskScore: number; // 0-100
  criticalAlertsCount: number;
  highAlertsCount: number;
  categoryDistribution: Record<AlertCategory, number>;
}

export interface AlertEngineResult {
  alerts: AlertModel[];
  metrics: GlobalRiskMetrics;
}
