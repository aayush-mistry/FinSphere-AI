import React from 'react';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { GoalDetailOut, GoalProjectionOut } from '../../types';

interface FinancialInsightProps {
  goal: GoalDetailOut;
  projection: GoalProjectionOut;
}

export function FinancialInsight({ goal, projection }: FinancialInsightProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const pacingDiff = goal.planned_monthly_contribution - goal.required_monthly_contribution;
  
  // Construct insight sentence
  const currentStr = formatCurrency(goal.current_amount);
  const targetStr = formatCurrency(goal.target_amount);
  const plannedStr = formatCurrency(goal.planned_monthly_contribution);
  const requiredStr = formatCurrency(goal.required_monthly_contribution);
  const diffStr = formatCurrency(Math.abs(pacingDiff));
  
  const pacingSentence = pacingDiff > 0 
    ? `Your planned monthly contribution of ${plannedStr} is ${diffStr} above the required monthly contribution of ${requiredStr}.`
    : pacingDiff < 0
      ? `Your planned monthly contribution of ${plannedStr} is ${diffStr} below the required monthly contribution of ${requiredStr}.`
      : `Your planned monthly contribution of ${plannedStr} perfectly matches the required pace.`;

  let timelineSentence = "There is not enough historical contribution data to produce a reliable timeline projection yet.";
  if (projection.projection_available && projection.projected_completion_date && goal.status !== 'Completed') {
    const projDate = new Date(projection.projected_completion_date);
    const targetDate = new Date(goal.target_date);
    const diffTime = targetDate.getTime() - projDate.getTime();
    const diffMonths = Math.round(diffTime / (1000 * 3600 * 24 * 30));
    
    if (diffMonths > 0) {
      timelineSentence = `Based on the current projection, you are expected to reach the goal ${diffMonths} month${diffMonths > 1 ? 's' : ''} before your target date.`;
    } else if (diffMonths < 0) {
      const absDiff = Math.abs(diffMonths);
      timelineSentence = `Based on the current projection, you are expected to reach the goal ${absDiff} month${absDiff > 1 ? 's' : ''} after your target date.`;
    } else {
      timelineSentence = "Based on the current projection, you are exactly on track to reach the goal on your target date.";
    }
  } else if (goal.status === 'Completed') {
    timelineSentence = "Congratulations, you have already reached this goal!";
  }

  // Confidence colors
  let confColor = 'bg-slate-100 text-slate-700';
  if (projection.confidence === 'high') confColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (projection.confidence === 'medium') confColor = 'bg-amber-50 text-amber-700 border border-amber-200';
  if (projection.confidence === 'low') confColor = 'bg-rose-50 text-rose-700 border border-rose-200';

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Financial Insight</h3>
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
        <p className="text-indigo-900 leading-relaxed mb-4">
          <PrivacyMask 
            isPrivacyMode={isPrivacyMode} 
            value={`You have saved ${currentStr} of your ${targetStr} target. ${pacingSentence} ${timelineSentence}`}
            mask="Insight hidden in privacy mode."
          />
        </p>

        {projection.projection_available && projection.confidence && (
          <div className="bg-white/60 rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-slate-600">Projection Confidence:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${confColor}`}>
                {projection.confidence}
              </span>
            </div>
            {projection.confidence_reason && (
              <p className="text-sm text-slate-600">
                {projection.confidence_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
