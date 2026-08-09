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

