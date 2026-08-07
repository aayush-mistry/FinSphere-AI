"use client";

import { BalanceCard } from "@/lib/balance-engine/components/BalanceCard";
import { NetWorthCard } from "@/lib/balance-engine/components/NetWorthCard";
import { CashFlowCard } from "@/lib/balance-engine/components/CashFlowCard";
import { AccountOverview } from "@/lib/balance-engine/components/AccountOverview";
import { RecentTransactions } from "@/lib/balance-engine/components/RecentTransactions";
import { MonthlySummaryCard } from "@/lib/balance-engine/components/MonthlySummaryCard";

export default function BalanceWorkspace() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Balance Workspace</h1>
        <p className="text-slate-500">Your core financial foundation.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BalanceCard />
        <NetWorthCard />
        <CashFlowCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AccountOverview />
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <MonthlySummaryCard />
        </div>
      </div>
    </div>
  );
}
