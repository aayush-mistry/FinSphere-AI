export interface GoalPredictionSummaryOut {
  total_goals_analyzed: number;
  goals_on_track: number;
  goals_at_risk: number;
  earliest_completion_date: string | null;
  latest_completion_date: string | null;
  overall_confidence: string;
}

export interface GoalComparisonItem {
  goal_id: number;
  name: string;
  target_amount: number;
  remaining_amount: number;
  projected_months: number;
  schedule_status: string;
  monthly_projection: number;
  projected_completion_date: string | null;
}

export interface GoalSummaryOut {
  total_active_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  total_remaining: number;
  overall_progress: number;
  planned_monthly_contributions: number;
  average_monthly_cashflow: number;
  on_track_goals: number;
  at_risk_goals: number;
  completed_goals: number;
  overdue_goals: number;
}

export interface GoalOut {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  category: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  status: string;
  linked_account_id: string | null;
  monthly_contribution: number;
  created_at: string;
  updated_at: string;
}

export interface GoalDetailOut extends GoalOut {
  progress: number;
  remaining_amount: number;
  days_remaining: number;
  months_remaining: number;
  required_monthly_contribution: number;
  planned_monthly_contribution: number;
  average_monthly_cashflow: number;
  feasibility: string;
}

export interface GoalContributionOut {
  id: number;
  goal_id: number;
  transaction_id: string | null;
  amount: number;
  contribution_date: string;
  created_at: string;
}

export interface MonthlyProjectionPoint {
  month_index: number;
  projected_date: string;
  projected_amount: number;
}

export interface GoalProjectionOut {
  goal_id: number;
  projection_available: boolean;
  reason: string | null;
  projection_basis: string | null;
  current_amount: number | null;
  target_amount: number | null;
  remaining_amount: number | null;
  monthly_projection: number | null;
  months_required: number | null;
  projected_completion_date: string | null;
  target_date: string | null;
  schedule_status: string | null;
  difference_from_required: number | null;
  confidence: string | null;
  confidence_reason: string | null;
  monthly_projection_data: MonthlyProjectionPoint[] | null;
}

export interface GoalSimulationScenario {
  additional_monthly_savings: number;
  monthly_expense_change: number;
  monthly_income_change: number;
  one_time_contribution: number;
}

export interface BaselineComparisonData {
  months: number;
  completion_date: string;
  target_status: string;
}

export interface SimulationComparisonData {
  months: number;
  completion_date: string;
  target_status: string;
}

export interface ComparisonResultData {
  months_saved: number;
  months_lost: number;
  status: string;
}

export interface GoalSimulationOut {
  goal_id: number;
  scenario: GoalSimulationScenario;
  baseline: BaselineComparisonData;
  simulation: SimulationComparisonData;
  comparison: ComparisonResultData;
  monthly_projection: MonthlyProjectionPoint[];
}
