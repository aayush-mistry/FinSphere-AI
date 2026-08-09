import React from 'react';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { GoalContributionOut } from '../../types';

interface ContributionHistoryProps {
  contributions: GoalContributionOut[];
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  const { isPrivacyMode } = usePrivacyMode();

  if (!contributions || contributions.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Contribution History</h3>
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center">
          <p className="text-slate-500">No contribution history available yet.</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalContributions = contributions.length;
  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
  const averageAmount = totalContributions > 0 ? totalAmount / totalContributions : 0;
  const sortedContributions = [...contributions].sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime());
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Contribution History</h3>
      
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Contributions</p>
            <p className="text-xl font-bold text-slate-900">{totalContributions}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-slate-900">
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(totalAmount)} />
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Average</p>
            <p className="text-xl font-bold text-slate-900">
              <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(averageAmount)} />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="divide-y divide-slate-100">
          {sortedContributions.map((contrib) => {
            const date = new Date(contrib.contribution_date);
            return (
              <div key={contrib.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="font-bold text-emerald-600">
                  <PrivacyMask isPrivacyMode={isPrivacyMode} value={`+${formatCurrency(contrib.amount)}`} mask="+•••" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
