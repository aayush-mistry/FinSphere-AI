import datetime
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from schemas import BillMatchResult, BillReconciliationResponse
from services.upcoming_bills_service import generate_upcoming_occurrences
from services.transaction_integration import get_user_transactions

# Configurable constants
MATCH_WINDOW_BEFORE = 3
MATCH_WINDOW_AFTER = 7
MATCH_THRESHOLD = 70

# Weights
SCORE_EXACT_AMOUNT = 60
SCORE_TOLERANCE_AMOUNT = 30
SCORE_EXACT_DATE = 40
SCORE_DATE_NEAR = 20
SCORE_DATE_FAR = 10
SCORE_CATEGORY = 20
SCORE_MERCHANT = 20
SCORE_ACCOUNT = 15

AMOUNT_TOLERANCE_PCT = 0.05 # 5% tolerance

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return text.lower().strip()

def score_candidate(occurrence: Dict, transaction: Dict) -> Dict:
    score = 0
    reasons = []

    expected_amount = occurrence["amount"]
    # We expect actual_amount to be negative (outflow). We'll compare absolute values.
    actual_amount = abs(transaction["amount"])
    amount_diff = actual_amount - expected_amount

    # Amount Scoring
    if math.isclose(expected_amount, actual_amount, abs_tol=0.01):
        score += SCORE_EXACT_AMOUNT
        reasons.append("Exact amount")
    elif abs(amount_diff) / expected_amount <= AMOUNT_TOLERANCE_PCT:
        score += SCORE_TOLERANCE_AMOUNT
        reasons.append("Amount within tolerance")

    # Date Scoring
    due_date = datetime.datetime.strptime(occurrence["due_date"], "%Y-%m-%d").date()
    txn_date_str = transaction["date"]
    if "T" in txn_date_str:
        txn_date_str = txn_date_str.split("T")[0]
    txn_date = datetime.datetime.strptime(txn_date_str, "%Y-%m-%d").date()
    
    days_diff = (txn_date - due_date).days
    abs_days_diff = abs(days_diff)

    if abs_days_diff == 0:
        score += SCORE_EXACT_DATE
        reasons.append("Exact due date")
    elif 1 <= abs_days_diff <= 3:
        score += SCORE_DATE_NEAR
        reasons.append("Within 3 days")
    elif 4 <= abs_days_diff <= 7:
        score += SCORE_DATE_FAR
        reasons.append("Within 7 days")

    # Category Scoring
    bill_category = normalize_text(occurrence.get("category", ""))
    txn_category = normalize_text(transaction.get("category", transaction.get("expenseCategory", {}).get("name", "")))
    if bill_category and txn_category and (bill_category in txn_category or txn_category in bill_category):
        score += SCORE_CATEGORY
        reasons.append("Category match")

    # Merchant Scoring
    bill_name = normalize_text(occurrence.get("bill_name", ""))
    txn_desc = normalize_text(transaction.get("description", ""))
    if bill_name and txn_desc and (bill_name in txn_desc or txn_desc in bill_name):
        score += SCORE_MERCHANT
        reasons.append("Merchant match")
        
    # Account Scoring
    bill_account = occurrence.get("account_id")
    txn_account = transaction.get("accountId")
    if bill_account and txn_account and str(bill_account) == str(txn_account):
        score += SCORE_ACCOUNT
        reasons.append("Account match")

    return {
        "score": score,
        "reasons": reasons,
        "days_diff": days_diff,
        "abs_days_diff": abs_days_diff,
        "amount_diff": amount_diff,
        "actual_amount": actual_amount,
        "transaction_date": txn_date_str
    }


def is_eligible_transaction(transaction: Dict) -> bool:
    # 1. Direction: Must be an outflow (negative amount)
    # The frontend mockTransactions uses positive amounts for income, negative for expense typically,
    # or specifies a type. Let's assume bills are outflows, meaning amount < 0.
    amount = transaction.get("amount", 0)
    if amount >= 0:
        return False
        
    # 2. Not a refund or transfer
    category = transaction.get("expenseCategory", {}).get("name", "").lower()
    if not category:
        category = transaction.get("category", "").lower()
        
    if "refund" in category or "transfer" in category:
        return False
        
    desc = transaction.get("description", "").lower()
    if "refund" in desc or "transfer" in desc:
        return False

    return True

