from datetime import datetime, timezone

def calculate_goal_metrics(
    target_amount: float,
    current_amount: float,
    target_date: datetime,
    planned_monthly_contribution: float,
    current_date: datetime = None
) -> dict:
    """
    Calculates deterministic financial progress for a goal.
    """
    if current_date is None:
        current_date = datetime.now(timezone.utc)
    
    if current_date.tzinfo is None:
        current_date = current_date.replace(tzinfo=timezone.utc)
    if target_date.tzinfo is None:
        target_date = target_date.replace(tzinfo=timezone.utc)

    # 1. Progress
    if target_amount > 0:
        progress = (current_amount / target_amount) * 100
    else:
        progress = 100.0
    progress = min(max(progress, 0.0), 100.0)

    # 2. Remaining Amount
    remaining_amount = max(target_amount - current_amount, 0.0)

    # 3. Time Remaining
    days_remaining = (target_date.date() - current_date.date()).days
    months_remaining = (target_date.year - current_date.year) * 12 + target_date.month - current_date.month
    
    # Calendar aware adjustment
    if target_date.day < current_date.day:
        months_remaining -= 1
        
    is_overdue = days_remaining < 0 and remaining_amount > 0

    # 4. Required Monthly Contribution
    if remaining_amount == 0.0:
        required_contribution = 0.0
    elif is_overdue or months_remaining <= 0:
        # If overdue or less than 1 full month remaining, the entire remaining amount is needed now.
        required_contribution = remaining_amount
    else:
        required_contribution = remaining_amount / months_remaining

    # 6. Goal Status
    if remaining_amount == 0.0:
        status = "Completed"
    elif is_overdue:
        status = "Overdue"
    elif planned_monthly_contribution >= required_contribution:
        status = "On Track"
    else:
        status = "At Risk"

    return {
        "progress_percentage": round(progress, 2),
        "remaining_amount": round(remaining_amount, 2),
        "target_date": target_date.isoformat(),
        "days_remaining": max(days_remaining, 0),
        "months_remaining": max(months_remaining, 0),
        "required_monthly_contribution": round(required_contribution, 2),
        "status": status
    }

def assess_goal_feasibility(required_monthly_contribution: float, average_monthly_cashflow: float) -> str:
    """
    Assesses if a goal's required monthly contribution is feasible
    based on historical average monthly cash flow.
    """
    if required_monthly_contribution <= average_monthly_cashflow:
        return "Potentially Achievable"
    return "Currently Not Supported"

