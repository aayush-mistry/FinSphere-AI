import React from 'react';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { formatCurrency } from '@/lib/format';
import { motion } from 'framer-motion';

interface GoalOverviewProps {
  current: number;
  target: number;
  remaining: number;
  progress: number;
}

export function GoalOverview({ current, target, remaining, progress }: GoalOverviewProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const progressPercent = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-1">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(current)} />
          </h2>
          <p className="text-slate-400 font-medium">
            Saved of <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(target)} />
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xl font-semibold text-slate-200">
            <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(remaining)} /> remaining
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-slate-300">Progress</span>
          <span className="text-white">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
