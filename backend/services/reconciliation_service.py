import datetime
import math
from typing import List, Optional
from sqlalchemy.orm import Session

from schemas import (
    BillReconciliationResponse,
    BillReconciliationResult,
    BillReconciliationStatus,
    ReconciliationSummary,
    UpcomingBillOccurrence
)
from services.upcoming_bills_service import generate_upcoming_occurrences
from services.transaction_integration import get_user_transactions
from services.bill_matching_service import match_occurrences_to_transactions, AMOUNT_TOLERANCE_PCT

def evaluate_reconciliation(occurrence_dict: dict, match_result, today: datetime.date) -> BillReconciliationResult:
    due_date = datetime.datetime.strptime(match_result.occurrence_date, "%Y-%m-%d").date()
    expected = match_result.expected_amount
    paid = match_result.total_matched_amount
    
    payment_count = len(match_result.matched_transactions)
    
    first_payment_date = None
    final_payment_date = None
    if payment_count > 0:
        dates = [datetime.datetime.strptime(t.transaction_date, "%Y-%m-%d").date() for t in match_result.matched_transactions]
        first_payment_date = min(dates)
        final_payment_date = max(dates)
        
    days_late = 0
    if final_payment_date and final_payment_date > due_date:
        days_late = (final_payment_date - due_date).days
        
    days_overdue = 0
    if today > due_date and paid == 0:
        days_overdue = (today - due_date).days

    tolerance = expected * AMOUNT_TOLERANCE_PCT
    status = None
    reason = ""
    
    if paid == 0:
        if due_date > today:
            status = BillReconciliationStatus.UPCOMING
            reason = "Bill is upcoming and no payment received yet."
        elif due_date == today:
            status = BillReconciliationStatus.DUE
            reason = "Bill is due today."
        else:
            status = BillReconciliationStatus.OVERDUE
            reason = f"Bill is overdue by {days_overdue} days."
    else:
        if math.isclose(paid, expected, abs_tol=0.01) or (expected - tolerance <= paid <= expected + tolerance):
            if final_payment_date and final_payment_date > due_date:
                status = BillReconciliationStatus.PAID_LATE
                reason = f"Full payment received {days_late} days after due date."
            else:
                status = BillReconciliationStatus.PAID
                reason = "Paid in full on or before due date."
        elif paid > expected + tolerance:
            status = BillReconciliationStatus.OVERPAID
            reason = "Paid amount significantly exceeds expected amount."
        else:
            status = BillReconciliationStatus.PARTIALLY_PAID
            if due_date > today:
                reason = "Partial payment received before due date."
            else:
                reason = "Partial payment received."
                
    remaining = max(0.0, expected - paid) if status != BillReconciliationStatus.OVERPAID else 0.0
    overpayment = max(0.0, paid - expected) if status == BillReconciliationStatus.OVERPAID else 0.0
    
    confidence = 0.0
    if payment_count > 0:
        confidence = sum(t.score for t in match_result.matched_transactions) / payment_count / 100.0
        confidence = min(1.0, confidence)
        
    return BillReconciliationResult(
        bill_id=match_result.bill_id,
        bill_name=occurrence_dict.get("bill_name", ""),
        occurrence_date=match_result.occurrence_date,
        expected_amount=expected,
        status=status,
        paid_amount=paid,
        remaining_amount=remaining,
        overpayment_amount=overpayment,
        payment_count=payment_count,
        first_payment_date=first_payment_date.isoformat() if first_payment_date else None,
        final_payment_date=final_payment_date.isoformat() if final_payment_date else None,
        days_late=days_late,
        days_overdue=days_overdue,
        matched_transaction_ids=[t.transaction_id for t in match_result.matched_transactions],
        match_confidence=confidence,
        reconciliation_reason=reason
    )

def get_reconciliation_report(user_id: int, start_date: str, end_date: str, db: Session, status_filter: Optional[str] = None) -> BillReconciliationResponse:
    sd = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    ed = datetime.datetime.strptime(end_date, "%Y-%m-%d")
    days = (ed - sd).days
    
    from models import Bill
    bills = db.query(Bill).filter(Bill.user_id == user_id).all()
    occurrences = generate_upcoming_occurrences(bills, sd.date(), days)
    
    filtered_occurrences = []
    for occ in occurrences:
        due = datetime.datetime.strptime(occ.due_date, "%Y-%m-%d").date()
        if sd.date() <= due <= ed.date():
            filtered_occurrences.append(occ)
            
    occ_dicts = [o.dict() for o in filtered_occurrences]
    
    transactions = get_user_transactions(user_id)
    matches = match_occurrences_to_transactions(occ_dicts, transactions)
    
    today = datetime.datetime.now(datetime.timezone.utc).date()
    
    results = []
    for occ_dict, match in zip(occ_dicts, matches):
        result = evaluate_reconciliation(occ_dict, match, today)
        if status_filter and result.status.value != status_filter:
            continue
        results.append(result)
        
    summary = ReconciliationSummary(
        total_bills=len(results),
        paid=sum(1 for r in results if r.status == BillReconciliationStatus.PAID),
        paid_late=sum(1 for r in results if r.status == BillReconciliationStatus.PAID_LATE),
        partially_paid=sum(1 for r in results if r.status == BillReconciliationStatus.PARTIALLY_PAID),
        overpaid=sum(1 for r in results if r.status == BillReconciliationStatus.OVERPAID),
        unpaid=sum(1 for r in results if r.status == BillReconciliationStatus.UNPAID),
        overdue=sum(1 for r in results if r.status == BillReconciliationStatus.OVERDUE),
        total_expected=sum(r.expected_amount for r in results),
        total_paid=sum(r.paid_amount for r in results),
        total_remaining=sum(r.remaining_amount for r in results)
    )
    
    return BillReconciliationResponse(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        occurrences=filtered_occurrences,
        results=results,
        summary=summary
    )
