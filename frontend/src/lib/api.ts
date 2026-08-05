import type {
  DashboardSummary,
  FraudScanResult,
  PortfolioAllocation,
  SimulationPoint,
  SimulationRequest,
  Transaction,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboardSummary: () => requestJson<DashboardSummary>("/api/dashboard/summary"),
  getTransactions: (limit = 10) => requestJson<Transaction[]>(`/api/transactions?limit=${limit}`),
  getPortfolioAllocation: () => requestJson<PortfolioAllocation[]>("/api/portfolio/allocation"),
  runSimulation: (payload: SimulationRequest) =>
    requestJson<SimulationPoint[]>("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  scanFraudDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return requestJson<FraudScanResult>("/api/fraud/scan", {
      method: "POST",
      body: formData,
    });
  },
  calculateFinancialHealth: (profile: any) =>
    requestJson<any>("/api/financial-health/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }),
  chatUrl: `${API_BASE_URL}/api/chat`,
};
