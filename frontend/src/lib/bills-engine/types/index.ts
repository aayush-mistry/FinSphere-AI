export type BillCategory = 
  | "Housing"
  | "Utilities"
  | "Internet"
  | "Mobile"
  | "Insurance"
  | "Loan"
  | "Credit Card"
  | "Subscription"
  | "Education"
  | "Healthcare"
  | "Investment"
  | "Other";

export type BillFrequency = 
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Yearly";

export type BillStatus = 
  | "Active"
  | "Paused"
  | "Cancelled"
  | "Completed";

export interface Bill {
  id: number;
  user_id: number;
  name: string;
  category: BillCategory;
  amount: number;
  currency: string;
  frequency: BillFrequency;
  due_day: number;
  start_date: string;
  end_date: string | null;
  account_id: string | null;
  status: BillStatus;
  auto_pay: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBillPayload {
  name: string;
  category: BillCategory;
  amount: number;
  currency?: string;
  frequency: BillFrequency;
  due_day: number;
  start_date: string;
  end_date?: string | null;
  account_id?: string | null;
  status?: BillStatus;
  auto_pay?: boolean;
  notes?: string | null;
}

export interface UpdateBillPayload {
  name?: string;
  category?: BillCategory;
  amount?: number;
  currency?: string;
  frequency?: BillFrequency;
  due_day?: number;
  start_date?: string;
  end_date?: string | null;
  account_id?: string | null;
  status?: BillStatus;
  auto_pay?: boolean;
  notes?: string | null;
}

export interface CategoryRecurring {
  category: string;
  monthly_amount: number;
  annual_amount: number;
  percentage: number;
}

export interface BillRecurringDetail {
  id: number;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  monthly_equivalent: number;
  annual_equivalent: number;
}

export interface RecurringSummaryResponse {
  monthly_recurring: number;
  annual_recurring: number;
  active_bill_count: number;
  income_available: boolean;
  monthly_income: number | null;
  recurring_expense_ratio: number;
  income_after_recurring_bills: number;
  categories: CategoryRecurring[];
  bills: BillRecurringDetail[];
}

export interface UpcomingBillOccurrence {
  bill_id: number;
  bill_name: string;
  category: string;
  amount: number;
  currency: string;
  due_date: string;
  frequency: string;
  account_id: number | null;
  account_name: string | null;
  auto_pay: boolean;
  days_until_due: number;
  status: string;
}

export interface NextBillSummary {
  name: string;
  amount: number;
  due_date: string;
}

export interface UpcomingBillsSummaryResponse {
  total_upcoming_amount: number;
  bill_count: number;
  next_bill: NextBillSummary | null;
  next_7_days_amount: number;
  next_30_days_amount: number;
  next_90_days_amount: number;
}

export type BillReconciliationStatus = 
  | "UPCOMING"
  | "DUE"
  | "PAID"
  | "PAID_LATE"
  | "PARTIALLY_PAID"
  | "OVERPAID"
  | "UNPAID"
  | "OVERDUE";

export interface BillReconciliationResult {
  bill_id: number;
  bill_name: string;
  occurrence_date: string;
  expected_amount: number;
  status: BillReconciliationStatus;
  paid_amount: number;
  remaining_amount: number;
  overpayment_amount: number;
  payment_count: number;
  first_payment_date: string | null;
  final_payment_date: string | null;
  days_late: number;
  days_overdue: number;
  matched_transaction_ids: string[];
  match_confidence: number;
  reconciliation_reason: string;
}

export interface ReconciliationSummary {
  total_bills: number;
  paid: number;
  paid_late: number;
  partially_paid: number;
  overpaid: number;
  unpaid: number;
  overdue: number;
  total_expected: number;
  total_paid: number;
  total_remaining: number;
}

export interface BillReconciliationResponse {
  user_id: number;
  start_date: string;
  end_date: string;
  occurrences: UpcomingBillOccurrence[];
  results: BillReconciliationResult[];
  summary: ReconciliationSummary;
}
