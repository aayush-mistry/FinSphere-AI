import { SmartAlert, BillRecommendation } from '@/lib/bill-engine/types';
import { AlertTriangle, Lightbulb, Bell, CheckCircle2 } from 'lucide-react';

interface BillInsightsProps {
  alerts: SmartAlert[];
  recommendations: BillRecommendation[];
}

export function BillInsights({ alerts, recommendations }: BillInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Smart Alerts Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Smart Alerts
        </h3>
        
        {alerts.length === 0 ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex gap-3 items-center">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium text-sm">You&apos;re all caught up! No urgent alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex gap-3 items-start ${
                  alert.severity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                  alert.severity === 'high' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-rose-600' :
                  alert.severity === 'high' ? 'text-amber-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <p className="font-bold text-sm mb-1">{alert.reason}</p>
                  <p className="text-xs opacity-90">{alert.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex gap-3 items-start">
                <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-indigo-950 mb-1">{rec.reason}</p>
                  <div className="bg-white/60 p-2 rounded border border-indigo-200/50 mt-2">
                    <p className="text-xs text-indigo-900 font-medium">💡 Action Plan: {rec.actionPlan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
