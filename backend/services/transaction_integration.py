import httpx
import os

TRANSACTIONS_API_URL = os.getenv("TRANSACTIONS_API_URL", "http://localhost:3000/api/transactions")

def verify_transaction(transaction_id: str, user_id: int) -> bool:
    """
    Verifies that a transaction exists in the frontend system.
    Note: Since the frontend doesn't currently strictly map user_id on mock transactions,
    we simply verify existence, but in a real system this would check ownership.
    """
    try:
        response = httpx.get(f"{TRANSACTIONS_API_URL}/{transaction_id}", timeout=5.0)
        if response.status_code == 200:
            return True
        return False
    except Exception as e:
        print(f"Error verifying transaction: {e}")
        # In a strict financial system, if we can't reach the service, we reject it.
        return False
