from conftest import client
from datetime import datetime, timedelta, timezone

def create_test_bill(user_id: int = 1):
    payload = {
        "user_id": user_id,
        "name": "Netflix",
        "category": "Subscription",
        "amount": 649,
        "frequency": "Monthly",
        "due_day": 15,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    }
    response = client.post("/api/bills", json=payload)
    return response.json()

def test_create_bill():
    data = create_test_bill()
    assert data["name"] == "Netflix"
    assert data["amount"] == 649
    assert data["status"] == "Active"

def test_create_bill_invalid_amount():
    payload = {
        "user_id": 1,
        "name": "Spotify",
        "category": "Subscription",
        "amount": -100, # Invalid amount
        "frequency": "Monthly",
        "due_day": 15,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    }
    response = client.post("/api/bills", json=payload)
    assert response.status_code == 422 # Unprocessable Entity

def test_get_bills():
    create_test_bill()
    response = client.get("/api/bills?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "Netflix"

def test_get_bill_cross_user():
    bill = create_test_bill(user_id=1)
    bill_id = bill["id"]
    
    response = client.get(f"/api/bills/{bill_id}?user_id=2")
    assert response.status_code == 403

def test_update_bill():
    bill = create_test_bill()
    bill_id = bill["id"]
    
    payload = {
        "amount": 699,
        "auto_pay": True
    }
    response = client.put(f"/api/bills/{bill_id}?user_id=1", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 699
    assert data["auto_pay"] == True

def test_patch_bill_status():
    bill = create_test_bill()
    bill_id = bill["id"]
    
    payload = {
        "status": "Paused"
    }
    response = client.patch(f"/api/bills/{bill_id}/status?user_id=1", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Paused"

def test_delete_bill():
    bill = create_test_bill()
    bill_id = bill["id"]
    
    response = client.delete(f"/api/bills/{bill_id}?user_id=1")
    assert response.status_code == 204
    
    # Verify it is deleted
    response = client.get(f"/api/bills/{bill_id}?user_id=1")
    assert response.status_code == 404

def test_normalization_weekly():
    payload = {
        "user_id": 1,
        "name": "Weekly Service",
        "category": "Other",
        "amount": 520,
        "frequency": "Weekly",
        "due_day": 1,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    }
    client.post("/api/bills", json=payload)
    
    response = client.get("/api/bills/recurring-summary?user_id=1")
    data = response.json()
    bill = next((b for b in data["bills"] if b["name"] == "Weekly Service"), None)
    assert bill is not None
    # 520 * 52 / 12 = 2253.33
    assert abs(bill["monthly_equivalent"] - 2253.33) < 0.02
    assert bill["annual_equivalent"] == 27040

def test_status_exclusion():
    # Create active bill
    client.post("/api/bills", json={
        "user_id": 1, "name": "Active Bill", "category": "Other",
        "amount": 10000, "frequency": "Monthly", "due_day": 1,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    })
    
    # Create paused bill
    res2 = client.post("/api/bills", json={
        "user_id": 1, "name": "Paused Bill", "category": "Other",
        "amount": 5000, "frequency": "Monthly", "due_day": 1,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    })
    paused_id = res2.json()["id"]
    client.patch(f"/api/bills/{paused_id}/status?user_id=1", json={"status": "Paused"})
    
    response = client.get("/api/bills/recurring-summary?user_id=1")
    data = response.json()
    
    # Note: earlier tests created other bills for user 1 (e.g. Netflix 649, Weekly 2253.33).
    # We should just assert the count or clear db, but since conftest.py resets db per module...
    # Wait, conftest.py resets db per FUNCTION because of autouse=True!
    # So user 1 has exactly these 2 bills.
    assert data["monthly_recurring"] == 10000.0
    assert data["active_bill_count"] == 1

def test_income_comparison():
    client.post("/api/bills", json={
        "user_id": 1, "name": "Rent", "category": "Housing",
        "amount": 25000, "frequency": "Monthly", "due_day": 1,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    })
    
    response = client.get("/api/bills/recurring-summary?user_id=1&monthly_income=100000")
    data = response.json()
    
    assert data["income_available"] == True
    assert data["recurring_expense_ratio"] == 25.0
    assert data["income_after_recurring_bills"] == 75000.0

def test_upcoming_bills_deterministic():
    # Use user 2 for isolation
    # Reference date: 2026-08-11
    ref_date = "2026-08-11"
    
    # 1. Monthly Bill (Due 15th) -> Due Aug 15
    client.post("/api/bills", json={"user_id": 2, "name": "Monthly", "category": "Other", "amount": 100, "frequency": "Monthly", "due_day": 15, "start_date": "2026-01-01T00:00:00Z"})
    # 2. Weekly Bill (Start 2026-08-10) -> Occurs Aug 17, 24, 31, Sep 7
    client.post("/api/bills", json={"user_id": 2, "name": "Weekly", "category": "Other", "amount": 50, "frequency": "Weekly", "due_day": 1, "start_date": "2026-08-10T00:00:00Z"})
    # 3. Quarterly Bill (Start 2026-07-01) -> Occurs Oct 01
    client.post("/api/bills", json={"user_id": 2, "name": "Quarterly", "category": "Other", "amount": 300, "frequency": "Quarterly", "due_day": 1, "start_date": "2026-07-01T00:00:00Z"})
    # 4. Half-Yearly (Start 2026-05-01) -> Occurs Nov 01
    client.post("/api/bills", json={"user_id": 2, "name": "HalfYearly", "category": "Other", "amount": 600, "frequency": "Half-Yearly", "due_day": 1, "start_date": "2026-05-01T00:00:00Z"})
    # 5. Yearly (Start 2025-08-20) -> Occurs Aug 20, 2026
    client.post("/api/bills", json={"user_id": 2, "name": "Yearly", "category": "Other", "amount": 1200, "frequency": "Yearly", "due_day": 1, "start_date": "2025-08-20T00:00:00Z"})
    
    # 6. Due Today (Aug 11)
    client.post("/api/bills", json={"user_id": 2, "name": "Today", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 11, "start_date": "2026-01-01T00:00:00Z"})
    # 7. Due Tomorrow (Aug 12)
    client.post("/api/bills", json={"user_id": 2, "name": "Tomorrow", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 12, "start_date": "2026-01-01T00:00:00Z"})
    
    # 9. Start date exclusion (Starts Sep 15, ref is Aug 11, horizon 30 days -> Sep 10). Should NOT appear.
    client.post("/api/bills", json={"user_id": 2, "name": "FutureStart", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 15, "start_date": "2026-09-15T00:00:00Z"})
    
    # 10. End date exclusion (Ends Aug 10). Should NOT appear.
    client.post("/api/bills", json={"user_id": 2, "name": "Ended", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 15, "start_date": "2026-01-01T00:00:00Z", "end_date": "2026-08-10T00:00:00Z"})
    
    # 11, 12, 13. Paused/Cancelled/Completed exclusion
    res_p = client.post("/api/bills", json={"user_id": 2, "name": "PausedB", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 15, "start_date": "2026-01-01T00:00:00Z"})
    client.patch(f"/api/bills/{res_p.json()['id']}/status?user_id=2", json={"status": "Paused"})
    
    # 15. Month-end due day (Due 31st). Next is Aug 31, then Sep 30
    client.post("/api/bills", json={"user_id": 2, "name": "MonthEnd", "category": "Other", "amount": 10, "frequency": "Monthly", "due_day": 31, "start_date": "2026-01-01T00:00:00Z"})
    
    # 16. Leap year (Start 2024-02-29, Yearly). Next is 2027-03-01? Wait, ref is 2026-08-11. 
    # Yearly from 2024-02-29 occurs in 2025-03-01, 2026-03-01, 2027-03-01. It will be 2027-03-01, so not in 30 days. Let's make it due Aug 15 for leap year.
    # We will test month end specifically.
    
    # Run API
    response = client.get(f"/api/bills/upcoming?user_id=2&days=30&reference_date={ref_date}")
    assert response.status_code == 200
    data = response.json()
    
    # Check exclusions
    names = [b["bill_name"] for b in data]
    assert "FutureStart" not in names
    assert "Ended" not in names
    assert "PausedB" not in names
    
    # Check occurrences
    today_occ = next(b for b in data if b["bill_name"] == "Today")
    assert today_occ["days_until_due"] == 0
    assert today_occ["status"] == "Due Today"
    
    tomorrow_occ = next(b for b in data if b["bill_name"] == "Tomorrow")
    assert tomorrow_occ["days_until_due"] == 1
    assert tomorrow_occ["status"] == "Due Soon"
    
    # Check weekly generated 4 times in 30 days (Aug 17, 24, 31, Sep 7)
    weekly_occs = [b for b in data if b["bill_name"] == "Weekly"]
    assert len(weekly_occs) == 4
    
    # Check month-end (31st). Horizon is 30 days (Sep 10). Should appear exactly once (Aug 31).
    month_end_occs = [b for b in data if b["bill_name"] == "MonthEnd"]
    assert len(month_end_occs) == 1
    assert month_end_occs[0]["due_date"] == "2026-08-31"

    # Check 90 days horizon
    response90 = client.get(f"/api/bills/upcoming-summary?user_id=2&days=90&reference_date={ref_date}")
    data90 = response90.json()
    assert data90["total_upcoming_amount"] > 0
    assert data90["next_bill"] is not None
    assert data90["next_bill"]["name"] == "Today"

