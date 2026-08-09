import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta, timezone

from main import app
from database import get_db, Base
from models import User, Goal

from conftest import client
def test_create_goal():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    response = client.post("/api/goals/", json={
        "name": "New Car",
        "description": "Save for a down payment",
        "category": "Vehicle",
        "target_amount": 5000.0,
        "current_amount": 500.0,
        "target_date": future_date,
        "priority": "High",
        "monthly_contribution": 200.0,
        "user_id": 1
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Car"
    assert data["category"] == "Vehicle"
    assert data["target_amount"] == 5000.0

def test_create_goal_invalid_amount():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    response = client.post("/api/goals/", json={
        "name": "Invalid Goal",
        "category": "Other",
        "target_amount": -100.0, # Invalid
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1
    })
    assert response.status_code == 422 # Unprocessable Entity

def test_get_goals():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    # Create goal for user 1
    client.post("/api/goals/", json={
        "name": "User 1 Goal",
        "category": "Other",
        "target_amount": 1000.0,
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1
    })
    
    # Get goals for user 1
    response = client.get("/api/goals/?user_id=1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Get goals for user 2
    response = client.get("/api/goals/?user_id=2")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_get_goal_ownership():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    # Create goal for user 1
    res = client.post("/api/goals/", json={
        "name": "User 1 Goal",
        "category": "Other",
        "target_amount": 1000.0,
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1
    })
    goal_id = res.json()["id"]

    # User 1 can access
    response = client.get(f"/api/goals/{goal_id}?user_id=1")
    assert response.status_code == 200

    # User 2 cannot access
    response = client.get(f"/api/goals/{goal_id}?user_id=2")
    assert response.status_code == 403

def test_update_goal():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    res = client.post("/api/goals/", json={
        "name": "Old Name",
        "category": "Other",
        "target_amount": 1000.0,
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1
    })
    goal_id = res.json()["id"]

    response = client.patch(f"/api/goals/{goal_id}?user_id=1", json={
        "name": "New Name",
        "target_amount": 2000.0
    })
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    assert response.json()["target_amount"] == 2000.0

def test_delete_goal():
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    res = client.post("/api/goals/", json={
        "name": "To be deleted",
        "category": "Other",
        "target_amount": 1000.0,
        "target_date": future_date,
        "priority": "Low",
        "user_id": 1
    })
    goal_id = res.json()["id"]

    # Delete goal
    response = client.delete(f"/api/goals/{goal_id}?user_id=1")
    assert response.status_code == 204

    # Verify deleted
    response = client.get(f"/api/goals/{goal_id}?user_id=1")
    assert response.status_code == 404
