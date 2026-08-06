import { motion } from 'framer-motion';
import { PredictionMetrics } from '@/lib/goal-engine/types';

interface GoalProgressProps {
  metrics: PredictionMetrics;
  height?: number;
}

export function GoalProgress({ metrics, height = 12 }: GoalProgressProps) {
  const percent = Math.min(100, Math.max(0, metrics.currentProgressPercent));
  
  let colorClass = 'bg-indigo-500';
  if (metrics.riskLevel === 'high') colorClass = 'bg-rose-500';
  if (metrics.riskLevel === 'medium') colorClass = 'bg-amber-500';
  if (metrics.riskLevel === 'low') colorClass = 'bg-emerald-500';

  return (
    <div className="w-full">
      <div 
        className="w-full bg-slate-100 rounded-full overflow-hidden flex items-center"
        style={{ height: `${height}px` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-medium">
        <span>{percent.toFixed(1)}% Complete</span>
        <span>{metrics.successProbability.toFixed(0)}% Success Probability</span>
      </div>
    </div>
  );
}
