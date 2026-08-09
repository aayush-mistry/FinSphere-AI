import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { MonthlyProjectionPoint } from '../../types';

interface ProjectionChartProps {
  data: MonthlyProjectionPoint[];
  simulatedData?: MonthlyProjectionPoint[];
  targetAmount: number;
  targetDate: string;
}

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
        <p className="text-sm font-semibold text-slate-500 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name === 'amount' ? 'Current' : 'Simulated'}
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {isPrivacyMode ? <span className="font-mono text-slate-400 blur-[4px] select-none">••••••</span> : formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ProjectionChart({ data, simulatedData, targetAmount, targetDate }: ProjectionChartProps) {
  const { isPrivacyMode } = usePrivacyMode();

  // We need to merge data and simulatedData by date for Recharts
  const mergedDataMap = new Map<number, any>();
  
  data.forEach(point => {
    const d = new Date(point.projected_date);
    const ts = d.getTime();
    mergedDataMap.set(ts, {
      dateString: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      timestamp: ts,
      amount: point.projected_amount
    });
  });

  if (simulatedData) {
    simulatedData.forEach(point => {
      const d = new Date(point.projected_date);
      const ts = d.getTime();
      if (mergedDataMap.has(ts)) {
        mergedDataMap.get(ts).simulatedAmount = point.projected_amount;
      } else {
        mergedDataMap.set(ts, {
          dateString: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
          timestamp: ts,
          simulatedAmount: point.projected_amount
        });
      }
    });
  }

  const chartData = Array.from(mergedDataMap.values()).sort((a, b) => a.timestamp - b.timestamp);

  if (chartData.length === 0) return null;

  const targetDateObj = new Date(targetDate);
  const targetDateString = targetDateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });

  // Extend X axis slightly to ensure the target reference line is clearly visible
  // But we let Recharts handle the domain dynamically if possible.

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Goal Projection</h3>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="dateString" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => isPrivacyMode ? '•••' : `₹${(value / 1000)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip isPrivacyMode={isPrivacyMode} />} />
            
            <ReferenceLine 
              y={targetAmount} 
              stroke="#cbd5e1" 
              strokeDasharray="3 3"
              label={{ position: 'top', value: 'Target', fill: '#64748b', fontSize: 12 }}
            />

            <Line 
              type="monotone" 
              dataKey="amount" 
              name="amount"
              stroke="#cbd5e1" 
              strokeWidth={simulatedData ? 2 : 3}
              strokeDasharray={simulatedData ? "4 4" : undefined}
              dot={!simulatedData ? { r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' } : false}
              activeDot={{ r: 6, fill: '#cbd5e1', strokeWidth: 2, stroke: '#fff' }}
            />

            {simulatedData && (
              <Line 
                type="monotone" 
                dataKey="simulatedAmount"
                name="simulatedAmount" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
