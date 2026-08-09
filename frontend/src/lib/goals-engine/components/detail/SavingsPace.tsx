import React from 'react';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';

interface SavingsPaceProps {
  required: number;
  planned: number;
}

export function SavingsPace({ required, planned }: SavingsPaceProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const difference = planned - required;
  
  let diffColor = 'text-slate-600';
  let sign = '';
  
  if (difference > 0) {
    diffColor = 'text-emerald-600';
    sign = '+';
  } else if (difference < 0) {
    diffColor = 'text-rose-600';
    sign = '-';
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Savings Pace</h3>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Required</p>
            <p className="text-xl font-bold text-slate-900">
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={`${formatCurrency(required)}/mo`} />
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Planned</p>
            <p className="text-xl font-bold text-slate-900">
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={`${formatCurrency(planned)}/mo`} />
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Difference</p>
            <p className={`text-xl font-bold ${diffColor}`}>
              <PrivacyMask 
                isPrivacyMode={isPrivacyMode} 
                value={`${sign}${formatCurrency(Math.abs(difference))}/mo`} 
                mask="•••/mo"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
