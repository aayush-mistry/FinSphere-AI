import React from 'react';

interface TargetInformationProps {
  targetDate: string;
  projectedCompletionDate: string | null;
  monthsRemaining: number;
}

export function TargetInformation({ targetDate, projectedCompletionDate, monthsRemaining }: TargetInformationProps) {
  const target = new Date(targetDate);
  const targetString = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  
  let projectedString = 'N/A';
  let diffString = '-';
  let diffColor = 'text-slate-500';

  if (projectedCompletionDate) {
    const projected = new Date(projectedCompletionDate);
    projectedString = projected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    const diffTime = target.getTime() - projected.getTime();
    const diffMonths = Math.round(diffTime / (1000 * 3600 * 24 * 30));

    if (diffMonths > 0) {
      diffString = `${diffMonths} month${diffMonths > 1 ? 's' : ''} early`;
      diffColor = 'text-emerald-600';
    } else if (diffMonths < 0) {
      const absDiff = Math.abs(diffMonths);
      diffString = `${absDiff} month${absDiff > 1 ? 's' : ''} late`;
      diffColor = 'text-rose-600';
    } else {
      diffString = 'On target date';
      diffColor = 'text-blue-600';
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
      <div className="pt-4 md:pt-0">
        <p className="text-sm font-semibold text-slate-500 mb-1">TARGET DATE</p>
        <p className="text-xl font-bold text-slate-900">{targetString}</p>
      </div>
      <div className="pt-4 md:pt-0 md:pl-6">
        <p className="text-sm font-semibold text-slate-500 mb-1">EXPECTED COMPLETION</p>
        <p className="text-xl font-bold text-slate-900">{projectedString}</p>
      </div>
      <div className="pt-4 md:pt-0 md:pl-6">
        <div className="flex justify-between md:block">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">TIME REMAINING</p>
            <p className="text-xl font-bold text-slate-900">{monthsRemaining} month{monthsRemaining !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right md:text-left md:mt-2">
            <p className="text-xs font-semibold text-slate-500 mb-0.5">EXPECTED</p>
            <p className={`text-sm font-bold ${diffColor}`}>{diffString}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
