import os
import json
from typing import TypedDict, Annotated, Sequence, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field

from database import SessionLocal
from models import User, Account, Transaction, InsurancePolicy, TaxRecord

# Initialize LLM
# Expects OPENAI_API_KEY in environment
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int
    next_agent: str

class Route(BaseModel):
    next_node: Literal["financial_advisor", "loan_intelligence", "tax_optimizer", "insurance_ai", "FINISH"] = Field(
        description="The agent to route to based on the user's request."
    )

def get_user_data_json(user_id: int) -> str:
    """Fetch user data from DB to provide context to agents."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return "{}"

        accounts = db.query(Account).filter(Account.user_id == user_id).all()
        transactions = db.query(Transaction).join(Account).filter(Account.user_id == user_id).all()
        policies = db.query(InsurancePolicy).filter(InsurancePolicy.user_id == user_id).all()
        taxes = db.query(TaxRecord).filter(TaxRecord.user_id == user_id).all()

        data = {
            "profile": {"name": user.name, "type": user.type.value if user.type else None, "risk_profile": user.risk_profile},
            "accounts": [{"type": a.type.value if a.type else None, "balance": a.balance, "institution": a.institution} for a in accounts],
            "transactions": [{"amount": t.amount, "category": t.category, "date": str(t.date), "status": t.status} for t in transactions[-50:]], # Last 50
            "insurance_policies": [{"type": p.type.value if p.type else None, "coverage_amount": p.coverage_amount, "premium": p.premium} for p in policies],
            "tax_records": [{"fiscal_year": tx.fiscal_year, "estimated_tax": tx.estimated_tax, "deductions_found": tx.deductions_found} for tx in taxes]
        }
        return json.dumps(data, indent=2)
    finally:
        db.close()

# --- SYSTEM PROMPTS ---

SUPERVISOR_PROMPT = """You are the Supervisor Router for FinSphere AI.
Analyze the user's latest request and route it to the appropriate specialized agent:
- 'financial_advisor' for questions about budgets, cash flow, spending habits, or general net worth.
- 'loan_intelligence' for questions about debt, EMI optimizations, or loan eligibility based on salary/accounts.
- 'tax_optimizer' for questions about tax planning, deductions (80C, GST), or analyzing transaction history for tax benefits.
- 'insurance_ai' for questions about insurance policies, coverage gaps, or life/health protection.

If the user's query is purely conversational or doesn't fit these, choose 'FINISH'.
"""

FINANCIAL_ADVISOR_PROMPT = """You are the Financial Advisor Node for FinSphere AI.
Your purpose is to analyze the user's budget, cash flow, and overall financial health.
Use the provided JSON data representing the user's current accounts and recent transactions.
Provide mathematically accurate, context-aware answers. Do not give generic advice if data is available.
Format output using markdown. Use tables for breakdowns or bold text for key figures.

USER DATA:
{user_data}
"""

LOAN_INTELLIGENCE_PROMPT = """You are the Loan Intelligence Node for FinSphere AI.
Your purpose is to analyze debt, suggest EMI optimizations, and calculate loan eligibility based on user balances and cash flow.
Use the provided JSON data representing the user's current accounts (especially Loans) and transactions.
Provide mathematically accurate, context-aware answers. Highlight specific numbers from their data.
Format output using markdown. Use tables for loan schedules or bold text for key figures.

USER DATA:
{user_data}
"""

TAX_OPTIMIZER_PROMPT = """You are the Tax Optimizer Node for FinSphere AI.
Your purpose is to find tax deductions (e.g., 80C, GST) based on transaction history and analyze tax records.
Use the provided JSON data representing the user's tax records and transactions.
Provide mathematically accurate, context-aware answers. Don't give generic advice.
Format output using markdown. Use tables for deductions or bold text for key figures.

USER DATA:
{user_data}
"""

INSURANCE_AI_PROMPT = """You are the Insurance AI Node for FinSphere AI.
Your purpose is to check the database for existing policies and suggest coverage gaps based on their profile.
Use the provided JSON data representing the user's insurance policies, risk profile, and financials.
Provide mathematically accurate, context-aware answers. 
Format output using markdown. Use tables for policy comparisons or bold text for key figures.

USER DATA:
{user_data}
"""

# --- NODE FUNCTIONS ---

def supervisor_node(state: AgentState):
    messages = state["messages"]
    router = llm.with_structured_output(Route)
    result = router.invoke([SystemMessage(content=SUPERVISOR_PROMPT)] + list(messages))
    return {"next_agent": result.next_node}

def agent_node_factory(agent_prompt: str):
    def node(state: AgentState):
        user_id = state.get("user_id", 1) # Default to 1 for demo
        user_data = get_user_data_json(user_id)
        system_message = SystemMessage(content=agent_prompt.format(user_data=user_data))
        
        response = llm.invoke([system_message] + list(state["messages"]))
        return {"messages": [response]}
    return node

financial_advisor_node = agent_node_factory(FINANCIAL_ADVISOR_PROMPT)
loan_intelligence_node = agent_node_factory(LOAN_INTELLIGENCE_PROMPT)
tax_optimizer_node = agent_node_factory(TAX_OPTIMIZER_PROMPT)
insurance_ai_node = agent_node_factory(INSURANCE_AI_PROMPT)

def fallback_node(state: AgentState):
    response = llm.invoke([SystemMessage(content="You are a helpful AI assistant. Please provide a general response.")] + list(state["messages"]))
    return {"messages": [response]}

# --- GRAPH DEFINITION ---

workflow = StateGraph(AgentState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("financial_advisor", financial_advisor_node)
workflow.add_node("loan_intelligence", loan_intelligence_node)
workflow.add_node("tax_optimizer", tax_optimizer_node)
workflow.add_node("insurance_ai", insurance_ai_node)
workflow.add_node("fallback", fallback_node)

workflow.add_edge(START, "supervisor")

def route_next(state: AgentState):
    next_node = state["next_agent"]
    if next_node == "FINISH":
        return "fallback"
    return next_node

workflow.add_conditional_edges(
    "supervisor",
    route_next,
    {
        "financial_advisor": "financial_advisor",
        "loan_intelligence": "loan_intelligence",
        "tax_optimizer": "tax_optimizer",
        "insurance_ai": "insurance_ai",
        "fallback": "fallback"
    }
)

workflow.add_edge("financial_advisor", END)
workflow.add_edge("loan_intelligence", END)
workflow.add_edge("tax_optimizer", END)
workflow.add_edge("insurance_ai", END)
workflow.add_edge("fallback", END)

app_graph = workflow.compile()
