"use client";

import { CashFlowPoint } from '@/lib/bill-engine/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface CashFlowForecastProps {
  data: CashFlowPoint[];
}

// Custom tooltip pulled out of render
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as CashFlowPoint;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[200px]">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        <p className="text-sm text-slate-600 mb-2">
          Projected Balance: <span className="font-bold text-slate-900">{formatCurrency(point.projectedBalance)}</span>
        </p>
        {point.events.length > 0 && (
          <div className="border-t border-slate-100 pt-2 mt-2">
            <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Events</p>
            {point.events.map((e, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span className="text-slate-600 truncate max-w-[120px]">{e.name}</span>
                <span className={`font-medium ${e.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {e.amount > 0 ? '+' : ''}{formatCurrency(e.amount)}
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

// Custom Dot pulled out of render
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const hasEvents = payload.events && payload.events.length > 0;
  if (hasEvents) {
    return (
      <circle cx={cx} cy={cy} r={4} fill="#6366f1" stroke="white" strokeWidth={2} />
    );
  }
  return <svg />;
};

export function CashFlowForecast({ data }: CashFlowForecastProps) {
  return (
    <div className="w-full h-80 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-slate-900 text-lg">30-Day Cash Flow Forecast</h3>
        <p className="text-sm text-slate-500">Projected account balance based on upcoming bills and income.</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={40}
          />
          <YAxis 
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Zero Balance', fill: '#ef4444', fontSize: 10 }} />
          <Line 
            type="stepAfter" 
            dataKey="projectedBalance" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#4f46e5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
