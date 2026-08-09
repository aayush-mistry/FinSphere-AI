from datetime import datetime, timezone, timedelta
from services.goal_calculator import calculate_goal_metrics

def test_goal_calculator_base_case():
    """
    Test:
    Target = ₹120,000
    Current = ₹40,000
    Months = 8
    
    Expected:
    Remaining = ₹80,000
    Progress = 33.33%
    Required = ₹10,000/month
    """
    current_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
    # Exactly 8 months later
    target_date = datetime(2026, 9, 1, tzinfo=timezone.utc)
    
    metrics = calculate_goal_metrics(
        target_amount=120000,
        current_amount=40000,
        target_date=target_date,
        planned_monthly_contribution=10000,
        current_date=current_date
    )
    
    assert metrics["remaining_amount"] == 80000
    assert metrics["progress_percentage"] == 33.33
    assert metrics["months_remaining"] == 8
    assert metrics["required_monthly_contribution"] == 10000
    assert metrics["status"] == "On Track"

def test_completed_goal():
    """
    Completed goal: Current >= Target
    """
    current_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
    target_date = datetime(2026, 9, 1, tzinfo=timezone.utc)
    
    metrics = calculate_goal_metrics(
        target_amount=120000,
        current_amount=120000,
        target_date=target_date,
        planned_monthly_contribution=10000,
        current_date=current_date
    )
    
    assert metrics["remaining_amount"] == 0
    assert metrics["progress_percentage"] == 100.0
    assert metrics["required_monthly_contribution"] == 0.0
    assert metrics["status"] == "Completed"

def test_overfunded_goal():
    """
    Fully funded (overfunded) goal: Progress capped at 100%, Remaining capped at 0.
    """
    current_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
    target_date = datetime(2026, 9, 1, tzinfo=timezone.utc)
    
    metrics = calculate_goal_metrics(
        target_amount=10000,
        current_amount=15000,
        target_date=target_date,
        planned_monthly_contribution=1000,
        current_date=current_date
    )
    
    assert metrics["remaining_amount"] == 0
    assert metrics["progress_percentage"] == 100.0
    assert metrics["status"] == "Completed"

def test_overdue_goal():
    """
    Overdue goal: Target date < today AND goal incomplete.
    """
    current_date = datetime(2026, 2, 1, tzinfo=timezone.utc)
    target_date = datetime(2026, 1, 1, tzinfo=timezone.utc) # 1 month ago
    
    metrics = calculate_goal_metrics(
        target_amount=10000,
        current_amount=5000,
        target_date=target_date,
        planned_monthly_contribution=1000,
        current_date=current_date
    )
    
    assert metrics["status"] == "Overdue"
    assert metrics["months_remaining"] == 0
    assert metrics["days_remaining"] == 0
    # Overdue means the full remaining amount is required immediately
    assert metrics["required_monthly_contribution"] == 5000.0

def test_at_risk_goal():
    """
    At Risk: planned_monthly_contribution < required_monthly_contribution
    """
    current_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
    target_date = datetime(2026, 6, 1, tzinfo=timezone.utc) # 5 months left
    
    # 5 months left, 50,000 remaining -> required = 10,000/month
    # Planned is only 5,000/month -> At Risk
    metrics = calculate_goal_metrics(
        target_amount=100000,
        current_amount=50000,
        target_date=target_date,
        planned_monthly_contribution=5000,
        current_date=current_date
    )
    
    assert metrics["remaining_amount"] == 50000
    assert metrics["months_remaining"] == 5
    assert metrics["required_monthly_contribution"] == 10000
    assert metrics["status"] == "At Risk"

def test_zero_remaining_months():
    """
    Zero remaining months: when months_remaining is 0 but days_remaining > 0
    """
    current_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
    target_date = datetime(2026, 1, 15, tzinfo=timezone.utc) # 14 days left
    
    metrics = calculate_goal_metrics(
        target_amount=10000,
        current_amount=8000,
        target_date=target_date,
        planned_monthly_contribution=1000,
        current_date=current_date
    )
    
    assert metrics["remaining_amount"] == 2000
    assert metrics["months_remaining"] == 0
    assert metrics["days_remaining"] == 14
    # Full remaining amount is required since there isn't a full month left
    assert metrics["required_monthly_contribution"] == 2000
    assert metrics["status"] == "At Risk" # planned (1000) < required (2000)
