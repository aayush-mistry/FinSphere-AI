import { useState } from 'react';
import { AlertModel } from '@/lib/alert-engine/types';
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, Bot, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface AlertCardProps {
  alert: AlertModel;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}

export function AlertCard({ alert, onResolve, onIgnore }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  let Icon = Info;
  let bgClass = 'bg-blue-50 border-blue-200';
  let textClass = 'text-blue-900';
  let iconClass = 'text-blue-600 bg-blue-100';

  if (alert.severity === 'critical') {
    Icon = AlertOctagon;
    bgClass = 'bg-rose-50 border-rose-200';
    textClass = 'text-rose-900';
    iconClass = 'text-rose-600 bg-rose-100';
  } else if (alert.severity === 'high') {
    Icon = AlertTriangle;
    bgClass = 'bg-amber-50 border-amber-200';
    textClass = 'text-amber-900';
    iconClass = 'text-amber-600 bg-amber-100';
  }

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${expanded ? 'shadow-md' : 'shadow-sm'} ${bgClass}`}>
      <div 
        className="p-5 cursor-pointer flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`p-3 rounded-full flex-shrink-0 ${iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-lg ${textClass}`}>{alert.title}</h4>
            {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
          <p className="text-slate-700 mt-1">{alert.description}</p>
          
          {!expanded && (
            <div className="flex items-center gap-4 mt-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${iconClass}`}>
                {alert.severity} Risk
              </span>
              {alert.financialImpact > 0 && (
                <span className="text-sm font-semibold text-slate-600">
                  Impact: {formatCurrency(alert.financialImpact)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded State */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-black/5 bg-white/40">
          <div className="mt-4 bg-white rounded-xl p-4 border border-black/5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold">
              <Bot className="w-5 h-5" />
              <span>AI Analysis</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {alert.aiExplanation}
            </p>
            
            {alert.recommendations.length > 0 && (
              <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                <p className="font-semibold text-indigo-900 mb-2">💡 Recommended Action Plan</p>
                <p className="text-sm text-indigo-800">{alert.recommendations[0].actionPlan}</p>
                
                {alert.recommendations[0].estimatedSavings > 0 && (
                  <p className="text-xs font-bold text-indigo-700 mt-2">
                    Estimated Savings: {formatCurrency(alert.recommendations[0].estimatedSavings)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); onIgnore(alert.id); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Ignore
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onResolve(alert.id); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${
                alert.severity === 'critical' ? 'bg-rose-600 hover:bg-rose-700' :
                alert.severity === 'high' ? 'bg-amber-600 hover:bg-amber-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Resolve Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
