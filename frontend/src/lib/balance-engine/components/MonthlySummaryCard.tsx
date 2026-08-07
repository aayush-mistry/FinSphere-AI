"use client";

import { useMonthlySummary } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";

export const MonthlySummaryCard = () => {
  const { data: summary, isLoading } = useMonthlySummary();

  if (isLoading || !summary) return <div className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-500" />
        </div>
        <span className="font-bold text-slate-900">Summary ({summary.month})</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Savings</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.savings)}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Avg Daily Spend</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.averageDailySpending)}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
        {summary.largestIncome && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Income
            </div>
            <span className="font-semibold text-slate-900">{summary.largestIncome.merchant} ({formatCurrency(summary.largestIncome.amount)})</span>
          </div>
        )}
        {summary.largestExpense && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingDown className="w-4 h-4 text-rose-500" /> Top Expense
            </div>
            <span className="font-semibold text-slate-900">{summary.largestExpense.merchant} ({formatCurrency(summary.largestExpense.amount)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
