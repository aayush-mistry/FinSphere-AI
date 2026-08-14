# 💰 FinSphere AI

> **A Balance-First Financial Operating System**

FinSphere AI is an intelligent financial operating system designed to help users understand, manage, and plan their finances from a single source of truth — their **Balance**.

Unlike traditional finance applications that treat expenses, bills, goals, cash flow, and financial planning as isolated features, FinSphere AI connects them through a unified financial core.

The goal is simple:

> **Know where your money is, where it's going, and where it will be.**

---

# 🚀 Vision

FinSphere AI is not intended to be another basic expense tracker.

The long-term vision is to build a **Balance-First Financial Operating System** capable of understanding a user's complete financial state and reasoning about its future.

Instead of simply showing:

> "You spent ₹45,000 this month."

FinSphere should eventually be able to answer:

> "If your current spending continues, your liquid cash will fall below your safe threshold in 47 days."

And eventually:

> "If you invest ₹25,000 instead of ₹15,000 this month, your goal probability changes from 71% to 78%, but your short-term liquidity risk increases."

The current version establishes the financial foundation required to reach that level of intelligence.

---

# 🧠 Core Philosophy

Everything begins with the **Balance Engine**.

```text
                         Transactions
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
          Income           Expenses         Transfers
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                       Balance Engine
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        Accounts          Cash Flow          Net Worth
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    Financial State
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
        Bills               Goals             Forecasting
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    Financial Intelligence
```

---

# ✨ Core Features & Engines

FinSphere AI's architecture is composed of interconnected "Engines," each responsible for a specific aspect of your financial life.

## 💰 1. Balance Engine (The Core)
The Balance Engine is the heart of FinSphere AI. It aggregates data from all connected accounts (checking, savings, credit) to calculate your **True Net Available Cash**. 
- Adjusts instantly based on pending transactions to provide total visibility into liquidity.
- Acts as the central hub from which all other engines derive their calculations.

## 📈 2. Income Engine
The Income Engine is responsible for tracking and predicting cash inflows.
- **Smart Categorization:** Automatically differentiates between stable, recurring salaries and one-off freelance or gig income.
- **Baseline Prediction:** Enables accurate baseline income predictions for future months, ensuring you know exactly what cash you can rely on.

## 📉 3. Expense Engine
The Expense Engine provides deep categorization and intelligent analysis of your daily outflows.
- **Deep Categorization:** Organizes spending into granular categories.
- **Anomaly Detection:** Actively flags unexpected spending spikes or lifestyle inflation before they become a problem.
- **Actionable Advice:** Identifies exactly where to cut back to maximize savings without sacrificing your lifestyle.

## 📅 4. Bills Engine
The Bills Engine is your ultimate defense against late fees and "zombie" subscriptions.
- **Automated Tracking:** Detects recurring subscriptions and utility bills from your transaction history.
- **Chronological Timeline:** Visualizes exactly when money will leave your account.
- **Smart Matching:** Automatically reconciles bank transactions against expected bills to ensure nothing is missed.

## 🌊 5. Cashflow Engine
The Cashflow Engine maps the flow of money in and out over time.
- **Burn Rate Calculation:** Calculates your current "burn rate" based on recent spending.
- **Liquidity Foresight:** Visually displays your liquidity trends, ensuring you are never caught cash-poor before payday.

## 🎯 6. Goals Engine (Predictive Orchestration)
The Goals Engine is our core Unique Selling Proposition (USP), offering predictive goal orchestration.
- **Simulated Trajectories:** Input a target (e.g., "₹10,00,000 for a car") and visualize the exact path to get there.
- **Dynamic Pacing:** Calculates exact required monthly or weekly contributions based on your deadline.
- **What-If Scenarios:** Simulate how changing your contribution today impacts your completion date.
- **Behavioral Adjustments:** The engine adapts to your actual saving habits in real-time, recalculating the required pace if you miss a contribution.

---

# 🛡️ Additional Features

## 🔒 Privacy Mode
We believe that in FinTech, User Experience isn't just about looking good—it’s about building trust. With one click, **Privacy Mode** instantly masks all sensitive data, balances, and transaction amounts, allowing you to check your finances safely in public spaces.

## 🎨 Premium UX & Aesthetics
- **Fluid Interactions:** 60fps micro-animations that make finance feel responsive and alive.
- **Dark Mode Optimization:** Reduces eye strain and creates a premium, institutional-grade feel.
- **Cognitive Ease:** Complex data is simplified into beautiful, easily digestible widgets.

---

# 🛣️ Development Roadmap

### ✅ Phase 1 — Financial Core
- Authentication & Secure User Profiles
- Balance Engine
- Account Management
- Transaction Management
- Cash Flow Engine
- Balance Workspace

### 🚧 Phase 2 — Money Management
- Expense Tracking & Analytics
- Bills & Subscription Management
- Investment Tracking
- Tax Management

### 📈 Phase 3 — Forecasting & Goals
- Goals Engine with Dynamic Pacing
- Future Balance Projection
- Net Worth Forecast
- Savings Forecast

### 🤖 Phase 4 — Financial Intelligence
- AI Financial Advisor Chatbot (e.g., "Can I afford to eat out tonight?")
- Smart Recommendations & What-if Simulations
- Personalized Insights

### 📱 Phase 5 — Platform Expansion
- Live Bank API Integrations (Plaid, Stripe)
- Mobile Application Deployment (React Native)
- Comprehensive Investment & Portfolio Tracking (Stocks, Crypto integrations)

### 🏢 Phase 6 — Business Finance
- Business Dashboard
- Payroll Management
- Invoice Tracking
- Business Cash Flow
- AI CFO Assistant

---

# 🌟 Future Vision

The Balance Engine will become the foundation for a complete **Digital Financial Twin**. Every future feature—from expense analytics to an AI CFO—will consume data from the same financial core, ensuring perfect consistency across your entire financial life.

---

# 🛠️ Tech Stack

## Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Backend
- FastAPI
- Python
- PostgreSQL / SQLite
- SQLAlchemy

---

# 📂 Project Structure

```
FinSphere-AI/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── types/
│
└── backend/
    ├── api/
    ├── models/
    ├── services/
    ├── database/
    └── main.py
```

---

# 🚀 Getting Started

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

---

# 🤝 Contributing
Contributions, ideas, and feedback are always welcome.
Feel free to fork the repository, open issues, or submit pull requests.

---

# 📄 License
This project is licensed under the MIT License.