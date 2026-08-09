import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, Target } from 'lucide-react';
import { GoalPredictionSummaryOut } from '../types';

interface GoalStatusSummaryProps {
  summary?: GoalPredictionSummaryOut;
  isLoading: boolean;
}

export function GoalStatusSummary({ summary, isLoading }: GoalStatusSummaryProps) {
  if (isLoading || !summary) {
    return (
      <div className="flex flex-wrap gap-4 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-32 bg-white rounded-full border border-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const statuses = [
    {
      label: 'On Track',
      count: summary.goals_on_track,
      icon: Target,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'At Risk / Overdue',
      count: summary.goals_at_risk,
      icon: AlertTriangle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      {statuses.map((status, i) => (
        <motion.div
          key={status.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
          className={`flex items-center gap-3 px-4 py-2 rounded-full border ${status.borderColor} ${status.bgColor}`}
        >
          <status.icon className={`w-4 h-4 ${status.color}`} />
          <span className={`font-semibold text-sm ${status.color}`}>
            {status.count} {status.label}
          </span>
        </motion.div>
      ))}
      {summary.earliest_completion_date && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center gap-3 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50"
        >
          <Clock className="w-4 h-4 text-indigo-700" />
          <span className="font-semibold text-sm text-indigo-700">
            Next Goal Complete: {new Date(summary.earliest_completion_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </motion.div>
      )}
    </div>
  );
}
