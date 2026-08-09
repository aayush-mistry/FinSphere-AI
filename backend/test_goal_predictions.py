import pytest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

from conftest import client

@patch('routers.goals.get_average_monthly_cashflow')
def test_goal_predictions_summary(mock_cashflow):
    mock_cashflow.return_value = 15000.0
    now = datetime.now(timezone.utc)
    target1 = (now + timedelta(days=30*5)).isoformat()
    target2 = (now + timedelta(days=1)).isoformat()
    
    res1 = client.post("/api/goals/", json={
        "name": "Summary Goal 1",
        "category": "Other",
        "target_amount": 50000.0,
        "current_amount": 0.0,
        "target_date": target1,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 10000.0
    })
    assert res1.status_code == 201
    
    res2 = client.post("/api/goals/", json={
        "name": "Summary Goal 2",
        "category": "Other",
        "target_amount": 10000.0,
        "current_amount": 0.0,
        "target_date": target2,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 1000.0
    })
    assert res2.status_code == 201
    
    res = client.get("/api/goals/predictions/summary?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert data["total_goals_analyzed"] >= 2
    assert data["goals_on_track"] >= 1
    assert data["goals_at_risk"] >= 1
    assert data["overall_confidence"] in ["low", "medium", "high"]
    assert "earliest_completion_date" in data
    assert "latest_completion_date" in data

@patch('routers.goals.get_average_monthly_cashflow')
def test_goal_predictions_compare(mock_cashflow):
    mock_cashflow.return_value = 15000.0
    
    now = datetime.now(timezone.utc)
    client.post("/api/goals/", json={
        "name": "Compare Goal 1",
        "category": "Other",
        "target_amount": 50000.0,
        "current_amount": 0.0,
        "target_date": (now + timedelta(days=90)).isoformat(),
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 10000.0
    })
    
    client.post("/api/goals/", json={
        "name": "Compare Goal 2",
        "category": "Other",
        "target_amount": 20000.0,
        "current_amount": 0.0,
        "target_date": (now + timedelta(days=60)).isoformat(),
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 5000.0
    })
    
    res = client.get("/api/goals/predictions/compare?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    
    # Ensure sorted by projected_months (ascending)
    for i in range(len(data) - 1):
        assert data[i]["projected_months"] <= data[i+1]["projected_months"]
