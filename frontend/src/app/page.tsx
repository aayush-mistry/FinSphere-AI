"use client";

import { useCallback, useMemo } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";
import { 
  ArrowUpIcon, Activity, Wallet, PieChart as PieChartIcon, 
  ShoppingCart, Coffee, Film, Car, Zap, Package, DollarSign, Home, CheckCircle2, ShieldAlert,
  FileText, Users, Banknote
} from "lucide-react";
import FraudIntelligenceCenter from "@/components/FraudIntelligenceCenter";
import { useBusinessMode } from "@/context/BusinessModeContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { PortfolioAllocation, Transaction } from "@/lib/types";

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
  name?: string;
};

export default function Dashboard() {
  const { isBusinessMode } = useBusinessMode();
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
  
  // Color palette for the charts (emerald / navy aesthetic)
  const COLORS = useMemo(() => ["#059669", "#1e3a8a", "#10b981", "#3b82f6"], []);

  const summary = dashboardData.data?.summary ?? {
    totalNetWorth: 0,
    monthlyCashFlow: 0,
    financialHealthScore: 0,
  };
  const transactions = dashboardData.data?.transactions ?? [];
  const allocation = dashboardData.data?.allocation ?? [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Groceries": return <ShoppingCart className="h-4 w-4 text-emerald-600" />;
      case "Dining": return <Coffee className="h-4 w-4 text-orange-500" />;
      case "Entertainment": return <Film className="h-4 w-4 text-purple-500" />;
      case "Transport": return <Car className="h-4 w-4 text-blue-500" />;
      case "Utilities": return <Zap className="h-4 w-4 text-yellow-500" />;
      case "Shopping": return <Package className="h-4 w-4 text-pink-500" />;
      case "Salary": return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "Rent": return <Home className="h-4 w-4 text-indigo-500" />;
      default: return <Wallet className="h-4 w-4 text-slate-500" />;
    }
  };

  const agents = [
    { name: "Financial Advisor", status: "Active", active: true },
    { name: "Tax Optimizer", status: "Active", active: true },
    { name: "Fraud Investigator", status: "Standby", active: false }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: PieLabelProps) => {
    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = COLORS[(index ?? 0) % COLORS.length];

    return (
      <text x={x} y={y} fill={color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
        {`${name ?? "Item"} ${((percent || 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      {dashboardData.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Unable to refresh dashboard data. {dashboardData.error}
        </div>
      )}
      
      {isBusinessMode ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-100 shadow-sm bg-white border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Invoices</CardTitle>
              <FileText className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">$45,200.00</div>
              <p className="text-xs text-amber-600 flex items-center mt-1">
                3 invoices overdue
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm bg-white border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Payroll Summary (Month)</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">$112,450.00</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                Due in 5 days
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm bg-white border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Cash Flow Runway</CardTitle>
              <Banknote className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">8.5 <span className="text-sm text-slate-400 font-normal">Months</span></div>
              <p className="text-xs text-slate-500 mt-1">Based on avg burn rate of $42k/mo</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Net Worth</CardTitle>
              <Wallet className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(summary.totalNetWorth)}
              </div>
              <p className="text-xs text-emerald-600 flex items-center mt-1">
                <ArrowUpIcon className="mr-1 h-3 w-3" /> +2.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Monthly Cash Flow</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(summary.monthlyCashFlow)}
              </div>
              <p className="text-xs text-emerald-600 flex items-center mt-1">
                <ArrowUpIcon className="mr-1 h-3 w-3" /> Healthy positive flow
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Financial Health Score</CardTitle>
              <PieChartIcon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {summary.financialHealthScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Excellent standing</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 2. Spending Donut Chart / Portfolio */}
        <Card className="col-span-4 border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Portfolio Allocation</CardTitle>
            <CardDescription>Your current investment distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {dashboardData.isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
            ) : allocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart data={allocation}>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {allocation.map((entry: PortfolioAllocation, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 flex items-center justify-center h-full">No allocation data available.</div>
            )}
          </CardContent>
        </Card>

        {/* 3 & 4. Recent Transactions & Agents */}
        <div className="col-span-3 space-y-4">
          
          {/* Active AI Agents Widget */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 text-base">Active AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      {agent.active ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700">{agent.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${agent.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Table */}
          <Card className="border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  ))
                ) : transactions.length > 0 ? transactions.map((t: Transaction) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 rounded-full">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t.category}</p>
                        <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-400 text-center py-4">No recent transactions yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Row 3: Fraud Intelligence Center */}
        <div className="col-span-4 lg:col-span-7">
          <FraudIntelligenceCenter />
        </div>

      </div>
    </div>
  );
}
