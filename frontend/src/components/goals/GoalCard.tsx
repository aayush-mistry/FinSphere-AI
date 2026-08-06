import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { GoalProgress } from './GoalProgress';
import { useGoalEngine } from '@/lib/goal-engine/hooks/useGoalEngine';
import { GoalModel } from '@/lib/goal-engine/types';

interface GoalCardProps {
  initialGoal: GoalModel;
  onClick?: () => void;
}

export function GoalCard({ initialGoal, onClick }: GoalCardProps) {
  // Use the engine without modifiers just for the static card view
  const { result } = useGoalEngine(initialGoal);
  const { metrics, goal } = result;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
    >
      {/* Priority Badge */}
      {goal.priority === 'critical' && (
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          CRITICAL
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{goal.name}</h3>
          <p className="text-sm text-slate-500 capitalize">{goal.type.replace('_', ' ')} Goal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Target Amount</p>
          <p className="font-bold text-slate-900">{formatCurrency(goal.targetAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Saved</p>
          <p className="font-bold text-slate-900">{formatCurrency(goal.currentAmount)}</p>
        </div>
      </div>

      <GoalProgress metrics={metrics} />

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {metrics.projectedCompletionDate ? (
            <>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600">
                Projected: <span className="font-semibold text-slate-900">{new Date(metrics.projectedCompletionDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="text-rose-600 font-medium">At risk of missing deadline</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
