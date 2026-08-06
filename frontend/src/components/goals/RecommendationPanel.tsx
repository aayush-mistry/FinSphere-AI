import { GoalRecommendation } from '@/lib/goal-engine/types';
import { Lightbulb, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface RecommendationPanelProps {
  recommendations: GoalRecommendation[];
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => {
        let Icon = Lightbulb;
        let colorClass = 'text-indigo-600 bg-indigo-50 border-indigo-200';
        
        if (rec.priority === 'critical') {
          Icon = AlertOctagon;
          colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        } else if (rec.priority === 'high') {
          Icon = ShieldAlert;
          colorClass = 'text-amber-600 bg-amber-50 border-amber-200';
        } else if (rec.priority === 'medium') {
          Icon = TrendingUp;
          colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        }

        return (
          <div key={idx} className={`p-4 rounded-xl border ${colorClass} flex gap-4 items-start`}>
            <div className="mt-1">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold mb-1">AI Recommendation</p>
              <p className="text-sm mb-2">{rec.reason}</p>
              <div className="bg-white/60 p-3 rounded-lg border border-black/5">
                <p className="text-sm font-medium">💡 Action Plan: {rec.actionPlan}</p>
              </div>
              {rec.estimatedFinancialImpact > 0 && (
                <p className="text-xs font-bold mt-2 opacity-80">
                  Estimated Financial Impact: {formatCurrency(rec.estimatedFinancialImpact)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
