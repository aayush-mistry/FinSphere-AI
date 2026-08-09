import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { GoalDetailOut, GoalComparisonItem } from '../types';

interface GoalCardProps {
  goal: GoalDetailOut;
  prediction?: GoalComparisonItem;
}

export function GoalCard({ goal, prediction }: GoalCardProps) {
  const { isPrivacyMode } = usePrivacyMode();
  
  // Progress bounded at 100%
  const progressPercent = Math.min(Math.max(goal.progress, 0), 100);
  
  // Status visual mapping
  let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
  let StatusIcon = Target;
  
  if (goal.status === "Completed") {
    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    StatusIcon = CheckCircle2;
  } else if (goal.status === "On Track") {
    statusColor = "bg-blue-50 text-blue-700 border-blue-200";
    StatusIcon = TrendingUp;
  } else if (goal.status === "At Risk" || goal.status === "Overdue") {
    statusColor = "bg-rose-50 text-rose-700 border-rose-200";
    StatusIcon = AlertTriangle;
  }

  // Pacing Calculation
  const pacingDiff = goal.planned_monthly_contribution - goal.required_monthly_contribution;
  let pacingText = "Exactly on pace";
  let pacingColor = "text-slate-500";
  
  if (pacingDiff > 0) {
    pacingText = `${formatCurrency(pacingDiff)}/mo above required pace`;
    pacingColor = "text-emerald-600";
  } else if (pacingDiff < 0) {
    pacingText = `${formatCurrency(Math.abs(pacingDiff))}/mo below required pace`;
    pacingColor = "text-rose-600";
  }

  // Projection sentence
  let projectionSentence = null;
  if (prediction && prediction.projected_completion_date && goal.status !== 'Completed') {
    const projDate = new Date(prediction.projected_completion_date);
    const targetDate = new Date(goal.target_date);
    
    // Simple month difference approximation
    const diffTime = targetDate.getTime() - projDate.getTime();
    const diffMonths = Math.round(diffTime / (1000 * 3600 * 24 * 30));
    
    if (diffMonths > 0) {
      projectionSentence = `Projected to reach goal ${diffMonths} month${diffMonths > 1 ? 's' : ''} before your target date.`;
    } else if (diffMonths < 0) {
      projectionSentence = `Projected to reach goal ${Math.abs(diffMonths)} month${Math.abs(diffMonths) > 1 ? 's' : ''} after your target date.`;
    } else {
      projectionSentence = "Projected to reach goal right on your target date.";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{goal.name}</h3>
          <p className="text-sm text-slate-500">{goal.category}</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusColor}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {goal.status.toUpperCase()}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">Current</p>
          <p className="font-bold text-slate-900 text-lg">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(goal.current_amount)} />
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">Target</p>
          <p className="font-bold text-slate-900 text-lg">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(goal.target_amount)} />
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Remaining</span>
          <span className="font-medium text-slate-900">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(goal.remaining_amount)} />
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Required Contribution</span>
          <span className="font-medium text-slate-900">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={`${formatCurrency(goal.required_monthly_contribution)}/mo`} />
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Planned Contribution</span>
          <span className="font-medium text-slate-900">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={`${formatCurrency(goal.planned_monthly_contribution)}/mo`} />
          </span>
        </div>

        <p className={`text-xs font-medium ${pacingColor}`}>
          <PrivacyMask isPrivacyMode={isPrivacyMode} value={pacingText} mask="••• above required pace" />
        </p>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-auto">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Target: {new Date(goal.target_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
        </div>
        
        {projectionSentence && (
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 text-xs text-indigo-700 font-medium leading-relaxed">
            {projectionSentence}
          </div>
        )}
      </div>
    </motion.div>
  );
}
