from datetime import datetime, timezone
from typing import List, Dict, Any
from models import Goal, GoalContribution
from schemas import GoalSimulationScenario
from services.projection_engine import generate_projection, add_months

def generate_simulation(goal: Goal, contributions: List[GoalContribution], average_cashflow: float, scenario: GoalSimulationScenario, current_date: datetime = None) -> dict:
    if current_date is None:
        current_date = datetime.now(timezone.utc)
    if current_date.tzinfo is None:
        current_date = current_date.replace(tzinfo=timezone.utc)
        
    # Step 1: Baseline
    baseline = generate_projection(goal, contributions, average_cashflow, current_date)
    
    baseline_months = baseline.get("months_required", 0) if baseline.get("projection_available") else 120
    baseline_completion_date = baseline.get("projected_completion_date", "")
    baseline_target_status = baseline.get("schedule_status", "unreachable")
    
    # Base Capacity
    base_capacity = baseline.get("monthly_projection", 0.0) if baseline.get("projection_available") else 0.0
    
    # Step 2: Simulation Variables
    simulated_current_amount = goal.current_amount + scenario.one_time_contribution
    
    # Baseline financial capacity + Income adjustment - Expense adjustment + Explicit savings adjustment = Simulated monthly contribution/capacity
    simulated_monthly_projection = base_capacity + scenario.monthly_income_change - scenario.monthly_expense_change + scenario.additional_monthly_savings
    
    # Step 3: Simulation Loop
    monthly_data = []
    projected_amount = simulated_current_amount
    months_required = 0
    max_months = 120 # 10 years for simulation limit
    
    monthly_data.append({
        "month_index": 0,
        "projected_date": current_date.isoformat(),
        "projected_amount": round(projected_amount, 2)
    })
    
    simulated_date = current_date
    goal_unreachable = False
    
    # Edge case: One time contribution completes it instantly
    if projected_amount >= goal.target_amount:
        # Completed
        pass
    elif simulated_monthly_projection <= 0:
        goal_unreachable = True
    else:
        while projected_amount < goal.target_amount and months_required < max_months:
            months_required += 1
            projected_amount += simulated_monthly_projection
            simulated_date = add_months(current_date, months_required)
            
            monthly_data.append({
                "month_index": months_required,
                "projected_date": simulated_date.isoformat(),
                "projected_amount": round(min(projected_amount, goal.target_amount), 2)
            })
            
        if projected_amount < goal.target_amount:
            goal_unreachable = True
            
    projected_completion_date = simulated_date
    
    target_dt = goal.target_date
    if target_dt.tzinfo is None:
        target_dt = target_dt.replace(tzinfo=timezone.utc)
        
    projected_ym = projected_completion_date.year * 12 + projected_completion_date.month
    target_ym = target_dt.year * 12 + target_dt.month
    current_ym = current_date.year * 12 + current_date.month
    
    if goal_unreachable:
        simulated_target_status = "unreachable"
        # Force a generic date so it's not broken
        simulated_completion_date_str = ""
    else:
        if projected_ym < target_ym:
            simulated_target_status = "ahead"
        elif projected_ym == target_ym:
            simulated_target_status = "on_track"
        else:
            if current_ym > target_ym:
                simulated_target_status = "overdue"
            else:
                simulated_target_status = "behind"
        simulated_completion_date_str = projected_completion_date.isoformat()
        
    # Step 4: Comparison
    if goal_unreachable:
        status = "GOAL_UNREACHABLE"
        months_saved = 0
        months_lost = 0
    else:
        months_saved = max(0, baseline_months - months_required)
        months_lost = max(0, months_required - baseline_months)
        
        if months_saved > 0:
            # Check for significantly better
            if months_required <= baseline_months * 0.8:
                status = "SIGNIFICANTLY_BETTER"
            else:
                status = "BETTER"
        elif months_lost > 0:
            status = "WORSE"
        else:
            status = "UNCHANGED"
            
    return {
        "goal_id": goal.id,
        "scenario": scenario.model_dump(),
        "baseline": {
            "months": baseline_months,
            "completion_date": baseline_completion_date,
            "target_status": baseline_target_status
        },
        "simulation": {
            "months": months_required,
            "completion_date": simulated_completion_date_str,
            "target_status": simulated_target_status
        },
        "comparison": {
            "months_saved": months_saved,
            "months_lost": months_lost,
            "status": status.lower()
        },
        "monthly_projection": monthly_data
    }