def match_occurrences_to_transactions(occurrences: List[Dict], transactions: List[Dict]) -> List[BillMatchResult]:
    assigned_transactions = set()
    results = []
    
    # Sort occurrences chronologically
    occurrences = sorted(occurrences, key=lambda x: x["due_date"])

    for occ in occurrences:
        due_date = datetime.datetime.strptime(occ["due_date"], "%Y-%m-%d").date()
        best_candidate = None
        best_score_data = None
        best_txn = None
        
        for txn in transactions:
            txn_id = txn["id"]
            if txn_id in assigned_transactions:
                continue
                
            if not is_eligible_transaction(txn):
                continue
                
            txn_date_str = txn["date"]
            if "T" in txn_date_str:
                txn_date_str = txn_date_str.split("T")[0]
            txn_date = datetime.datetime.strptime(txn_date_str, "%Y-%m-%d").date()
            
            days_diff = (txn_date - due_date).days
            
            # Check matching window (e.g. -3 to +7 days)
            if not (-MATCH_WINDOW_BEFORE <= days_diff <= MATCH_WINDOW_AFTER):
                continue
                
            score_data = score_candidate(occ, txn)
            
            if score_data["score"] >= MATCH_THRESHOLD:
                if not best_candidate:
                    best_candidate = score_data
                    best_txn = txn
                else:
                    # Tie breakers
                    # 1. Score
                    if score_data["score"] > best_candidate["score"]:
                        best_candidate = score_data
                        best_txn = txn
                    elif score_data["score"] == best_candidate["score"]:
                        # 2. Date diff
                        if score_data["abs_days_diff"] < best_candidate["abs_days_diff"]:
                            best_candidate = score_data
                            best_txn = txn
                        elif score_data["abs_days_diff"] == best_candidate["abs_days_diff"]:
                            # 3. Amount diff
                            if abs(score_data["amount_diff"]) < abs(best_candidate["amount_diff"]):
                                best_candidate = score_data
                                best_txn = txn
                            elif abs(score_data["amount_diff"]) == abs(best_candidate["amount_diff"]):
                                # 4. Deterministic ID sort
                                if str(txn_id) < str(best_txn["id"]):
                                    best_candidate = score_data
                                    best_txn = txn

        if best_candidate and best_txn:
            assigned_transactions.add(best_txn["id"])
            results.append(BillMatchResult(
                bill_id=occ["bill_id"],
                occurrence_date=occ["due_date"],
                expected_amount=occ["amount"],
                transaction_id=str(best_txn["id"]),
                transaction_date=best_candidate["transaction_date"],
                actual_amount=best_candidate["actual_amount"],
                amount_difference=best_candidate["amount_diff"],
                days_difference=best_candidate["days_diff"],
                score=best_candidate["score"],
                matched=True,
                match_reasons=best_candidate["reasons"]
            ))
        else:
            results.append(BillMatchResult(
                bill_id=occ["bill_id"],
                occurrence_date=occ["due_date"],
                expected_amount=occ["amount"],
                transaction_id=None,
                transaction_date=None,
                actual_amount=None,
                amount_difference=None,
                days_difference=None,
                score=0,
                matched=False,
                match_reasons=[]
            ))
            
    return results

def reconcile_bills(user_id: int, start_date: str, end_date: str, db: Session) -> BillReconciliationResponse:
    # 1. Fetch occurrences. We can use the upcoming bills service by faking the reference_date.
    # calculate_upcoming_occurrences typically looks forward from reference_date. 
    # To get a range, we can pass start_date as reference_date, and horizon as (end_date - start_date).days
    sd = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    ed = datetime.datetime.strptime(end_date, "%Y-%m-%d")
    days = (ed - sd).days
    
    # We will get occurrences for the historical period
    # Need to fetch bills first
    from models import Bill
    bills = db.query(Bill).filter(Bill.user_id == user_id).all()
    occurrences = generate_upcoming_occurrences(bills, sd.date(), days)
    # The return type is a list of UpcomingBillOccurrence schemas
    occ_dicts = [o.dict() for o in occurrences]
    
    # Filter out occurrences strictly before start_date just in case, though they shouldn't exist
    
    # 2. Fetch transactions
    transactions = get_user_transactions(user_id)
    # The frontend mock is global. The backend handles filtering by user if supported.
    
    # 3. Match
    matches = match_occurrences_to_transactions(occ_dicts, transactions)
    
    matched_count = sum(1 for m in matches if m.matched)
    
    return BillReconciliationResponse(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        total_occurrences=len(matches),
        matched_occurrences=matched_count,
        unmatched_occurrences=len(matches) - matched_count,
        matches=matches
    )
