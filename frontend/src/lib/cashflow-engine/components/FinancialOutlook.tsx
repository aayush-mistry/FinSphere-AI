"use client";

import { useState } from "react";
import { useCashFlowProjection } from "../hooks/useCashFlow";
import { CashFlowProjection, CashFlowEvent } from "../types";
import { PrivacyMask, usePrivacyMode } from "@/lib/privacy";
import { formatCurrency } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Info
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FinancialOutlook({ userId }: { userId: number }) {
  const { isPrivacyMode } = usePrivacyMode();
  const [horizon, setHorizon] = useState<number>(30); // 7, 30, 60, 90
  const { data, isLoading: loading, error, refetch } = useCashFlowProjection(userId, horizon);

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 mb-3 opacity-80" />
        <h3 className="font-semibold text-rose-900 mb-1">Financial outlook unavailable</h3>
        <p className="text-sm text-rose-700 opacity-90">{(error as Error).message || 'Failed to fetch projection.'}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 opacity-50" />
        <p className="font-medium animate-pulse">Calculating your financial outlook...</p>
      </div>
    );
  }

  if (!data) return null; // Fallback

  const projectedChange = data.ending_cash - data.starting_cash;
  const isPositiveChange = projectedChange >= 0;

  // Formatting chart data
  const chartData = data.timeline.map(pt => ({
    dateStr: pt.date,
    displayDate: format(parseISO(pt.date), "MMM d"),
    balance: pt.balance,
    events: pt.events,
    isCurrent: pt.date === data.reference_date
  }));

  // Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xl min-w-[220px]">
          <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {point.displayDate}
          </p>
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Projected Cash</span>
            <span className={`font-bold ${point.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(point.balance)} />
            </span>
          </div>
          {point.events && point.events.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Events</p>
              {point.events.map((e: CashFlowEvent, i: number) => (
                <div key={i} className="flex justify-between text-sm items-center gap-4">
                  <span className="text-slate-700 truncate font-medium">{e.description}</span>
                  <span className={`font-semibold ${e.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {e.amount > 0 ? '+' : ''}<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(e.amount))} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Identify next event
  const futureEvents = data.events.filter(e => e.date > data.reference_date);
  const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;
  const billEvents = data.events.filter(e => e.type === 'BILL');

  // Compute Major Drivers
  const totalOutflows = data.projected_expenses + data.projected_bills;
  const billPct = totalOutflows > 0 ? Math.round((data.projected_bills / totalOutflows) * 100) : 0;
  const expensePct = totalOutflows > 0 ? Math.round((data.projected_expenses / totalOutflows) * 100) : 0;

  return (
    <div className={`space-y-6 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100 transition-opacity duration-300'}`}>
      
      {/* Top Header & Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Outlook</h2>
          <p className="text-slate-500 text-sm mt-1">Cash flow projection based on your historical behavior and future obligations.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Select value={horizon.toString()} onValueChange={(v) => setHorizon(parseInt(v))}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Select Horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days Outlook</SelectItem>
              <SelectItem value="30">30 Days Outlook</SelectItem>
              <SelectItem value="60">60 Days Outlook</SelectItem>
              <SelectItem value="90">90 Days Outlook</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Primary Alerts & Insights */}
      {data.cash_shortfall ? (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
          <AlertCircle className="h-5 w-5 !text-rose-600" />
          <AlertTitle className="text-rose-800 font-bold">Projected cash shortfall</AlertTitle>
          <AlertDescription className="text-rose-700 mt-1">
            Your projected cash position falls below zero on <strong>{format(parseISO(data.shortfall_date!), 'MMMM d')}</strong>. 
            <br />
            Projected shortfall: <strong><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.shortfall_amount || 0)} /></strong>.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 !text-emerald-600" />
          <AlertTitle className="text-emerald-800 font-bold">Stable Outlook</AlertTitle>
          <AlertDescription className="text-emerald-700 mt-1">
            Your projected cash position remains positive throughout this period.
            {isPositiveChange ? ` It increases by ` : ` It decreases by `}
            <strong><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(projectedChange))} /></strong> over the next {horizon} days.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Primary Outlook Card */}
        <Card className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-indigo-100 text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Current Cash
            </CardTitle>
            <div className="text-3xl font-bold tracking-tight">
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.starting_cash)} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-4 pb-6 border-t border-indigo-500/30 mt-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Projected Cash</p>
                <div className="text-2xl font-bold">
                  <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.ending_cash)} />
                </div>
              </div>
              <div className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${isPositiveChange ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'}`}>
                {isPositiveChange ? '+' : '-'}<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(projectedChange))} />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-200 flex items-center gap-1.5"><ArrowDownToLine className="w-3.5 h-3.5"/> Lowest Point</span>
                <span className="font-semibold text-white">
                  <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.minimum_projected_cash)} />
                </span>
              </div>
              {data.minimum_cash_date && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200">Date of lowest point</span>
                  <span className="font-semibold text-white">{format(parseISO(data.minimum_cash_date), 'MMM d')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Flow Breakdown */}
        <Card className="md:col-span-4 bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base text-slate-800">Financial Flow Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-600 font-medium">Starting Cash</span>
              <span className="font-bold text-slate-900"><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.starting_cash)} /></span>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5"/> Expected Income
              </span>
              <span className="font-bold text-emerald-700">
                {data.income_projection_available ? (
                  <>+<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.projected_income)} /></>
                ) : (
                  <span className="text-slate-400 text-xs font-normal">Unavailable</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-amber-600 font-medium flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5"/> Expected Spending
              </span>
              <span className="font-bold text-amber-700">
                -<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.projected_expenses)} />
              </span>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-rose-600 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5"/> Upcoming Bills
              </span>
              <span className="font-bold text-rose-700">
                -<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.projected_bills)} />
              </span>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between text-base items-center">
              <span className="text-slate-800 font-bold">Ending Cash</span>
              <span className="font-bold text-indigo-700">
                <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.ending_cash)} />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Drivers & Next Event */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <Card className="bg-white border-slate-200 shadow-sm flex-1">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base text-slate-800">Major Cash Flow Drivers</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {totalOutflows > 0 ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">Upcoming Bills</span>
                      <span className="font-bold text-slate-900"><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.projected_bills)} /></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${billPct}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{billPct}% of projected outflows</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">Normal Spending</span>
                      <span className="font-bold text-slate-900"><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(data.projected_expenses)} /></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${expensePct}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{expensePct}% of projected outflows</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 text-sm py-4">
                  No projected outflows for this period.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <CardContent className="p-4">
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Next Financial Event</p>
              {nextEvent ? (
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${nextEvent.amount < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {nextEvent.amount < 0 ? <Calendar className="w-5 h-5"/> : <ArrowUpFromLine className="w-5 h-5"/>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{nextEvent.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-sm">
                      <span className={`font-semibold ${nextEvent.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {nextEvent.amount > 0 ? '+' : ''}<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(nextEvent.amount))} />
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">{format(parseISO(nextEvent.date), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                  <Info className="w-4 h-4" /> No events scheduled in this outlook.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projection Chart */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-slate-800">Projection Timeline</CardTitle>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Projected</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  minTickGap={40}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  tickFormatter={(value) => isPrivacyMode ? '****' : `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorProjected)" 
                  activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                />
                
                {/* Highlight event points */}
                {chartData.map((pt, index) => {
                  if (pt.events && pt.events.length > 0) {
                    return (
                      <ReferenceDot 
                        key={index} 
                        x={pt.displayDate} 
                        y={pt.balance} 
                        r={4.5} 
                        fill={pt.balance < 0 ? "#ef4444" : "#4f46e5"}
                        stroke="#fff" 
                        strokeWidth={2} 
                      />
                    );
                  }
                  if (pt.isCurrent) {
                    return (
                       <ReferenceDot 
                        key={index} 
                        x={pt.displayDate} 
                        y={pt.balance} 
                        r={6} 
                        fill="#64748b"
                        stroke="#fff" 
                        strokeWidth={2} 
                      />
                    )
                  }
                  return null;
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Bills List */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base text-slate-800 flex items-center justify-between">
            <span>Upcoming Bills Integrated</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">{billEvents.length} events</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {billEvents.length > 0 ? (
             <div className="divide-y divide-slate-100">
                {billEvents.map((bill, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{bill.description}</p>
                        <p className="text-xs text-slate-500 font-medium">Due {format(parseISO(bill.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(bill.amount))} />
                    </div>
                  </div>
                ))}
             </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No upcoming bills in this period.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
