import json
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
BASE_URL = "/api/bills"

def make_request(url, method="GET", data=None):
    if method == "GET":
        res = client.get(url)
    elif method == "POST":
        res = client.post(url, json=data)
    elif method == "PUT":
        res = client.put(url, json=data)
    elif method == "PATCH":
        res = client.patch(url, json=data)
    elif method == "DELETE":
        res = client.delete(url)
    return res.status_code, res.json() if res.content else None

def verify():
    print("1. Creating Bill...")
    payload = {
        "user_id": 1,
        "name": "Verify Bill",
        "category": "Internet",
        "amount": 999.0,
        "currency": "INR",
        "frequency": "Monthly",
        "due_day": 15,
        "start_date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    }
    status, res = make_request(BASE_URL, method="POST", data=payload)
    if status != 201:
        print(f"Error creating bill: {res}")
    assert status == 201, f"Failed to create: {res}"
    bill_id = res["id"]
    print(f"   Success! Bill ID: {bill_id}")

    print("2. Fetching Bill...")
    status, bills = make_request(f"{BASE_URL}?user_id=1")
    assert status == 200
    assert any(b["id"] == bill_id for b in bills), "Bill not found in fetch"
    print("   Success! Bill fetched.")

    print("3. Editing Bill...")
    status, res = make_request(f"{BASE_URL}/{bill_id}?user_id=1", method="PUT", data={"amount": 1099.0})
    assert status == 200
    assert res["amount"] == 1099.0
    print("   Success! Bill amount updated to 1099.")

    print("4. Pausing Bill...")
    status, res = make_request(f"{BASE_URL}/{bill_id}/status?user_id=1", method="PATCH", data={"status": "Paused"})
    assert status == 200
    assert res["status"] == "Paused"
    print("   Success! Bill status changed to Paused.")

    print("5. Checking User Isolation...")
    status, res = make_request(f"{BASE_URL}/{bill_id}?user_id=2")
    assert status == 403, f"Should be 403 Forbidden, got {status}"
    print("   Success! User 2 cannot access User 1's bill.")

    print("6. Cleaning up...")
    status, res = make_request(f"{BASE_URL}/{bill_id}?user_id=1", method="DELETE")
    assert status == 204
    print("   Success! Bill deleted.")
    
    print("\nALL BACKEND API PIPELINE CHECKS PASSED.")

if __name__ == "__main__":
    verify()
