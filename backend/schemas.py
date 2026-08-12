from enum import Enum
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator

class GoalCategory(str, Enum):
    EMERGENCY_FUND = "Emergency Fund"
    TRAVEL = "Travel"
    VEHICLE = "Vehicle"
    HOME = "Home"
    EDUCATION = "Education"
    ELECTRONICS = "Electronics"
    INVESTMENT = "Investment"
    DEBT_PAYOFF = "Debt Payoff"
    RETIREMENT = "Retirement"
    OTHER = "Other"

class GoalPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class GoalStatus(str, Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    PAUSED = "Paused"
    CANCELLED = "Cancelled"
    ARCHIVED = "Archived"

class GoalBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    category: GoalCategory
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    target_date: datetime
    priority: GoalPriority
    status: GoalStatus = GoalStatus.ACTIVE
    linked_account_id: Optional[str] = None
    monthly_contribution: float = Field(default=0.0, ge=0)

    @field_validator("target_date")
    def validate_target_date(cls, v):
        if v.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise ValueError("Target date must be in the future")
        return v

class GoalCreate(GoalBase):
    user_id: int

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[GoalCategory] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    target_date: Optional[datetime] = None
    priority: Optional[GoalPriority] = None
    status: Optional[GoalStatus] = None
    linked_account_id: Optional[str] = None
    monthly_contribution: Optional[float] = Field(None, ge=0)

    @field_validator("target_date")
    def validate_target_date(cls, v):
        if v and v.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise ValueError("Target date must be in the future")
        return v

class GoalOut(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoalDetailOut(GoalOut):
    progress: float
    remaining_amount: float
    days_remaining: int
    months_remaining: int
    required_monthly_contribution: float
    planned_monthly_contribution: float
    average_monthly_cashflow: float
    feasibility: str
    status: str

class GoalSummaryOut(BaseModel):
    total_active_goals: int
    total_target_amount: float
    total_current_amount: float
    total_remaining: float
    overall_progress: float
    planned_monthly_contributions: float
    average_monthly_cashflow: float
    on_track_goals: int
    at_risk_goals: int
    completed_goals: int
    overdue_goals: int

class GoalContributionBase(BaseModel):
    transaction_id: Optional[str] = None
    amount: float = Field(..., gt=0)
    contribution_date: Optional[datetime] = None

class GoalContributionCreate(GoalContributionBase):
    pass

class GoalContributionOut(GoalContributionBase):
    id: int
    goal_id: int
    contribution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class MonthlyProjectionPoint(BaseModel):
    month_index: int
    projected_date: datetime
    projected_amount: float

class GoalProjectionOut(BaseModel):
    goal_id: int
    projection_available: bool
    reason: Optional[str] = None
    projection_basis: Optional[str] = None
    current_amount: Optional[float] = None
    target_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    monthly_projection: Optional[float] = None
    months_required: Optional[int] = None
    projected_completion_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    schedule_status: Optional[str] = None
    difference_from_required: Optional[float] = None
    confidence: Optional[str] = None
    confidence_reason: Optional[str] = None
    monthly_projection_data: Optional[List[MonthlyProjectionPoint]] = None

class GoalSimulationScenario(BaseModel):
    additional_monthly_savings: float = 0.0
    monthly_expense_change: float = 0.0
    monthly_income_change: float = 0.0
    one_time_contribution: float = 0.0

class BaselineComparisonData(BaseModel):
    months: int
    completion_date: str
    target_status: str

class SimulationComparisonData(BaseModel):
    months: int
    completion_date: str
    target_status: str

class ComparisonResultData(BaseModel):
    months_saved: int
    months_lost: int
    status: str

class GoalSimulationOut(BaseModel):
    goal_id: int
    scenario: GoalSimulationScenario
    baseline: BaselineComparisonData
    simulation: SimulationComparisonData
    comparison: ComparisonResultData
    monthly_projection: List[MonthlyProjectionPoint]

class GoalPredictionSummaryOut(BaseModel):
    total_goals_analyzed: int
    goals_on_track: int
    goals_at_risk: int
    earliest_completion_date: Optional[datetime] = None
    latest_completion_date: Optional[datetime] = None
    overall_confidence: str

class GoalComparisonItem(BaseModel):
    goal_id: int
    name: str
    target_amount: float
    remaining_amount: float
    projected_months: int
    schedule_status: str
    monthly_projection: float
    projected_completion_date: Optional[datetime] = None

class BillCategory(str, Enum):
    HOUSING = "Housing"
    UTILITIES = "Utilities"
    INTERNET = "Internet"
    MOBILE = "Mobile"
    INSURANCE = "Insurance"
    LOAN = "Loan"
    CREDIT_CARD = "Credit Card"
    SUBSCRIPTION = "Subscription"
    EDUCATION = "Education"
    HEALTHCARE = "Healthcare"
    INVESTMENT = "Investment"
    OTHER = "Other"

class BillFrequency(str, Enum):
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    HALF_YEARLY = "Half-Yearly"
    YEARLY = "Yearly"

class BillStatus(str, Enum):
    ACTIVE = "Active"
    PAUSED = "Paused"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"

class BillBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: BillCategory
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    frequency: BillFrequency
    due_day: int = Field(..., ge=1, le=31)
    start_date: datetime
    end_date: Optional[datetime] = None
    account_id: Optional[str] = None
    status: BillStatus = BillStatus.ACTIVE
    auto_pay: bool = False
    notes: Optional[str] = None

    @field_validator("end_date")
    def validate_end_date(cls, v, info):
        start_date = info.data.get("start_date")
        if v and start_date and v < start_date:
            raise ValueError("End date must be after start date")
        return v

class BillCreate(BillBase):
    user_id: int

class BillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[BillCategory] = None
    amount: Optional[float] = Field(None, gt=0)
    frequency: Optional[BillFrequency] = None
    due_day: Optional[int] = Field(None, ge=1, le=31)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    account_id: Optional[str] = None
    status: Optional[BillStatus] = None
    auto_pay: Optional[bool] = None
    notes: Optional[str] = None

    @field_validator("end_date")
    def validate_end_date(cls, v, info):
        start_date = info.data.get("start_date")
        if v and start_date and v < start_date:
            raise ValueError("End date must be after start date")
        return v

class BillStatusUpdate(BaseModel):
    status: BillStatus

class BillOut(BillBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CategoryRecurring(BaseModel):
    category: str
    monthly_amount: float
    annual_amount: float
    percentage: float

class BillRecurringDetail(BaseModel):
    id: int
    name: str
    category: str
    amount: float
    frequency: str
    monthly_equivalent: float
    annual_equivalent: float

class RecurringSummaryResponse(BaseModel):
    monthly_recurring: float
    annual_recurring: float
    active_bill_count: int
    income_available: bool
    monthly_income: Optional[float] = None
    recurring_expense_ratio: float
    income_after_recurring_bills: float
    categories: List[CategoryRecurring]
    bills: List[BillRecurringDetail]

class UpcomingBillOccurrence(BaseModel):
    bill_id: int
    bill_name: str
    category: str
    amount: float
    currency: str
    due_date: str
    frequency: str
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    auto_pay: bool
    days_until_due: int
    status: str

class NextBillSummary(BaseModel):
    name: str
    amount: float
    due_date: str

class UpcomingBillsSummaryResponse(BaseModel):
    total_upcoming_amount: float
    bill_count: int
    next_bill: Optional[NextBillSummary] = None
    next_7_days_amount: float
    next_30_days_amount: float
    next_90_days_amount: float

class MatchedTransactionDetail(BaseModel):
    transaction_id: str
    transaction_date: str
    actual_amount: float
    days_difference: int
    score: int
    match_reasons: List[str]

class BillMatchResult(BaseModel):
    bill_id: int
    occurrence_date: str
    expected_amount: float
    matched_transactions: List[MatchedTransactionDetail]
    matched: bool
    total_matched_amount: float

class BillReconciliationStatus(str, Enum):
    UPCOMING = "UPCOMING"
    DUE = "DUE"
    PAID = "PAID"
    PAID_LATE = "PAID_LATE"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    OVERPAID = "OVERPAID"
    UNPAID = "UNPAID"
    OVERDUE = "OVERDUE"

class BillReconciliationResult(BaseModel):
    bill_id: int
    bill_name: str
    occurrence_date: str
    expected_amount: float
    status: BillReconciliationStatus
    paid_amount: float
    remaining_amount: float
    overpayment_amount: float
    payment_count: int
    first_payment_date: Optional[str] = None
    final_payment_date: Optional[str] = None
    days_late: int
    days_overdue: int
    matched_transaction_ids: List[str]
    match_confidence: float
    reconciliation_reason: str

class ReconciliationSummary(BaseModel):
    total_bills: int
    paid: int
    paid_late: int
    partially_paid: int
    overpaid: int
    unpaid: int
    overdue: int
    total_expected: float
    total_paid: float
    total_remaining: float

class BillReconciliationResponse(BaseModel):
    user_id: int
    start_date: str
    end_date: str
    occurrences: List[UpcomingBillOccurrence]
    results: List[BillReconciliationResult]
    summary: ReconciliationSummary
