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

# Initialize LLM safely
api_key = os.environ.get("OPENAI_API_KEY", "dummy-key-to-prevent-crash")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=api_key)

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int
    next_agent: str

class Route(BaseModel):
    next_node: Literal[
        "financial_advisor", "loan_intelligence", "tax_optimizer", "insurance_ai", 
        "investment_analyst", "retirement_planner", "budget_tracker", "crypto_expert", 
        "real_estate_advisor", "estate_planner", "debt_manager", "FINISH"
    ] = Field(
        description="The agent to route to based on the user's request."
    )

def get_user_data_json(user_id: int) -> str:
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
            "transactions": [{"amount": t.amount, "category": t.category, "date": str(t.date), "status": t.status} for t in transactions[-50:]],
            "insurance_policies": [{"type": p.type.value if p.type else None, "coverage_amount": p.coverage_amount, "premium": p.premium} for p in policies],
            "tax_records": [{"fiscal_year": tx.fiscal_year, "estimated_tax": tx.estimated_tax, "deductions_found": tx.deductions_found} for tx in taxes]
        }
        return json.dumps(data, indent=2)
    finally:
        db.close()

# --- SYSTEM PROMPTS ---

SUPERVISOR_PROMPT = """You are the Supervisor Router for FinSphere AI.
Analyze the user's latest request and route it to one of the 11 specialized agents:
- 'financial_advisor': budgets, cash flow, general net worth.
- 'loan_intelligence': debt, EMI optimizations, loan eligibility.
- 'tax_optimizer': tax planning, deductions (80C, GST).
- 'insurance_ai': insurance policies, coverage gaps.
- 'investment_analyst': stocks, bonds, portfolio allocation.
- 'retirement_planner': 401k, retirement age, pension.
- 'budget_tracker': strict daily expense tracking.
- 'crypto_expert': cryptocurrency trends, wallet balances.
- 'real_estate_advisor': mortgages, property values.
- 'estate_planner': wills, trusts, inheritance.
- 'debt_manager': debt consolidation, bankruptcy.

If the user's query doesn't fit these, choose 'FINISH'.
"""

FINANCIAL_ADVISOR_PROMPT = """You are the Financial Advisor Node for FinSphere AI.
Analyze the user's budget and overall financial health.
Format output using markdown. Use tables or bold text for key figures.
USER DATA:
{user_data}
"""

LOAN_INTELLIGENCE_PROMPT = """You are the Loan Intelligence Node for FinSphere AI.
Analyze debt, suggest EMI optimizations based on user balances.
Format output using markdown. 
USER DATA:
{user_data}
"""

TAX_OPTIMIZER_PROMPT = """You are the Tax Optimizer Node for FinSphere AI.
Find tax deductions based on transaction history and tax records.
Format output using markdown.
USER DATA:
{user_data}
"""

INSURANCE_AI_PROMPT = """You are the Insurance AI Node for FinSphere AI.
Check the database for existing policies and suggest coverage gaps.
Format output using markdown.
USER DATA:
{user_data}
"""

INVESTMENT_ANALYST_PROMPT = """You are the Investment Analyst Node for FinSphere AI.
Analyze the user's investment accounts and transaction history.
Suggest portfolio allocations based on their risk profile.
Format output using markdown. Use tables for asset classes.
USER DATA:
{user_data}
"""

# Dummy prompts for the rest of the 11 personas
STUB_PROMPT = "You are the {role} for FinSphere AI. Provide a brief answer related to {role}. USER DATA: {user_data}"

# --- NODE FUNCTIONS ---

def supervisor_node(state: AgentState):
    messages = state["messages"]
    router = llm.with_structured_output(Route)
    result = router.invoke([SystemMessage(content=SUPERVISOR_PROMPT)] + list(messages))
    return {"next_agent": result.next_node}

def agent_node_factory(agent_prompt: str, role: str = None):
    def node(state: AgentState):
        user_id = state.get("user_id", 1)
        user_data = get_user_data_json(user_id)
        
        prompt_str = agent_prompt.format(user_data=user_data, role=role)
        system_message = SystemMessage(content=prompt_str)
        
        response = llm.invoke([system_message] + list(state["messages"]))
        return {"messages": [response]}
    return node

financial_advisor_node = agent_node_factory(FINANCIAL_ADVISOR_PROMPT)
loan_intelligence_node = agent_node_factory(LOAN_INTELLIGENCE_PROMPT)
tax_optimizer_node = agent_node_factory(TAX_OPTIMIZER_PROMPT)
insurance_ai_node = agent_node_factory(INSURANCE_AI_PROMPT)
investment_analyst_node = agent_node_factory(INVESTMENT_ANALYST_PROMPT)

retirement_planner_node = agent_node_factory(STUB_PROMPT, "Retirement Planner")
budget_tracker_node = agent_node_factory(STUB_PROMPT, "Budget Tracker")
crypto_expert_node = agent_node_factory(STUB_PROMPT, "Crypto Expert")
real_estate_advisor_node = agent_node_factory(STUB_PROMPT, "Real Estate Advisor")
estate_planner_node = agent_node_factory(STUB_PROMPT, "Estate Planner")
debt_manager_node = agent_node_factory(STUB_PROMPT, "Debt Manager")

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
workflow.add_node("investment_analyst", investment_analyst_node)
workflow.add_node("retirement_planner", retirement_planner_node)
workflow.add_node("budget_tracker", budget_tracker_node)
workflow.add_node("crypto_expert", crypto_expert_node)
workflow.add_node("real_estate_advisor", real_estate_advisor_node)
workflow.add_node("estate_planner", estate_planner_node)
workflow.add_node("debt_manager", debt_manager_node)
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
        "investment_analyst": "investment_analyst",
        "retirement_planner": "retirement_planner",
        "budget_tracker": "budget_tracker",
        "crypto_expert": "crypto_expert",
        "real_estate_advisor": "real_estate_advisor",
        "estate_planner": "estate_planner",
        "debt_manager": "debt_manager",
        "fallback": "fallback"
    }
)

nodes = ["financial_advisor", "loan_intelligence", "tax_optimizer", "insurance_ai", 
         "investment_analyst", "retirement_planner", "budget_tracker", "crypto_expert", 
         "real_estate_advisor", "estate_planner", "debt_manager", "fallback"]

for n in nodes:
    workflow.add_edge(n, END)

app_graph = workflow.compile()
