from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db, init_db
from models import User, Account, Transaction, AccountType

# Initialize db schemas on startup
init_db()

app = FastAPI(
    title="FinSphere AI",
    description="Backend API for FinSphere AI application",
    version="0.1.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to FinSphere AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate Total Net Worth (sum of all balances)
    total_net_worth = db.query(func.sum(Account.balance)).scalar() or 0.0
    
    # Calculate Monthly Cash Flow (sum of transactions in last 30 days)
    # Using a simple income vs expenses mock logic for MVP
    income = db.query(func.sum(Transaction.amount)).filter(Transaction.amount > 0).scalar() or 0.0
    expenses = db.query(func.sum(Transaction.amount)).filter(Transaction.amount < 0).scalar() or 0.0
    monthly_cash_flow = income + expenses  # Expenses are negative
    
    # Financial Health Score (mock out of 100)
    health_score = 84
    
    return {
        "totalNetWorth": round(total_net_worth, 2),
        "monthlyCashFlow": round(monthly_cash_flow, 2),
        "financialHealthScore": health_score
    }

@app.get("/api/transactions")
def get_recent_transactions(limit: int = 10, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.date.desc()).limit(limit).all()
    return transactions

@app.get("/api/portfolio/allocation")
def get_portfolio_allocation():
    # Mock data for investment portfolio
    return [
        {"name": "Stocks", "value": 65},
        {"name": "Bonds", "value": 20},
        {"name": "Crypto", "value": 10},
        {"name": "Cash", "value": 5}
    ]

@app.get("/api/loans/summary")
def get_loans_summary(db: Session = Depends(get_db)):
    loans = db.query(Account).filter(Account.type == AccountType.LOAN).all()
    return loans
