"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, Briefcase, TrendingUp } from 'lucide-react';
import { api } from "@/lib/api";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { SimulationPoint } from "@/lib/types";

type TooltipValue = number | string | readonly (number | string)[] | undefined;

export default function DigitalTwinPage() {
  const [netWorth, setNetWorth] = useState(100000);
  const [houseCost, setHouseCost] = useState(400000);
  const [downpayment, setDownpayment] = useState(80000);
  const [loanRate, setLoanRate] = useState(6.5);
  const [jobLossMonths, setJobLossMonths] = useState(0);
  
  const [data, setData] = useState<SimulationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimulation = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.runSimulation({
          net_worth: netWorth,
          house_cost: houseCost,
          downpayment,
          loan_rate: loanRate,
          job_loss_months: jobLossMonths,
        });
        setData(result);
      } catch (simulationError: unknown) {
        setError(simulationError instanceof Error ? simulationError.message : "Unable to run simulation.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly to prevent spamming the backend
    const timeout = setTimeout(fetchSimulation, 300);
    return () => clearTimeout(timeout);
  }, [netWorth, houseCost, downpayment, loanRate, jobLossMonths]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <TrendingUp size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Digital Twin Simulator</h1>
          <p className="text-slate-500">Project your wealth over 10 years by simulating life events.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 h-fit">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <Home className="text-blue-500" /> Life Events
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>Current Net Worth</span>
                <span className="text-blue-600">{formatCurrency(netWorth)}</span>
              </label>
              <input type="range" min="10000" max="500000" step="5000" value={netWorth} onChange={(e) => setNetWorth(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>Buy a House (Cost)</span>
                <span className="text-blue-600">{formatCurrency(houseCost)}</span>
              </label>
              <input type="range" min="100000" max="2000000" step="25000" value={houseCost} onChange={(e) => setHouseCost(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>Downpayment</span>
                <span className="text-blue-600">{formatCurrency(downpayment)}</span>
              </label>
              <input type="range" min="0" max={houseCost} step="5000" value={downpayment} onChange={(e) => setDownpayment(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>Loan Rate (%)</span>
                <span className="text-blue-600">{loanRate}%</span>
              </label>
              <input type="range" min="1" max="15" step="0.1" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 mb-4">
                <Briefcase className="text-red-500" /> Risk Factors
              </h2>
              <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>Lose Job (Months)</span>
                <span className="text-red-600">{jobLossMonths} Months</span>
              </label>
              <input type="range" min="0" max="24" step="1" value={jobLossMonths} onChange={(e) => setJobLossMonths(Number(e.target.value))} className="w-full accent-red-600" />
            </div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">120-Month Wealth Projection</h2>
          <div className="flex-1 min-h-[400px]">
            {loading && data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(value) => formatCompactCurrency(Number(value))}
                    tick={{ fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: TooltipValue) => [typeof value === "number" ? formatCurrency(value) : "", ""]}
                    labelFormatter={(label) => `Month ${label}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    name="Baseline (No events)" 
                    dataKey="baseline" 
                    stroke="#94a3b8" 
                    strokeWidth={3} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    name="Simulated Trajectory" 
                    dataKey="simulated" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    dot={false}
                    activeDot={{ r: 8, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
