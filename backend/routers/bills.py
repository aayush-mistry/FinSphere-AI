from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/bills",
    tags=["Bills"]
)

@router.post("/", response_model=schemas.BillOut, status_code=status.HTTP_201_CREATED)
def create_bill(bill: schemas.BillCreate, db: Session = Depends(get_db)):
    # Verify user exists (if users exist in the system, we can verify, here we assume user_id is trusted via auth layer, but we can verify against DB if needed)
    user = db.query(models.User).filter(models.User.id == bill.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_bill = models.Bill(**bill.model_dump())
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.get("/", response_model=List[schemas.BillOut])
def get_bills(
    user_id: int, 
    status: Optional[schemas.BillStatus] = None,
    category: Optional[schemas.BillCategory] = None,
    frequency: Optional[schemas.BillFrequency] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Bill).filter(models.Bill.user_id == user_id)
    if status:
        query = query.filter(models.Bill.status == status)
    if category:
        query = query.filter(models.Bill.category == category)
    if frequency:
        query = query.filter(models.Bill.frequency == frequency)
        
    return query.all()

@router.get("/{bill_id}", response_model=schemas.BillOut)
def get_bill(bill_id: int, user_id: int, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if db_bill.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this bill")
        
    return db_bill

@router.put("/{bill_id}", response_model=schemas.BillOut)
def update_bill(bill_id: int, user_id: int, bill_update: schemas.BillUpdate, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if db_bill.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this bill")
        
    update_data = bill_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bill, key, value)
        
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.patch("/{bill_id}/status", response_model=schemas.BillOut)
def update_bill_status(bill_id: int, user_id: int, status_update: schemas.BillStatusUpdate, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if db_bill.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this bill")
        
    db_bill.status = status_update.status
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(bill_id: int, user_id: int, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if db_bill.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this bill")
        
    db.delete(db_bill)
    db.commit()
    return None
