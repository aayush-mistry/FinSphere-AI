"use client";

import { useAlertEngine } from '@/lib/alert-engine/hooks/useAlertEngine';
import { AlertCard } from '@/components/alerts/AlertCard';
import { RiskGauge } from '@/components/alerts/RiskGauge';
import { AlertStatistics } from '@/components/alerts/AlertStatistics';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AlertsDashboard() {
  const { engineResult, resolveAlert, ignoreAlert } = useAlertEngine();
  const { alerts, metrics } = engineResult;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const otherAlerts = alerts.filter(a => a.severity !== 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Security Center</h2>
          <p className="text-slate-500">Real-time AI monitoring and risk anomaly detection.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 border border-indigo-100">
          <ShieldAlert className="w-5 h-5" />
          Active Engine
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Risk & Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <h3 className="font-bold text-slate-900 mb-6">Global Risk Score</h3>
            <RiskGauge score={metrics.overallRiskScore} />
            <div className="mt-6 flex justify-between px-4">
              <div className="text-center">
                <p className="text-xl font-bold text-rose-600">{metrics.criticalAlertsCount}</p>
                <p className="text-xs font-medium text-slate-500 uppercase">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">{metrics.highAlertsCount}</p>
                <p className="text-xs font-medium text-slate-500 uppercase">High</p>
              </div>
            </div>
          </div>
          
          <AlertStatistics metrics={metrics} />
        </div>

        {/* Right Column: Alert Timeline */}
        <div className="md:col-span-2">
          {alerts.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="font-bold text-slate-900 text-lg">No Active Alerts</h3>
              <p className="text-slate-500 mt-2">Your financial profile is secure. The AI Engine is actively monitoring for anomalies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical Alerts First */}
              {criticalAlerts.map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onResolve={resolveAlert} 
                  onIgnore={ignoreAlert} 
                />
              ))}
              
              {/* Other Alerts */}
              {otherAlerts.map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onResolve={resolveAlert} 
                  onIgnore={ignoreAlert} 
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
