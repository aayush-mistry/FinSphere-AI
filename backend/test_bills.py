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
