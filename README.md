# FinSphere AI

FinSphere AI is an Autonomous Financial OS built as a hackathon MVP. It features a modern, clean UI, AI Copilot, Digital Twin, and a comprehensive Business CFO dashboard.

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (v4) with shadcn/ui
- **Icons:** Lucide React
- **Authentication:** Clerk / Auth0
- **Aesthetic:** Clean, modern "Light Mode" (white background, very subtle gray drop shadows, deep emerald/navy accents).

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy / Prisma
- **Core Models:** Users, Accounts, Transactions, Insurance Policies, Tax Records, AI Conversations.

## Getting Started

### 1. Frontend Setup
Navigate to the frontend directory and start the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 2. Backend Setup
Navigate to the backend directory, activate the virtual environment, and start the FastAPI server:

```bash
cd backend
# Create virtual environment if you haven't already
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic psycopg2-binary

# Run the server
uvicorn main:app --reload
```

## Features (Phase 1)
- **Global App Shell:** Fully responsive Sidebar and Top Header navigation.
- **Privacy Mode:** Toggle to blur all sensitive financial numbers globally.
- **Dynamic Routing:** Seamless navigation between Dashboard, AI Copilot, Digital Twin, Business CFO, and Settings.

## Features (Phase 2 - Completed)
- **Main Dashboard:** Comprehensive overview with Net Worth, Monthly Cash Flow, and Portfolio Allocation charts.
- **Fraud Intelligence Center:** Real-time monitoring and alert system for flagged transactions directly integrated into the Dashboard.
- **Digital Twin Simulation:** Interactive modeling tool for major life events (e.g., buying a house, evaluating emergency funds in case of job loss).
- **Backend API:** FastAPI backend powering endpoints for transactions, portfolio statistics, and dashboard summaries.
- **AI Agent Foundation:** LangGraph-powered AI backend endpoints integrated to provide conversational financial advice.

## Project Structure
- `/frontend`: Next.js application containing the UI, components, and client-side logic.
- `/backend`: FastAPI backend containing the SQLAlchemy schema (`models.py`), endpoints, and database connection logic.

## Backend Schema

The comprehensive Database schema in `backend/models.py`:

```python
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, Date, Enum
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

class UserType(str, enum.Enum):
    PERSONAL = "Personal"
    BUSINESS = "Business"

class AccountType(str, enum.Enum):
    CHECKING = "Checking"
    SAVINGS = "Savings"
    LOAN = "Loan"
    INVESTMENT = "Investment"

class InsuranceType(str, enum.Enum):
    LIFE = "Life"
    HEALTH = "Health"
    AUTO = "Auto"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(UserType))
    risk_profile = Column(String)
    
    accounts = relationship("Account", back_populates="user")
    policies = relationship("InsurancePolicy", back_populates="user")
    tax_records = relationship("TaxRecord", back_populates="user")
    conversations = relationship("AIConversation", back_populates="user")

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(AccountType))
    balance = Column(Float, default=0.0)
    institution = Column(String)
    
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Float)
    date = Column(Date)
    category = Column(String)
    status = Column(String)
    is_flagged_fraud = Column(Boolean, default=False)
    
    account = relationship("Account", back_populates="transactions")

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(InsuranceType))
    coverage_amount = Column(Float)
    premium = Column(Float)
    
    user = relationship("User", back_populates="policies")

class TaxRecord(Base):
    __tablename__ = "tax_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    fiscal_year = Column(Integer)
    estimated_tax = Column(Float)
    deductions_found = Column(Float)
    
    user = relationship("User", back_populates="tax_records")

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message_history = Column(JSON)
    
    user = relationship("User", back_populates="conversations")
```
