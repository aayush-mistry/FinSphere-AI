import datetime
import pytest
from schemas import BillMatchResult, MatchedTransactionDetail, BillReconciliationStatus
from services.reconciliation_service import evaluate_reconciliation

def test_status_upcoming():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[],
        matched=False,
        total_matched_amount=0
    )
    today = datetime.date(2023, 8, 10)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.UPCOMING

def test_status_due():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[],
        matched=False,
        total_matched_amount=0
    )
    today = datetime.date(2023, 8, 15)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.DUE

def test_status_overdue():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[],
        matched=False,
        total_matched_amount=0
    )
    today = datetime.date(2023, 8, 20)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.OVERDUE
    assert result.days_overdue == 5

def test_status_paid():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[
            MatchedTransactionDetail(
                transaction_id="txn1",
                transaction_date="2023-08-14",
                actual_amount=1000,
                days_difference=-1,
                score=100,
                match_reasons=[]
            )
        ],
        matched=True,
        total_matched_amount=1000
    )
    today = datetime.date(2023, 8, 16)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.PAID
    assert result.paid_amount == 1000
    assert result.remaining_amount == 0

def test_status_paid_late():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[
            MatchedTransactionDetail(
                transaction_id="txn1",
                transaction_date="2023-08-18",
                actual_amount=1000,
                days_difference=3,
                score=100,
                match_reasons=[]
            )
        ],
        matched=True,
        total_matched_amount=1000
    )
    today = datetime.date(2023, 8, 20)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.PAID_LATE
    assert result.days_late == 3

def test_status_partially_paid():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[
            MatchedTransactionDetail(
                transaction_id="txn1",
                transaction_date="2023-08-18",
                actual_amount=700,
                days_difference=3,
                score=100,
                match_reasons=[]
            )
        ],
        matched=True,
        total_matched_amount=700
    )
    today = datetime.date(2023, 8, 20)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.PARTIALLY_PAID
    assert result.paid_amount == 700
    assert result.remaining_amount == 300
    # days_late applies because the partial payment was late
    assert result.days_late == 3

def test_status_overpaid_multiple():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=1000,
        matched_transactions=[
            MatchedTransactionDetail(
                transaction_id="txn1",
                transaction_date="2023-08-12",
                actual_amount=600,
                days_difference=-3,
                score=100,
                match_reasons=[]
            ),
            MatchedTransactionDetail(
                transaction_id="txn2",
                transaction_date="2023-08-14",
                actual_amount=600,
                days_difference=-1,
                score=100,
                match_reasons=[]
            )
        ],
        matched=True,
        total_matched_amount=1200
    )
    today = datetime.date(2023, 8, 16)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.OVERPAID
    assert result.paid_amount == 1200
    assert result.remaining_amount == 0
    assert result.overpayment_amount == 200
    assert result.payment_count == 2
    assert result.first_payment_date == "2023-08-12"
    assert result.final_payment_date == "2023-08-14"

def test_status_multiple_payments_paid():
    occ = {"bill_name": "Test Bill"}
    match = BillMatchResult(
        bill_id=1,
        occurrence_date="2023-08-15",
        expected_amount=2000,
        matched_transactions=[
            MatchedTransactionDetail(
                transaction_id="txn1",
                transaction_date="2023-08-14",
                actual_amount=1000,
                days_difference=-1,
                score=100,
                match_reasons=[]
            ),
            MatchedTransactionDetail(
                transaction_id="txn2",
                transaction_date="2023-08-16",
                actual_amount=1000,
                days_difference=1,
                score=100,
                match_reasons=[]
            )
        ],
        matched=True,
        total_matched_amount=2000
    )
    today = datetime.date(2023, 8, 20)
    result = evaluate_reconciliation(occ, match, today)
    assert result.status == BillReconciliationStatus.PAID_LATE
    assert result.paid_amount == 2000
    assert result.days_late == 1
    assert result.payment_count == 2
    assert result.first_payment_date == "2023-08-14"
    assert result.final_payment_date == "2023-08-16"
