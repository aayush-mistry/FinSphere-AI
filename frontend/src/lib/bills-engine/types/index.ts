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
