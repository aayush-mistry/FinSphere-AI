import pytest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

from conftest import client

def create_goal_for_tests():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    res = client.post("/api/goals/", json={
        "name": "Contribution Test Goal",
        "category": "Other",
        "target_amount": 10000.0,
        "current_amount": 0.0,
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 1000.0
    })
    return res.json()["id"]

@patch('routers.goals.verify_transaction')
def test_create_and_get_contributions(mock_verify):
    mock_verify.return_value = True
    
    goal_id = create_goal_for_tests()
    
    # Create contribution
    res = client.post(f"/api/goals/{goal_id}/contributions?user_id=1", json={
        "transaction_id": "tx-123",
        "amount": 500.0
    })
    
    assert res.status_code == 201
    assert res.json()["amount"] == 500.0
    assert res.json()["transaction_id"] == "tx-123"
    
    # Get contributions
    res = client.get(f"/api/goals/{goal_id}/contributions?user_id=1")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["amount"] == 500.0
    
    # Check if goal current amount was incremented
    res = client.get(f"/api/goals/{goal_id}?user_id=1")
    assert res.json()["current_amount"] == 500.0

@patch('routers.goals.verify_transaction')
def test_duplicate_transaction_prevented(mock_verify):
    mock_verify.return_value = True
    goal_id = create_goal_for_tests()
    
    client.post(f"/api/goals/{goal_id}/contributions?user_id=1", json={
        "transaction_id": "tx-duplicate",
        "amount": 200.0
    })
    
    # Try again with same transaction
    res = client.post(f"/api/goals/{goal_id}/contributions?user_id=1", json={
        "transaction_id": "tx-duplicate",
        "amount": 100.0
    })
    
    assert res.status_code == 400
    assert "already assigned" in res.json()["detail"]
    
@patch('routers.goals.verify_transaction')
def test_invalid_transaction(mock_verify):
    mock_verify.return_value = False # Invalid!
    goal_id = create_goal_for_tests()
    
    res = client.post(f"/api/goals/{goal_id}/contributions?user_id=1", json={
        "transaction_id": "tx-invalid",
        "amount": 200.0
    })
    assert res.status_code == 400
    assert "Invalid transaction" in res.json()["detail"]
