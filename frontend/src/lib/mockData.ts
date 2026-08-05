import { AIAlert, Bill, Goal, Insight } from "./types";

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "insight-1",
    title: "Spending Increase",
    description: "Spending increased 18% this month compared to last month.",
    severity: "warning",
    category: "Overview",
  },
  {
    id: "insight-2",
    title: "Dining Alert",
    description: "Dining expenses are 25% above your monthly average.",
    severity: "info",
    category: "Dining",
  },
  {
    id: "insight-3",
    title: "Subscription Savings",
    description: "You can save ₹3,500/month by reducing unused subscription costs.",
    severity: "success",
    category: "Subscriptions",
  },
  {
    id: "insight-4",
    title: "Emergency Fund Risk",
    description: "Your emergency fund covers only 2 months of expenses. Aim for 6 months.",
    severity: "critical",
    category: "Savings",
  },
  {
    id: "insight-5",
    title: "Investment Concentration",
    description: "Investment allocation is overly concentrated in one asset class (Equities).",
    severity: "warning",
    category: "Investments",
  },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: "goal-1",
    name: "Emergency Fund",
    targetAmount: 500000,
    savedAmount: 320000,
    estimatedCompletion: "March 2028",
    recommendation: "Increase monthly savings by ₹2,000 to reach your goal six months earlier.",
  },
  {
    id: "goal-2",
    name: "Buy a House",
    targetAmount: 20000000,
    savedAmount: 4500000,
    estimatedCompletion: "June 2030",
    recommendation: "Consider reallocating 5% of low-yield bonds to higher-yield index funds.",
  },
  {
    id: "goal-3",
    name: "Vacation",
    targetAmount: 150000,
    savedAmount: 45000,
    estimatedCompletion: "November 2026",
    recommendation: "You are on track! Keep saving ₹15,000 per month.",
  },
];

export const MOCK_BILLS: Bill[] = [
  {
    id: "bill-1",
    name: "Electricity",
    dueDate: "Due Tomorrow",
    amount: 1840,
    status: "upcoming",
    paymentMethod: "Pending",
  },
  {
    id: "bill-2",
    name: "Credit Card",
    dueDate: "Due in 3 Days",
    amount: 12400,
    status: "critical",
    paymentMethod: "High Priority",
  },
  {
    id: "bill-3",
    name: "Netflix",
    dueDate: "Auto Debit",
    amount: 649,
    status: "paid",
    paymentMethod: "Paid Automatically",
  },
  {
    id: "bill-4",
    name: "Home Loan EMI",
    dueDate: "Overdue by 1 Day",
    amount: 45000,
    status: "overdue",
    paymentMethod: "Failed transaction",
  },
];

export const MOCK_ALERTS: AIAlert[] = [
  {
    id: "alert-1",
    title: "High Credit Utilization",
    description: "Your credit card utilization has reached 75%.",
    severity: "warning",
    suggestedAction: "Pay down balance to improve credit score.",
    timestamp: "2 hours ago",
  },
  {
    id: "alert-2",
    title: "Potential Fraud Detected",
    description: "Unusual international transaction of ₹45,000 spotted.",
    severity: "critical",
    suggestedAction: "Review transaction immediately.",
    timestamp: "4 hours ago",
  },
  {
    id: "alert-3",
    title: "Insurance Renewal Due",
    description: "Your health insurance policy expires in 15 days.",
    severity: "info",
    suggestedAction: "Renew policy now.",
    timestamp: "1 day ago",
  },
];
