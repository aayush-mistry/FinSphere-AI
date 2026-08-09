import calendar
from datetime import datetime, timezone
from typing import List, Dict, Any
from models import Goal, GoalContribution
from services.goal_calculator import calculate_goal_metrics

def add_months(d: datetime, months: int) -> datetime:
    new_month = d.month + months
    year_bump = (new_month - 1) // 12
    new_year = d.year + year_bump
    new_month = (new_month - 1) % 12 + 1
    try:
        return d.replace(year=new_year, month=new_month)
    except ValueError:
        last_day = calendar.monthrange(new_year, new_month)[1]
        return d.replace(year=new_year, month=new_month, day=last_day)

def _determine_historical_baseline(contributions: List[GoalContribution]) -> float:
    """
    Groups contributions by calendar month. 
    If contributions exist across at least 2 distinct months, compute the average monthly contribution.
    Returns 0.0 if insufficient data.
    """
    if not contributions:
        return 0.0
        
    monthly_totals: Dict[str, float] = {}
    for c in contributions:
        # Key by "YYYY-MM"
        month_key = f"{c.contribution_date.year}-{c.contribution_date.month:02d}"
        monthly_totals[month_key] = monthly_totals.get(month_key, 0.0) + c.amount
        
    if len(monthly_totals) >= 2:
        return sum(monthly_totals.values()) / len(monthly_totals)
    return 0.0

def generate_projection(goal: Goal, contributions: List[GoalContribution], average_cashflow: float, current_date: datetime = None) -> dict:
    if current_date is None:
        current_date = datetime.now(timezone.utc)
    if current_date.tzinfo is None:
        current_date = current_date.replace(tzinfo=timezone.utc)
        
    # Base calculation metrics
    metrics = calculate_goal_metrics(
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        planned_monthly_contribution=goal.monthly_contribution,
        current_date=current_date
    )
    
    remaining_amount = metrics["remaining_amount"]
    required_monthly_contribution = metrics["required_monthly_contribution"]
    
    # 1. Edge Case: Cancelled/Paused
    if goal.status in ["Cancelled", "Paused"]:
        return {
            "goal_id": goal.id,
            "projection_available": False,
            "reason": f"Goal is currently {goal.status.lower()}."
        }

    # 2. Edge Case: Goal Completed
    if remaining_amount == 0.0 or goal.status == "Completed":
        return {
            "goal_id": goal.id,
            "projection_available": True,
            "projection_basis": "completed",
            "current_amount": goal.current_amount,
            "target_amount": goal.target_amount,
            "remaining_amount": 0.0,
            "monthly_projection": 0.0,
            "months_required": 0,
            "projected_completion_date": current_date.isoformat(),
            "target_date": goal.target_date.isoformat(),
            "schedule_status": "ahead" if current_date < goal.target_date.replace(tzinfo=timezone.utc) else "on_track",
            "difference_from_required": 0.0,
            "confidence": "high",
            "confidence_reason": "Goal is already completed.",
            "monthly_projection_data": []
        }

    # Determine Projection Basis Hierarchy
    historical_avg = _determine_historical_baseline(contributions)
    
    projection_basis = None
    monthly_projection = 0.0
    confidence = "low"
    confidence_reason = ""
    
    if historical_avg > 0:
        projection_basis = "historical_contributions"
        monthly_projection = historical_avg
        confidence = "high"
        confidence_reason = "Projection is based on your actual historical contribution average."
    elif goal.monthly_contribution > 0:
        projection_basis = "planned_contribution"
        monthly_projection = goal.monthly_contribution
        confidence = "medium"
        confidence_reason = "Projection is based on the configured monthly contribution because insufficient historical goal contributions exist."
    elif average_cashflow > 0:
        projection_basis = "cash_flow_capacity"
        monthly_projection = average_cashflow
        confidence = "low"
        confidence_reason = "Projection is based on your overall average cash flow because no goal-specific contribution plans or history exist."
        
    if monthly_projection <= 0:
        return {
            "goal_id": goal.id,
            "projection_available": False,
            "reason": "Insufficient contribution data. Please configure a monthly contribution, add historical contributions, or establish a positive cash flow."
        }
        
    # Project Month by Month
    monthly_data = []
    projected_amount = goal.current_amount
    months_required = 0
    max_months = 1200 # 100 years hard limit
    
    # Month 0 (Current)
    monthly_data.append({
        "month_index": 0,
        "projected_date": current_date.isoformat(),
        "projected_amount": round(projected_amount, 2)
    })
    
    simulated_date = current_date
    while projected_amount < goal.target_amount and months_required < max_months:
        months_required += 1
        projected_amount += monthly_projection
        simulated_date = add_months(current_date, months_required)
        
        monthly_data.append({
            "month_index": months_required,
            "projected_date": simulated_date.isoformat(),
            "projected_amount": round(min(projected_amount, goal.target_amount), 2)
        })
        
    projected_completion_date = simulated_date
    
    # Schedule Status logic
    target_dt = goal.target_date
    if target_dt.tzinfo is None:
        target_dt = target_dt.replace(tzinfo=timezone.utc)
        
    # Compare purely by year/month to avoid day boundaries issues
    projected_ym = projected_completion_date.year * 12 + projected_completion_date.month
    target_ym = target_dt.year * 12 + target_dt.month
    current_ym = current_date.year * 12 + current_date.month
    
    if projected_ym < target_ym:
        schedule_status = "ahead"
    elif projected_ym == target_ym:
        schedule_status = "on_track"
    else: # projected_ym > target_ym
        if current_ym > target_ym:
            schedule_status = "overdue"
        else:
            schedule_status = "behind"
            
    difference_from_required = monthly_projection - required_monthly_contribution
    
    return {
        "goal_id": goal.id,
        "projection_available": True,
        "projection_basis": projection_basis,
        "current_amount": round(goal.current_amount, 2),
        "target_amount": round(goal.target_amount, 2),
        "remaining_amount": round(remaining_amount, 2),
        "monthly_projection": round(monthly_projection, 2),
        "months_required": months_required,
        "projected_completion_date": projected_completion_date.isoformat(),
        "target_date": target_dt.isoformat(),
        "schedule_status": schedule_status,
        "difference_from_required": round(difference_from_required, 2),
        "confidence": confidence,
        "confidence_reason": confidence_reason,
        "monthly_projection_data": monthly_data
    }
