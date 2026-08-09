import React from 'react';
import { ComparisonResultData } from '../../../types';
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface SimulatorImpactCardsProps {
  comparison: ComparisonResultData | null;
}

export function SimulatorImpactCards({ comparison }: SimulatorImpactCardsProps) {
  if (!comparison) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-100 mb-3 animate-pulse"></div>
            <div className="w-16 h-3 bg-slate-100 rounded mb-2 animate-pulse"></div>
            <div className="w-24 h-5 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // Card 1: Time Impact
  let timeImpactColor = 'text-slate-900';
  let timeImpactIcon = <Clock className="w-5 h-5 text-slate-500" />;
  let timeImpactValue = 'No Change';
  let timeImpactLabel = 'Timeline Shift';

  if (comparison.months_saved > 0) {
    timeImpactColor = 'text-emerald-600';
    timeImpactIcon = <TrendingUp className="w-5 h-5 text-emerald-500" />;
    timeImpactValue = `${comparison.months_saved} mos earlier`;
  } else if (comparison.months_lost > 0) {
    timeImpactColor = 'text-rose-600';
    timeImpactIcon = <TrendingDown className="w-5 h-5 text-rose-500" />;
    timeImpactValue = `${comparison.months_lost} mos later`;
  }

  // Card 2: Status
  let statusColor = 'text-blue-600';
  let statusIcon = <CheckCircle className="w-5 h-5 text-blue-500" />;
  if (comparison.status === 'Behind') {
    statusColor = 'text-rose-600';
    statusIcon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
  } else if (comparison.status === 'Ahead') {
    statusColor = 'text-emerald-600';
    statusIcon = <TrendingUp className="w-5 h-5 text-emerald-500" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Time Impact */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-slate-50">
            {timeImpactIcon}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{timeImpactLabel}</p>
        </div>
        <p className={`text-xl font-bold ${timeImpactColor} mt-2`}>{timeImpactValue}</p>
      </div>

      {/* Target Status */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-slate-50">
            {statusIcon}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Status</p>
        </div>
        <p className={`text-xl font-bold ${statusColor} mt-2`}>{comparison.status}</p>
      </div>
    </div>
  );
}
