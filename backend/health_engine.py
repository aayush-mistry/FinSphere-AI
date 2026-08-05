from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import json
import os

# ---------------------------------------------------------
# Pydantic Models representing the frontend FinancialProfile
# ---------------------------------------------------------

class Account(BaseModel):
    id: str
    name: str
    institution: str
    type: str
    balance: float
    currency: str
    mask: str
    lastUpdated: str

class Transaction(BaseModel):
    id: str
    accountId: str
    date: str
    amount: float
    merchantName: str
    category: str
    isPending: bool

class Investment(BaseModel):
    id: str
    accountId: str
    ticker: str
    name: str
    shares: float
    price: float
    currentValue: float
    assetClass: str
    dayChange: float
    totalReturn: float

class Loan(BaseModel):
    id: str
    name: str
    provider: str
    type: str
    totalAmount: float
    remainingBalance: float
    interestRate: float
    nextEmiDate: str
    nextEmiAmount: float

class InsurancePolicy(BaseModel):
    id: str
    provider: str
    type: str
    coverageAmount: float
    premiumAmount: float
    renewalDate: str

class TaxRecord(BaseModel):
    year: int
    totalIncome: float
    estimatedTax: float
    taxPaid: float
    deductions: float

class UserProfile(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    joinDate: str

class FinancialProfile(BaseModel):
    user: UserProfile
    accounts: List[Account]
    transactions: List[Transaction]
    investments: List[Investment]
    loans: List[Loan]
    insurance: List[InsurancePolicy]
    taxes: List[TaxRecord]

# ---------------------------------------------------------
# Engine Response Model
# ---------------------------------------------------------

class HealthMetricResult(BaseModel):
    name: str
    score: int
    max_score: int
    value_description: str # e.g. "25% of income"
    status: str # "excellent", "good", "fair", "poor"

class HealthEngineResponse(BaseModel):
    overall_score: int # Normalized out of 100
    raw_score: int # Out of 110
    risk_level: str
    color_code: str
    metrics: List[HealthMetricResult]
    ai_explanation: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

# ---------------------------------------------------------
# Engine Logic
# ---------------------------------------------------------

class FinancialHealthEngine:
    def __init__(self, profile: FinancialProfile):
        self.profile = profile

    def _calculate_savings_rate(self) -> HealthMetricResult:
        # Savings Rate (20 pts): (Income - Expenses) / Income
        # Using transactions to find monthly income and expenses
        income = sum(t.amount for t in self.profile.transactions if t.amount > 0 and t.category == "Income")
        expenses = sum(abs(t.amount) for t in self.profile.transactions if t.amount < 0)
        
        # Fallback if no income in transactions (use tax record as monthly proxy)
        if income == 0 and self.profile.taxes:
            income = self.profile.taxes[0].totalIncome / 12

        if income == 0:
            rate = 0
        else:
            rate = max(0, (income - expenses) / income)
            
        score = 0
        if rate >= 0.20:
            score = 20
        elif rate >= 0.10:
            score = 15
        elif rate >= 0.05:
            score = 10
        else:
            score = 5

        return HealthMetricResult(
            name="Savings Rate",
            score=score,
            max_score=20,
            value_description=f"{int(rate * 100)}%",
            status="excellent" if score == 20 else "good" if score >= 15 else "fair" if score >= 10 else "poor"
        )

    def _calculate_dti(self) -> HealthMetricResult:
        # Debt to Income (15 pts)
        monthly_debt_payments = sum(l.nextEmiAmount for l in self.profile.loans)
        
        income = sum(t.amount for t in self.profile.transactions if t.amount > 0 and t.category == "Income")
        if income == 0 and self.profile.taxes:
            income = self.profile.taxes[0].totalIncome / 12
            
        if income == 0:
            dti = 1.0 # Highest risk
        else:
            dti = monthly_debt_payments / income

        score = 0
        if dti <= 0.20:
            score = 15
        elif dti <= 0.35:
            score = 10
        elif dti <= 0.50:
            score = 5
        else:
            score = 0

        return HealthMetricResult(
            name="Debt-to-Income",
            score=score,
            max_score=15,
            value_description=f"{int(dti * 100)}%",
            status="excellent" if score == 15 else "good" if score >= 10 else "fair" if score >= 5 else "poor"
        )

    def _calculate_emergency_fund(self) -> HealthMetricResult:
        # Emergency Fund (15 pts): Liquid cash / Monthly expenses
        liquid_cash = sum(a.balance for a in self.profile.accounts if a.type in ["checking", "savings"])
        expenses = sum(abs(t.amount) for t in self.profile.transactions if t.amount < 0)
        
        # If no expenses in transactions, use a default fallback to avoid div/0
        if expenses == 0: expenses = 3000
        
        months_coverage = liquid_cash / expenses
        
        score = 0
        if months_coverage >= 6:
            score = 15
        elif months_coverage >= 3:
            score = 10
        elif months_coverage >= 1:
            score = 5
        else:
            score = 0
            
        return HealthMetricResult(
            name="Emergency Fund",
            score=score,
            max_score=15,
            value_description=f"{round(months_coverage, 1)} months",
            status="excellent" if score == 15 else "good" if score >= 10 else "fair" if score >= 5 else "poor"
        )

    def _calculate_investments(self) -> HealthMetricResult:
        # Investment Diversification (15 pts)
        asset_classes = set(i.assetClass for i in self.profile.investments)
        diversity_count = len(asset_classes)
        
        score = 0
        if diversity_count >= 4:
            score = 15
        elif diversity_count >= 2:
            score = 10
        elif diversity_count >= 1:
            score = 5
        else:
            score = 0

        return HealthMetricResult(
            name="Investment Diversification",
            score=score,
            max_score=15,
            value_description=f"{diversity_count} asset classes",
            status="excellent" if score == 15 else "good" if score >= 10 else "fair" if score >= 5 else "poor"
        )

    def _calculate_cash_flow(self) -> HealthMetricResult:
        # Monthly Cash Flow (15 pts)
        income = sum(t.amount for t in self.profile.transactions if t.amount > 0 and t.category == "Income")
        expenses = sum(abs(t.amount) for t in self.profile.transactions if t.amount < 0)
        net_flow = income - expenses
        
        score = 0
        if net_flow > 1000:
            score = 15
        elif net_flow > 0:
            score = 10
        elif net_flow > -500:
            score = 5
        else:
            score = 0

        return HealthMetricResult(
            name="Monthly Cash Flow",
            score=score,
            max_score=15,
            value_description=f"${int(net_flow)}",
            status="excellent" if score == 15 else "good" if score >= 10 else "fair" if score >= 5 else "poor"
        )

    def _calculate_insurance(self) -> HealthMetricResult:
        # Insurance Coverage (10 pts)
        types = set(i.type for i in self.profile.insurance)
        has_health = "Health" in types
        has_life = "Life" in types
        
        score = 0
        if has_health and has_life:
            score = 10
        elif has_health or has_life:
            score = 5
        else:
            score = 0

        return HealthMetricResult(
            name="Insurance Coverage",
            score=score,
            max_score=10,
            value_description=f"{len(types)} policies",
            status="excellent" if score == 10 else "fair" if score >= 5 else "poor"
        )

    def _calculate_credit(self) -> HealthMetricResult:
        # Credit Utilization (10 pts)
        # Assuming credit card limit is roughly 3x balance for mock purposes if not provided
        cc_balance = sum(abs(a.balance) for a in self.profile.accounts if a.type == "credit_card")
        
        # We don't have limit in Account model, let's assume a generic limit of $10,000 for calculation
        utilization = cc_balance / 10000 if cc_balance > 0 else 0
        
        score = 0
        if utilization <= 0.10:
            score = 10
        elif utilization <= 0.30:
            score = 8
        elif utilization <= 0.50:
            score = 4
        else:
            score = 0

        return HealthMetricResult(
            name="Credit Utilization",
            score=score,
            max_score=10,
            value_description=f"{int(utilization * 100)}%",
            status="excellent" if score >= 8 else "good" if score >= 4 else "poor"
        )

    def _calculate_expense_stability(self) -> HealthMetricResult:
        # Expense Stability (10 pts) - How much of expenses are non-discretionary
        # For simplicity in mock, if they have few entertainment/shopping transactions, it's stable.
        discretionary_categories = ["Entertainment", "Shopping", "Food & Dining", "Travel"]
        discretionary_spend = sum(abs(t.amount) for t in self.profile.transactions if t.category in discretionary_categories and t.amount < 0)
        total_expenses = sum(abs(t.amount) for t in self.profile.transactions if t.amount < 0)
        
        ratio = discretionary_spend / total_expenses if total_expenses > 0 else 0
        
        score = 0
        if ratio <= 0.20:
            score = 10
        elif ratio <= 0.40:
            score = 7
        elif ratio <= 0.60:
            score = 4
        else:
            score = 0

        return HealthMetricResult(
            name="Expense Stability",
            score=score,
            max_score=10,
            value_description=f"{int(ratio * 100)}% Discretionary",
            status="excellent" if score >= 7 else "good" if score >= 4 else "poor"
        )

    async def generate_health_report(self) -> HealthEngineResponse:
        metrics = [
            self._calculate_savings_rate(),
            self._calculate_dti(),
            self._calculate_emergency_fund(),
            self._calculate_investments(),
            self._calculate_cash_flow(),
            self._calculate_insurance(),
            self._calculate_credit(),
            self._calculate_expense_stability()
        ]
        
        raw_score = sum(m.score for m in metrics)
        normalized_score = int((raw_score / 110) * 100)
        
        if normalized_score >= 80:
            risk_level = "Low Risk"
            color_code = "emerald"
        elif normalized_score >= 60:
            risk_level = "Moderate Risk"
            color_code = "amber"
        else:
            risk_level = "High Risk"
            color_code = "rose"

        # AI Generation
        try:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert financial advisor AI for FinSphere. Provide a JSON response explaining the user's financial health based on these calculated metrics."),
                ("human", """
                Score: {score}/100 ({risk_level})
                Metrics: {metrics}
                
                Return ONLY a valid JSON object with EXACTLY these keys:
                - "ai_explanation": A 2-3 sentence overarching summary of their financial health.
                - "strengths": A list of exactly 3 strings highlighting their strongest areas.
                - "weaknesses": A list of exactly 3 strings highlighting their weakest areas.
                - "recommendations": A list of exactly 5 actionable steps to improve their score.
                """)
            ])
            
            chain = prompt | llm
            res = await chain.ainvoke({
                "score": normalized_score,
                "risk_level": risk_level,
                "metrics": [{"name": m.name, "score": f"{m.score}/{m.max_score}", "value": m.value_description} for m in metrics]
            })
            
            ai_data = json.loads(res.content.replace("```json", "").replace("```", "").strip())
        except Exception as e:
            # Fallback if LLM fails or API key is missing
            ai_data = {
                "ai_explanation": "Your financial health is currently being calculated based on standardized metrics. AI insights are temporarily unavailable.",
                "strengths": ["Data analysis complete", "Metrics generated", "Profile successfully parsed"],
                "weaknesses": ["AI connection failed", "Detailed insights missing", "Dynamic recommendations unavailable"],
                "recommendations": ["Check your internet connection", "Ensure API keys are configured", "Try refreshing the page", "Review your metrics manually", "Consult a human advisor"]
            }

        return HealthEngineResponse(
            overall_score=normalized_score,
            raw_score=raw_score,
            risk_level=risk_level,
            color_code=color_code,
            metrics=metrics,
            ai_explanation=ai_data.get("ai_explanation", "Explanation unavailable."),
            strengths=ai_data.get("strengths", []),
            weaknesses=ai_data.get("weaknesses", []),
            recommendations=ai_data.get("recommendations", [])
        )
