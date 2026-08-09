import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

from main import app
from database import get_db, Base
from models import User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.goal_calculator import assess_goal_feasibility

from conftest import client
def test_assess_goal_feasibility():
    """
    Test Feasibility logic.
    Required = 10,000, Average Cash Flow = 18,000 -> Potentially Achievable
    Required = 25,000, Average Cash Flow = 18,000 -> Currently Not Supported
    """
    assert assess_goal_feasibility(10000, 18000) == "Potentially Achievable"
    assert assess_goal_feasibility(25000, 18000) == "Currently Not Supported"

@patch('routers.goals.get_average_monthly_cashflow')
def test_goal_summary_and_detail(mock_cashflow):
    mock_cashflow.return_value = 18000.0
    
    # Let's set a target date exactly 8 months in the future, carefully adjusting month/year
    now = datetime.now(timezone.utc)
    target_month = now.month + 8
    target_year = now.year
    if target_month > 12:
        target_month -= 12
        target_year += 1
    # Avoid month end boundary issues by forcing day=1
    # Using replace on naive and tz-aware
    target_date = datetime(target_year, target_month, 1, tzinfo=timezone.utc).isoformat()
    
    res = client.post("/api/goals/", json={
        "name": "Integration Goal",
        "category": "Other",
        "target_amount": 120000.0,
        "current_amount": 40000.0,
        "target_date": target_date,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 10000.0
    })
    assert res.status_code == 201
    goal_id = res.json()["id"]

    res_detail = client.get(f"/api/goals/{goal_id}?user_id=1")
    assert res_detail.status_code == 200
    data = res_detail.json()
    assert data["progress"] == 33.33
    assert data["remaining_amount"] == 80000.0
    assert data["average_monthly_cashflow"] == 18000.0
    assert data["feasibility"] == "Potentially Achievable"

    res_summary = client.get("/api/goals/summary?user_id=1")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert summary["total_active_goals"] == 1
    assert summary["total_target_amount"] == 120000.0
    assert summary["total_current_amount"] == 40000.0
    assert summary["overall_progress"] == 33.33
    assert summary["average_monthly_cashflow"] == 18000.0
