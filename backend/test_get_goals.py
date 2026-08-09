import sys
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import schemas

db = SessionLocal()
goals = db.query(models.Goal).filter(models.Goal.user_id == 1).all()

for g in goals:
    try:
        out = schemas.GoalOut.model_validate(g)
        print("Success for goal", g.id)
    except Exception as e:
        print("Error validating goal", g.id)
        import traceback
        traceback.print_exc()
