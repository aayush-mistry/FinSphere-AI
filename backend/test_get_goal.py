import sys
import os

from sqlalchemy.orm import Session
from database import SessionLocal
import models
from services.goal_calculator import calculate_goal_metrics, assess_goal_feasibility
from services.cashflow_integration import get_average_monthly_cashflow

db = SessionLocal()
goal = db.query(models.Goal).filter(models.Goal.id == 1).first()

if goal:
    try:
        metrics = calculate_goal_metrics(
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            target_date=goal.target_date,
            planned_monthly_contribution=goal.monthly_contribution
        )
        avg_cashflow = get_average_monthly_cashflow()
        feasibility = assess_goal_feasibility(metrics["required_monthly_contribution"], avg_cashflow)
        
        goal_dict = {
            "id": goal.id,
            "user_id": goal.user_id,
            "name": goal.name,
            "description": goal.description,
            "category": goal.category,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "target_date": goal.target_date,
            "priority": goal.priority,
            "status": metrics["status"],  
            "linked_account_id": goal.linked_account_id,
            "monthly_contribution": goal.monthly_contribution,
            "created_at": goal.created_at,
            "updated_at": goal.updated_at,
            "progress": metrics["progress_percentage"],
            "remaining_amount": metrics["remaining_amount"],
            "days_remaining": metrics["days_remaining"],
            "months_remaining": metrics["months_remaining"],
            "required_monthly_contribution": metrics["required_monthly_contribution"],
            "planned_monthly_contribution": goal.monthly_contribution,
            "average_monthly_cashflow": avg_cashflow,
            "feasibility": feasibility,
        }
        
        import schemas
        out = schemas.GoalDetailOut(**goal_dict)
        print(out.model_dump())
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("Goal not found in db")
