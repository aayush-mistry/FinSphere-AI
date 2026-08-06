"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessMode } from "@/context/BusinessModeContext";
import { OverviewTab } from "./tabs/OverviewTab";
import { FinancialHealthTab } from "./tabs/FinancialHealthTab";
import { AIInsightsTab } from "./tabs/AIInsightsTab";
import { GoalTrackerTab } from "./tabs/GoalTrackerTab";
import { UpcomingBillsTab } from "./tabs/UpcomingBillsTab";
import { AIAlertsTab } from "./tabs/AIAlertsTab";

import type { DashboardSummary, PortfolioAllocation, Transaction } from "@/lib/types";

interface DashboardData {
  isLoading: boolean;
  error: Error | string | null;
  data: {
    summary: DashboardSummary;
    transactions: Transaction[];
    allocation: PortfolioAllocation[];
  } | null;
}

interface DashboardTabsProps {
  dashboardData: DashboardData;
}

export function DashboardTabs({ dashboardData }: DashboardTabsProps) {
  const { isBusinessMode } = useBusinessMode();

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="bg-slate-100/50 p-1 rounded-xl flex flex-wrap h-auto w-full justify-start overflow-x-auto custom-scrollbar">
        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
        {!isBusinessMode && <TabsTrigger value="financial-health" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Financial Health</TabsTrigger>}
        {!isBusinessMode && <TabsTrigger value="ai-insights" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Insights</TabsTrigger>}
        {!isBusinessMode && <TabsTrigger value="goal-tracker" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Goal Tracker</TabsTrigger>}
        {!isBusinessMode && <TabsTrigger value="upcoming-bills" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Upcoming Bills</TabsTrigger>}
        {!isBusinessMode && <TabsTrigger value="ai-alerts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Alerts</TabsTrigger>}
      </TabsList>

      <div className="min-h-[600px]">
        <TabsContent value="overview" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
          <OverviewTab isBusinessMode={isBusinessMode} dashboardData={dashboardData} />
        </TabsContent>
        
        {!isBusinessMode && (
          <>
            <TabsContent value="financial-health" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <FinancialHealthTab />
            </TabsContent>
            
            <TabsContent value="ai-insights" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <AIInsightsTab />
            </TabsContent>
            
            <TabsContent value="goal-tracker" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <GoalTrackerTab />
            </TabsContent>
            
            <TabsContent value="upcoming-bills" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <UpcomingBillsTab />
            </TabsContent>
            
            <TabsContent value="ai-alerts" className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <AIAlertsTab />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
}
