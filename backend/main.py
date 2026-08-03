from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import asyncio
import json

from database import get_db, init_db
from models import User, Account, Transaction, AccountType
from agent import app_graph
from langchain_core.messages import HumanMessage

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

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1

@app.get("/")
def read_root():
    return {"message": "Welcome to FinSphere AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_net_worth = db.query(func.sum(Account.balance)).scalar() or 0.0
    income = db.query(func.sum(Transaction.amount)).filter(Transaction.amount > 0).scalar() or 0.0
    expenses = db.query(func.sum(Transaction.amount)).filter(Transaction.amount < 0).scalar() or 0.0
    monthly_cash_flow = income + expenses
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

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    async def generate_chat_events():
        inputs = {
            "messages": [HumanMessage(content=request.message)],
            "user_id": request.user_id
        }
        
        # We will stream the messages from LangGraph
        # We only want to stream the final agent's response, which is a message delta if using astreaming model, 
        # or we just yield the final result.
        # Given it's LangGraph, we can iterate over astreams.
        
        try:
            async for event in app_graph.astream_events(inputs, version="v2"):
                kind = event["event"]
                # Stream the content from the LLM directly
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        yield f"data: {json.dumps({'content': content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate_chat_events(), media_type="text/event-stream")
