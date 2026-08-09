import httpx
import os

CASHFLOW_API_URL = os.getenv("CASHFLOW_API_URL", "http://localhost:3000/api/cashflow/trends")

def get_average_monthly_cashflow() -> float:
    """
    Fetches the historical cash flow data from the Cash Flow API
    and calculates the average monthly net cash flow.
    """
    try:
        response = httpx.get(f"{CASHFLOW_API_URL}?period=MONTHLY", timeout=5.0)
        response.raise_for_status()
        data = response.json()
        
        data_points = data.get("dataPoints", [])
        if not data_points:
            return 0.0
            
        total_net_cashflow = sum(dp.get("netCashFlow", 0.0) for dp in data_points)
        return total_net_cashflow / len(data_points)
    except Exception as e:
        print(f"Error fetching cashflow: {e}")
        return 0.0
