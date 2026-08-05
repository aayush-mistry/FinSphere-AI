from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import json

from database import get_db, init_db
from models import User, Account, Transaction, AccountType, AIConversation
from agent import app_graph
from langchain_core.messages import HumanMessage, AIMessage
from health_engine import FinancialProfile, FinancialHealthEngine, HealthEngineResponse

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
    conversation_id: Optional[int] = None

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

@app.post("/api/financial-health/calculate", response_model=HealthEngineResponse)
async def calculate_financial_health(profile: FinancialProfile):
    engine = FinancialHealthEngine(profile)
    return await engine.generate_health_report()

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

class SimulationRequest(BaseModel):
    net_worth: float
    house_cost: float
    downpayment: float
    loan_rate: float
    job_loss_months: int

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    months = 120
    baseline = []
    simulated = []
    
    current_baseline = req.net_worth
    current_simulated = req.net_worth - req.downpayment
    
    loan_amount = req.house_cost - req.downpayment
    monthly_rate = req.loan_rate / 100 / 12
    # Simple mortgage formula (assuming 30 year fixed for realism)
    if monthly_rate > 0 and loan_amount > 0:
        mortgage_payment = loan_amount * (monthly_rate * (1 + monthly_rate)**360) / ((1 + monthly_rate)**360 - 1)
    else:
        mortgage_payment = 0
        
    base_savings = 2000  # Mock base monthly savings
    living_expenses = 3000  # Mock living expenses without mortgage
    
    for i in range(1, months + 1):
        # Baseline: normal savings + 5% APY
        current_baseline += base_savings
        current_baseline *= (1 + 0.05/12)
        baseline.append(round(current_baseline, 2))
        
        # Simulated:
        if i <= req.job_loss_months:
            # Job loss: no savings, paying expenses + mortgage out of pocket
            current_simulated -= (living_expenses + mortgage_payment)
        else:
            # Normal job: savings minus the mortgage
            current_simulated += (base_savings - mortgage_payment)
            
        current_simulated *= (1 + 0.05/12)
        simulated.append(round(current_simulated, 2))
        
    result = []
    for i in range(months):
        result.append({
            "month": i + 1,
            "baseline": baseline[i],
            "simulated": simulated[i]
        })
        
    return result

@app.post("/api/fraud/scan")
async def fraud_scan(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()
    
    # Mock OCR based on filename
    if "urgent" in filename or "rahul" in filename:
        return {
            "risk_score": 95,
            "reason": "Suspicious keywords/UPI ID detected (Mocked Alert)"
        }
    
    return {
        "risk_score": 10,
        "reason": "Document looks clean."
    }

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    
    # 1. Fetch or Create Conversation History
    conversation = None
    history = []
    
    if request.conversation_id:
        conversation = db.query(AIConversation).filter(AIConversation.id == request.conversation_id).first()
        if conversation and conversation.message_history:
            # Reconstruct langchain messages
            for msg in conversation.message_history:
                if msg["role"] == "user":
                    history.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "ai":
                    history.append(AIMessage(content=msg["content"]))
    
    if not conversation:
        conversation = AIConversation(user_id=request.user_id, message_history=[])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Append new user message
    history.append(HumanMessage(content=request.message))
    
    # Save the user message to DB immediately
    db_history = conversation.message_history or []
    db_history.append({"role": "user", "content": request.message})
    conversation.message_history = db_history
    # SQLAlchemy JSON mutation detection workaround
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(conversation, "message_history")
    db.commit()

    async def generate_chat_events():
        inputs = {
            "messages": history,
            "user_id": request.user_id
        }
        
        # Send initial metadata (conversation_id)
        yield f"data: {json.dumps({'conversation_id': conversation.id})}\n\n"
        
        full_ai_response = ""
        active_agent_sent = False
        
        try:
            async for event in app_graph.astream_events(inputs, version="v2"):
                kind = event["event"]
                
                # Check for the router's decision to send the active_agent tracker event
                if not active_agent_sent and kind == "on_chain_end" and event["name"] == "supervisor":
                    output = event["data"].get("output", {})
                    if "next_agent" in output:
                        yield f"data: {json.dumps({'active_agent': output['next_agent']})}\n\n"
                        active_agent_sent = True

                # Stream the content from the LLM directly
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        full_ai_response += content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                        
            # Save AI response to DB
            db_session = next(get_db())
            conv = db_session.query(AIConversation).filter(AIConversation.id == conversation.id).first()
            if conv:
                updated_history = conv.message_history or []
                updated_history.append({"role": "ai", "content": full_ai_response})
                conv.message_history = updated_history
                flag_modified(conv, "message_history")
                db_session.commit()
                db_session.close()
                
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate_chat_events(), media_type="text/event-stream")
