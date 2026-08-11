from typing import List, Optional, Dict, Any
from collections import defaultdict
import models
import schemas

def normalize_bill(bill: models.Bill) -> tuple[float, float]:
    """
    Normalizes a bill's amount to monthly and annual equivalents based on its frequency.
    Returns (monthly_equivalent, annual_equivalent)
    """
    amount = bill.amount
    freq = bill.frequency

    if freq == "Weekly":
        monthly = amount * 52 / 12
        annual = amount * 52
    elif freq == "Monthly":
        monthly = amount
        annual = amount * 12
    elif freq == "Quarterly":
        monthly = amount / 3
        annual = amount * 4
    elif freq == "Half-Yearly":
        monthly = amount / 6
        annual = amount * 2
    elif freq == "Yearly":
        monthly = amount / 12
        annual = amount
    else:
        # Fallback for unexpected frequency
        monthly = amount
        annual = amount * 12
        
    return monthly, annual

def calculate_recurring_summary(
    bills: List[models.Bill], 
    monthly_income: Optional[float] = None
) -> dict:
    
    # 1. Filter only Active bills
    active_bills = [b for b in bills if b.status == "Active"]
    
    total_monthly = 0.0
    total_annual = 0.0
    
    category_totals_monthly = defaultdict(float)
    category_totals_annual = defaultdict(float)
    
    bill_details: List[schemas.BillRecurringDetail] = []
    
    for bill in active_bills:
        monthly, annual = normalize_bill(bill)
        
        total_monthly += monthly
        total_annual += annual
        
        category_totals_monthly[bill.category] += monthly
        category_totals_annual[bill.category] += annual
        
        bill_details.append(
            schemas.BillRecurringDetail(
                id=bill.id,
                name=bill.name,
                category=bill.category,
                amount=bill.amount,
                frequency=bill.frequency,
                monthly_equivalent=round(monthly, 2),
                annual_equivalent=round(annual, 2)
            )
        )
        
    # 2. Sort bills descending by monthly equivalent
    bill_details.sort(key=lambda x: x.monthly_equivalent, reverse=True)
    
    # 3. Category Breakdown
    categories: List[schemas.CategoryRecurring] = []
    for cat, cat_monthly in category_totals_monthly.items():
        cat_annual = category_totals_annual[cat]
        percentage = (cat_monthly / total_monthly * 100) if total_monthly > 0 else 0.0
        
        categories.append(
            schemas.CategoryRecurring(
                category=cat,
                monthly_amount=round(cat_monthly, 2),
                annual_amount=round(cat_annual, 2),
                percentage=round(percentage, 2)
            )
        )
        
    # Sort categories descending by monthly amount
    categories.sort(key=lambda x: x.monthly_amount, reverse=True)
    
    # 4. Income Comparison
    income_available = monthly_income is not None and monthly_income > 0
    recurring_expense_ratio = 0.0
    income_after_recurring_bills = 0.0
    
    if income_available:
        recurring_expense_ratio = (total_monthly / monthly_income * 100) if monthly_income else 0.0
        income_after_recurring_bills = monthly_income - total_monthly
    else:
        # Default zero-state values
        recurring_expense_ratio = 0.0
        income_after_recurring_bills = 0.0
        # If income is not available but not explicitly 0, we can just return 0 or None. 
        # The empty state requires returning these as 0 or handling it gracefully.
        
    # Return the summary dict
    return {
        "monthly_recurring": round(total_monthly, 2),
        "annual_recurring": round(total_annual, 2),
        "active_bill_count": len(active_bills),
        "income_available": income_available,
        "monthly_income": round(monthly_income, 2) if monthly_income else (0.0 if not income_available and total_monthly == 0 else None),
        "recurring_expense_ratio": round(recurring_expense_ratio, 2),
        "income_after_recurring_bills": round(income_after_recurring_bills, 2) if income_available else 0.0,
        "categories": categories,
        "bills": bill_details
    }
