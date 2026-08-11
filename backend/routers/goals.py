from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from services.cashflow_integration import get_average_monthly_cashflow
from services.goal_calculator import calculate_goal_metrics, assess_goal_feasibility
from services.transaction_integration import verify_transaction
from services.projection_engine import generate_projection
from services.simulation_engine import generate_simulation
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/goals",
    tags=["Goals"]
)

@router.post("/", response_model=schemas.GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == goal.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_goal = models.Goal(**goal.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[schemas.GoalOut])
def get_goals(user_id: int, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    return goals

@router.get("/summary", response_model=schemas.GoalSummaryOut)
def get_goal_summary(user_id: int, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    
    total_active_goals = len([g for g in goals if g.status not in ["Cancelled", "Archived"]])
    total_target_amount = sum(g.target_amount for g in goals if g.status not in ["Cancelled", "Archived"])
    total_current_amount = sum(g.current_amount for g in goals if g.status not in ["Cancelled", "Archived"])
    total_remaining = max(total_target_amount - total_current_amount, 0.0)
    
    overall_progress = 0.0
    if total_target_amount > 0:
        overall_progress = (total_current_amount / total_target_amount) * 100
        overall_progress = min(max(overall_progress, 0.0), 100.0)
        
    planned_monthly_contributions = sum(g.monthly_contribution for g in goals if g.status not in ["Cancelled", "Archived"])
    
    average_monthly_cashflow = get_average_monthly_cashflow()
    
    on_track_goals = 0
    at_risk_goals = 0
    completed_goals = 0
    overdue_goals = 0
    
    for g in goals:
        if g.status in ["Cancelled", "Archived"]:
            continue
        metrics = calculate_goal_metrics(
            target_amount=g.target_amount,
            current_amount=g.current_amount,
            target_date=g.target_date,
            planned_monthly_contribution=g.monthly_contribution
        )
        status = metrics["status"]
        if status == "On Track":
            on_track_goals += 1
        elif status == "At Risk":
            at_risk_goals += 1
        elif status == "Completed":
            completed_goals += 1
        elif status == "Overdue":
            overdue_goals += 1
            
    return {
        "total_active_goals": total_active_goals,
        "total_target_amount": total_target_amount,
        "total_current_amount": total_current_amount,
        "total_remaining": total_remaining,
        "overall_progress": round(overall_progress, 2),
        "planned_monthly_contributions": planned_monthly_contributions,
        "average_monthly_cashflow": round(average_monthly_cashflow, 2),
        "on_track_goals": on_track_goals,
        "at_risk_goals": at_risk_goals,
        "completed_goals": completed_goals,
        "overdue_goals": overdue_goals
    }

@router.get("/predictions/summary", response_model=schemas.GoalPredictionSummaryOut)
def get_goal_predictions_summary(user_id: int, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id, models.Goal.status.notin_(["Cancelled", "Archived"])).all()
    
    avg_cashflow = get_average_monthly_cashflow()
    
    on_track = 0
    at_risk = 0
    dates = []
    confidences = []
    
    for g in goals:
        proj = generate_projection(g, g.contributions, avg_cashflow)
        
        status = proj.get("schedule_status")
        if status in ["ahead", "on_track"]:
            on_track += 1
        else:
            at_risk += 1
            
        c_date = proj.get("projected_completion_date")
        if c_date:
            dates.append(datetime.fromisoformat(c_date))
            
        conf = proj.get("confidence", "low")
        confidences.append(conf)
        
    earliest = min(dates) if dates else None
    latest = max(dates) if dates else None
    
    overall_confidence = "low"
    if confidences:
        if "low" in confidences:
            overall_confidence = "low"
        elif "medium" in confidences:
            overall_confidence = "medium"
        else:
            overall_confidence = "high"
            
    return {
        "total_goals_analyzed": len(goals),
        "goals_on_track": on_track,
        "goals_at_risk": at_risk,
        "earliest_completion_date": earliest,
        "latest_completion_date": latest,
        "overall_confidence": overall_confidence
    }

@router.get("/predictions/compare", response_model=List[schemas.GoalComparisonItem])
def get_goal_predictions_compare(user_id: int, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id, models.Goal.status.notin_(["Cancelled", "Archived"])).all()
    avg_cashflow = get_average_monthly_cashflow()
    
    results = []
    for g in goals:
        proj = generate_projection(g, g.contributions, avg_cashflow)
        c_date = proj.get("projected_completion_date")
        
        results.append({
            "goal_id": g.id,
            "name": g.name,
            "target_amount": proj.get("target_amount", g.target_amount),
            "remaining_amount": proj.get("remaining_amount", 0.0),
            "projected_months": proj.get("months_required", 120),
            "schedule_status": proj.get("schedule_status", "unreachable"),
            "monthly_projection": proj.get("monthly_projection", 0.0),
            "projected_completion_date": datetime.fromisoformat(c_date) if c_date else None
        })
        
    results.sort(key=lambda x: (x["projected_months"], x["name"]))
    return results

@router.get("/{goal_id}", response_model=schemas.GoalDetailOut)
def get_goal(goal_id: int, user_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    metrics = calculate_goal_metrics(
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        planned_monthly_contribution=goal.monthly_contribution
    )
    
    avg_cashflow = get_average_monthly_cashflow()
    feasibility = assess_goal_feasibility(metrics["required_monthly_contribution"], avg_cashflow)
    
    status = metrics["status"]
    if goal.status in ["Cancelled", "Archived"]:
        status = goal.status
        
    # We dump the ORM model to a dict and then merge with our calculated fields
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
        "status": status,  # Override status with dynamic status unless archived/cancelled
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
    return goal_dict

@router.patch("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(goal_id: int, user_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if db_goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this goal")
        
    update_data = goal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
        
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.patch("/{goal_id}/archive", response_model=schemas.GoalOut)
def archive_goal(goal_id: int, user_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if db_goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    db_goal.status = "Archived"
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, user_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if db_goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this goal")
        
    db.delete(db_goal)
    db.commit()
    return None

@router.post("/{goal_id}/contributions", response_model=schemas.GoalContributionOut, status_code=status.HTTP_201_CREATED)
def create_goal_contribution(goal_id: int, user_id: int, contribution: schemas.GoalContributionCreate, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    if contribution.transaction_id:
        existing = db.query(models.GoalContribution).filter(models.GoalContribution.transaction_id == contribution.transaction_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Transaction already assigned to a contribution")
            
        is_valid = verify_transaction(contribution.transaction_id, user_id)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid transaction or transaction does not belong to user")
            
    db_contribution = models.GoalContribution(
        goal_id=goal_id,
        transaction_id=contribution.transaction_id,
        amount=contribution.amount,
        contribution_date=contribution.contribution_date or datetime.now(timezone.utc)
    )
    db.add(db_contribution)
    
    goal.current_amount += contribution.amount
    
    db.commit()
    db.refresh(db_contribution)
    return db_contribution

@router.get("/{goal_id}/contributions", response_model=List[schemas.GoalContributionOut])
def get_goal_contributions(goal_id: int, user_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    return goal.contributions

@router.get("/{goal_id}/projection", response_model=schemas.GoalProjectionOut)
def get_goal_projection(goal_id: int, user_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    avg_cashflow = get_average_monthly_cashflow()
    
    projection_data = generate_projection(
        goal=goal,
        contributions=goal.contributions,
        average_cashflow=avg_cashflow
    )
    
    return projection_data

@router.post("/{goal_id}/simulate", response_model=schemas.GoalSimulationOut)
def simulate_goal_projection(goal_id: int, user_id: int, scenario: schemas.GoalSimulationScenario, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this goal")
        
    avg_cashflow = get_average_monthly_cashflow()
    
    simulation_data = generate_simulation(
        goal=goal,
        contributions=goal.contributions,
        average_cashflow=avg_cashflow,
        scenario=scenario
    )
    
    return simulation_data
