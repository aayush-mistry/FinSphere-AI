import React from 'react';
import { BaselineComparisonData, SimulationComparisonData } from '../../../types';

interface SimulatorComparisonProps {
  baseline: BaselineComparisonData;
  simulation: SimulationComparisonData | null;
}

export function SimulatorComparison({ baseline, simulation }: SimulatorComparisonProps) {
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-full">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline</th>
            <th className="px-6 py-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">Simulated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="px-6 py-4 text-sm font-semibold text-slate-700">Completion Date</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatDate(baseline.completion_date)}</td>
            <td className="px-6 py-4 text-sm font-bold text-indigo-700 bg-indigo-50/30">
              {simulation ? formatDate(simulation.completion_date) : '-'}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 text-sm font-semibold text-slate-700">Time Remaining</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-900">{baseline.months} mos</td>
            <td className="px-6 py-4 text-sm font-bold text-indigo-700 bg-indigo-50/30">
              {simulation ? `${simulation.months} mos` : '-'}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 text-sm font-semibold text-slate-700">Target Status</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-900">{baseline.target_status}</td>
            <td className="px-6 py-4 text-sm font-bold text-indigo-700 bg-indigo-50/30">
              {simulation ? simulation.target_status : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
