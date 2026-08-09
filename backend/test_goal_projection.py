import pytest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

from conftest import client
from models import Goal, GoalContribution
from services.projection_engine import generate_projection

def test_projection_completed_goal():
    now = datetime.now(timezone.utc)
    goal = Goal(id=1, target_amount=1000, current_amount=1000, target_date=now + timedelta(days=30), status="Active", monthly_contribution=100)
    res = generate_projection(goal, [], 500, current_date=now)
    assert res["projection_available"] is True
    assert res["projection_basis"] == "completed"
    assert res["months_required"] == 0

def test_projection_insufficient_data():
    now = datetime.now(timezone.utc)
    goal = Goal(id=1, target_amount=1000, current_amount=0, target_date=now + timedelta(days=30), status="Active", monthly_contribution=0.0)
    res = generate_projection(goal, [], 0.0, current_date=now)
    assert res["projection_available"] is False
    assert "Insufficient contribution data" in res["reason"]

def test_projection_planned_contribution():
    now = datetime.now(timezone.utc)
    target_dt = now + timedelta(days=30*8)
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=15000)
    res = generate_projection(goal, [], 500, current_date=now)
    
    assert res["projection_available"] is True
    assert res["projection_basis"] == "planned_contribution"
    assert res["monthly_projection"] == 15000
    assert res["months_required"] == 6 # 80000 / 15000 = 5.33 -> 6 months
    # Schedule status could be ahead since target is 8 months out
    assert res["schedule_status"] == "ahead"
    assert res["confidence"] == "medium"

def test_projection_historical_contributions():
    now = datetime.now(timezone.utc)
    target_dt = now + timedelta(days=30*8)
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=1000)
    
    # 2 distinct months of contributions averaging 15k
    c1 = GoalContribution(amount=15000, contribution_date=now - timedelta(days=60))
    c2 = GoalContribution(amount=15000, contribution_date=now - timedelta(days=30))
    
    res = generate_projection(goal, [c1, c2], 500, current_date=now)
    assert res["projection_basis"] == "historical_contributions"
    assert res["monthly_projection"] == 15000.0
    assert res["confidence"] == "high"

def test_projection_cashflow_fallback():
    now = datetime.now(timezone.utc)
    # Ensure current is far enough back to exactly match 8 months
    # We will use exactly year/month logic to avoid day rounding issues
    target_dt = now.replace(month=(now.month + 8 - 1) % 12 + 1, year=now.year + (now.month + 8 - 1) // 12)
    
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=0)
    res = generate_projection(goal, [], 10000, current_date=now)
    
    assert res["projection_basis"] == "cash_flow_capacity"
    assert res["monthly_projection"] == 10000
    assert res["months_required"] == 8
    assert res["confidence"] == "low"
    assert res["schedule_status"] == "on_track"

def test_projection_behind_schedule():
    now = datetime.now(timezone.utc)
    target_dt = now.replace(month=(now.month + 2 - 1) % 12 + 1, year=now.year + (now.month + 2 - 1) // 12)
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=10000)
    res = generate_projection(goal, [], 10000, current_date=now)
    assert res["schedule_status"] == "behind"

def test_projection_overdue():
    now = datetime.now(timezone.utc)
    target_dt = now - timedelta(days=60)
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=10000)
    res = generate_projection(goal, [], 10000, current_date=now)
    assert res["schedule_status"] == "overdue"

def test_projection_negative_cashflow():
    now = datetime.now(timezone.utc)
    goal = Goal(id=1, target_amount=120000, current_amount=40000, target_date=now + timedelta(days=30*8), status="Active", monthly_contribution=0)
    res = generate_projection(goal, [], -5000, current_date=now)
    assert res["projection_available"] is False

@patch('routers.goals.get_average_monthly_cashflow')
def test_projection_endpoint(mock_cashflow):
    mock_cashflow.return_value = 18000.0
    now = datetime.now(timezone.utc)
    target = (now + timedelta(days=180)).isoformat()
    
    # Create goal
    res = client.post("/api/goals/", json={
        "name": "Endpoint Test",
        "category": "Other",
        "target_amount": 100000.0,
        "current_amount": 0.0,
        "target_date": target,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 10000.0
    })
    goal_id = res.json()["id"]
    
    res = client.get(f"/api/goals/{goal_id}/projection?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert data["projection_available"] is True
    assert data["monthly_projection"] == 10000.0
    assert data["months_required"] == 10
    assert len(data["monthly_projection_data"]) == 11 # Month 0 to 10
