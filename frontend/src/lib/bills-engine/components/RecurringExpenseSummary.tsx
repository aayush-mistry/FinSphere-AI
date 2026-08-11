"use client";

import { useEffect, useState } from "react";
import { BillsClientAPI } from "../services/client-api";
import { RecurringSummaryResponse } from "../types";
import { PrivacyMask, usePrivacyMode } from "@/lib/privacy";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function RecurringExpenseSummary({ userId }: { userId: number }) {
  const { isPrivacyMode } = usePrivacyMode();
  const [data, setData] = useState<RecurringSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    BillsClientAPI.getRecurringExpenseSummary(userId)
      .then(res => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading recurring analysis...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load recurring summary: {error}
      </div>
    );
  }

  // Insight Generation
  let insightText = "";
  if (data.active_bill_count === 0) {
    insightText = "You currently have no active recurring bills recorded.";
  } else if (!data.income_available) {
    insightText = "Income data is unavailable, so recurring obligations cannot be compared against income.";
  } else {
    insightText = `Recurring bills consume ${data.recurring_expense_ratio.toFixed(1)}% of your current monthly income.`;
  }

  const chartData = data.categories.map((c, i) => ({
    name: c.category,
    value: c.monthly_amount,
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      
      {/* Dynamic Insight */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Insight</h3>
        <p className="text-slate-800">{insightText}</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Monthly Recurring" 
          value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.monthly_recurring)} />} 
        />
        <MetricCard 
          title="Annual Commitment" 
          value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.annual_recurring)} />} 
        />
        <MetricCard 
          title="Active Recurring Bills" 
          value={data.active_bill_count} 
        />
        {data.income_available && (
          <MetricCard 
            title="Recurring / Income Ratio" 
            value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={`${data.recurring_expense_ratio.toFixed(1)}%`} />} 
          />
        )}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Visualization */}
        {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-1 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Category Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => isPrivacyMode ? '••••' : formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bill Details Table */}
        <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${chartData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Recurring Obligations</h3>
          
          {data.bills.length === 0 ? (
            <div className="text-slate-500 py-4 text-center border-t border-slate-100 border-dashed">
              No active bills to display.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Bill</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3 text-right">Original Amount</th>
                    <th className="px-4 py-3 text-right">Monthly Eq.</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Annual Eq.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bills.map((bill) => (
                    <tr key={bill.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{bill.name}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{bill.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{bill.frequency}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(bill.amount)} />
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-600 font-medium">
                        <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(bill.monthly_equivalent)} />
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(bill.annual_equivalent)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
      <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
