import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { MonthlyProjectionPoint } from '../../types';

interface ProjectionChartProps {
  data: MonthlyProjectionPoint[];
  targetAmount: number;
  targetDate: string;
}

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    const projectedAmount = payload[0].value;
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-indigo-600 font-bold">
          {isPrivacyMode ? <span className="font-mono text-slate-400 blur-[4px] select-none">••••••</span> : formatCurrency(projectedAmount)}
        </p>
      </div>
    );
  }
  return null;
};

export function ProjectionChart({ data, targetAmount, targetDate }: ProjectionChartProps) {
  const { isPrivacyMode } = usePrivacyMode();

  const chartData = data.map(point => {
    const d = new Date(point.projected_date);
    return {
      dateString: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      timestamp: d.getTime(),
      amount: point.projected_amount
    };
  });

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
              stroke="#4f46e5" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
