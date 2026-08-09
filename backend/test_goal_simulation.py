import pytest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone

from conftest import client
from models import Goal
from schemas import GoalSimulationScenario
from services.simulation_engine import generate_simulation

def get_base_goal():
    now = datetime.now(timezone.utc)
    # Goal: Target 120,000, Current 40,000, monthly 15,000
    target_dt = now + timedelta(days=30*8)
    return Goal(id=1, target_amount=120000, current_amount=40000, target_date=target_dt, status="Active", monthly_contribution=15000), now

def test_simulation_additional_savings():
    goal, now = get_base_goal()
    scenario = GoalSimulationScenario(additional_monthly_savings=5000) # Total 20k/mo
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6 # 80k / 15k
    assert res["simulation"]["months"] == 4 # 80k / 20k
    assert res["comparison"]["months_saved"] == 2

def test_simulation_reduced_savings():
    goal, now = get_base_goal()
    scenario = GoalSimulationScenario(additional_monthly_savings=-5000) # Total 10k/mo
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6 # 80k / 15k
    assert res["simulation"]["months"] == 8 # 80k / 10k
    assert res["comparison"]["status"] == "worse"
    assert res["comparison"]["months_lost"] == 2

def test_simulation_one_time_contribution():
    goal, now = get_base_goal()
    scenario = GoalSimulationScenario(one_time_contribution=25000)
    # Remaining: 80k - 25k = 55k. 55k / 15k = 3.66 -> 4 months
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6
    assert res["simulation"]["months"] == 4

def test_simulation_expense_increase():
    goal, now = get_base_goal()
    scenario = GoalSimulationScenario(monthly_expense_change=10000) # capacity reduces to 5000
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6
    assert res["simulation"]["months"] == 16 # 80k / 5k
    assert res["comparison"]["status"] == "worse"

def test_simulation_income_increase():
    goal, now = get_base_goal()
    scenario = GoalSimulationScenario(monthly_income_change=10000) # capacity increases to 25000
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6
    assert res["simulation"]["months"] == 4 # 80k / 25k = 3.2 -> 4

def test_simulation_combined_scenario():
    goal, now = get_base_goal()
    # base 15k. Income +10k. Expenses +5k. Additional +2k. Total = 15 + 10 - 5 + 2 = 22k
    scenario = GoalSimulationScenario(monthly_income_change=10000, monthly_expense_change=5000, additional_monthly_savings=2000)
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["baseline"]["months"] == 6
    assert res["simulation"]["months"] == 4 # 80k / 22k = 3.63 -> 4
    
def test_simulation_unreachable():
    goal, now = get_base_goal()
    # capacity goes negative
    scenario = GoalSimulationScenario(monthly_expense_change=20000)
    res = generate_simulation(goal, [], 0, scenario, current_date=now)
    
    assert res["comparison"]["status"] == "goal_unreachable"
    assert res["simulation"]["target_status"] == "unreachable"

@patch('routers.goals.get_average_monthly_cashflow')
def test_simulation_endpoint(mock_cashflow):
    mock_cashflow.return_value = 15000.0
    now = datetime.now(timezone.utc)
    target = (now + timedelta(days=30*8)).isoformat()
    
    # Create goal
    res = client.post("/api/goals/", json={
        "name": "Sim Test",
        "category": "Other",
        "target_amount": 120000.0,
        "current_amount": 40000.0,
        "target_date": target,
        "priority": "Low",
        "user_id": 1,
        "monthly_contribution": 15000.0
    })
    goal_id = res.json()["id"]
    
    res = client.post(f"/api/goals/{goal_id}/simulate?user_id=1", json={
        "additional_monthly_savings": 5000,
        "monthly_expense_change": 0,
        "monthly_income_change": 0,
        "one_time_contribution": 0
    })
    
    assert res.status_code == 200
    data = res.json()
    assert data["baseline"]["months"] == 6
    assert data["simulation"]["months"] == 4
    assert data["comparison"]["months_saved"] == 2
