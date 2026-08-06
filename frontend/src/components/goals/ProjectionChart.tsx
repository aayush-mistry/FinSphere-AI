"use client";

import { ScenarioPoint } from '@/lib/goal-engine/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface ProjectionChartProps {
  data: ScenarioPoint[];
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), undefined]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            name="Expected"
            dataKey="expectedValue" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={false}
          />
          <Line 
            type="monotone" 
            name="Best Case"
            dataKey="bestCaseValue" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line 
            type="monotone" 
            name="Worst Case"
            dataKey="worstCaseValue" 
            stroke="#f43f5e" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line 
            type="monotone" 
            name="Target (Inflation Adj)"
            dataKey="inflationAdjustedTarget" 
            stroke="#cbd5e1" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
