"use client";

import { useCallback } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";

export default function Dashboard() {
  const loadDashboardData = useCallback(
    () =>
      Promise.all([
        api.getDashboardSummary(),
        api.getTransactions(6),
        api.getPortfolioAllocation(),
      ]).then(([summary, transactions, allocation]) => ({ summary, transactions, allocation })),
    []
  );
  
  const dashboardData = useAsyncData(loadDashboardData);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      
      {dashboardData.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Unable to refresh dashboard data. {dashboardData.error}
        </div>
      )}

      <DashboardTabs dashboardData={dashboardData} />
    </div>
  );
}
