"use client";

import { GlobalRiskMetrics } from '@/lib/alert-engine/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AlertStatisticsProps {
  metrics: GlobalRiskMetrics;
}

export function AlertStatistics({ metrics }: AlertStatisticsProps) {
  const data = Object.entries(metrics.categoryDistribution)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: category.replace('_', ' ').toUpperCase(),
      value: count
    }));

  const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-64 flex items-center">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 pl-4">
        <h4 className="font-bold text-slate-900 text-sm mb-2">Alert Distribution</h4>
        <div className="space-y-1">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
