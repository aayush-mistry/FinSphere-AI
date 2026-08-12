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

def score_candidate(occurrence: Dict, transaction: Dict, target_amount: Optional[float] = None) -> Dict:
    score = 0
    reasons = []

    expected_amount = target_amount if target_amount is not None else occurrence["amount"]
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

from schemas import MatchedTransactionDetail

def match_occurrences_to_transactions(occurrences: List[Dict], transactions: List[Dict]) -> List[BillMatchResult]:
    assigned_transactions = set()
    results = []
    
    # Sort occurrences chronologically
    occurrences = sorted(occurrences, key=lambda x: x["due_date"])

    for occ in occurrences:
        due_date = datetime.datetime.strptime(occ["due_date"], "%Y-%m-%d").date()
        expected_amount = occ["amount"]
        
        matched_txns = []
        total_matched_amount = 0.0
        
        while True:
            remaining_expected = max(0.0, expected_amount - total_matched_amount)
            # Break if we've satisfied the expected amount within tolerance
            if total_matched_amount > 0 and remaining_expected <= expected_amount * AMOUNT_TOLERANCE_PCT:
                break
                
            best_candidate = None
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
                
                if not (-MATCH_WINDOW_BEFORE <= days_diff <= MATCH_WINDOW_AFTER):
                    continue
                    
                score_data = score_candidate(occ, txn, target_amount=remaining_expected)
                
                if score_data["score"] >= MATCH_THRESHOLD:
                    if not best_candidate:
                        best_candidate = score_data
                        best_txn = txn
                    else:
                        # Tie breakers
                        if score_data["score"] > best_candidate["score"]:
                            best_candidate = score_data
                            best_txn = txn
                        elif score_data["score"] == best_candidate["score"]:
                            if score_data["abs_days_diff"] < best_candidate["abs_days_diff"]:
                                best_candidate = score_data
                                best_txn = txn
                            elif score_data["abs_days_diff"] == best_candidate["abs_days_diff"]:
                                if abs(score_data["amount_diff"]) < abs(best_candidate["amount_diff"]):
                                    best_candidate = score_data
                                    best_txn = txn
                                elif abs(score_data["amount_diff"]) == abs(best_candidate["amount_diff"]):
                                    if str(txn_id) < str(best_txn["id"]):
                                        best_candidate = score_data
                                        best_txn = txn

            if best_candidate and best_txn:
                assigned_transactions.add(best_txn["id"])
                total_matched_amount += best_candidate["actual_amount"]
                matched_txns.append(MatchedTransactionDetail(
                    transaction_id=str(best_txn["id"]),
                    transaction_date=best_candidate["transaction_date"],
                    actual_amount=best_candidate["actual_amount"],
                    days_difference=best_candidate["days_diff"],
                    score=best_candidate["score"],
                    match_reasons=best_candidate["reasons"]
                ))
            else:
                break
                
        if len(matched_txns) > 0:
            results.append(BillMatchResult(
                bill_id=occ["bill_id"],
                occurrence_date=occ["due_date"],
                expected_amount=occ["amount"],
                matched_transactions=matched_txns,
                matched=True,
                total_matched_amount=total_matched_amount
            ))
        else:
            results.append(BillMatchResult(
                bill_id=occ["bill_id"],
                occurrence_date=occ["due_date"],
                expected_amount=occ["amount"],
                matched_transactions=[],
                matched=False,
                total_matched_amount=0.0
            ))
            
    return results
