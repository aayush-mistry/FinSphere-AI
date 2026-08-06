"use client";

import { useBillEngine } from '@/lib/bill-engine/hooks/useBillEngine';
import { mockBillsExtended, mockIncomes, mockCurrentLiquidBalance } from '@/lib/bill-engine/mockData';
import { CashFlowForecast } from '@/components/bills/CashFlowForecast';
import { UpcomingBills } from '@/components/bills/UpcomingBills';
import { BillInsights } from '@/components/bills/BillInsights';
import { formatCurrency } from '@/lib/format';

export default function BillsDashboard() {
  const { bills, engineResult, toggleAutoPay, payBillEarly } = useBillEngine(
    mockBillsExtended, 
    mockIncomes, 
    mockCurrentLiquidBalance
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bill Management & Cash Flow</h2>
        <p className="text-slate-500">AI-powered forecasting to keep your accounts healthy.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Upcoming Outflow (30 Days)" value={formatCurrency(engineResult.metrics.upcomingCashOutflow)} />
        <MetricCard title="Total Monthly Commitment" value={formatCurrency(engineResult.metrics.overallMonthlyCommitment)} />
        <MetricCard title="Current Liquid Balance" value={formatCurrency(mockCurrentLiquidBalance)} />
        <MetricCard 
          title="Late Fee Risk" 
          value={formatCurrency(engineResult.metrics.lateFeeRiskTotal)} 
          highlight={engineResult.metrics.lateFeeRiskTotal > 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Bills List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Upcoming Bills</h3>
          <UpcomingBills 
            bills={bills} 
            onToggleAutoPay={toggleAutoPay} 
            onPayEarly={payBillEarly} 
          />
        </div>

        {/* Right Column: Chart & Insights */}
        <div className="lg:col-span-2 space-y-6">
          <CashFlowForecast data={engineResult.cashFlowForecast} />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <BillInsights 
              alerts={engineResult.alerts} 
              recommendations={engineResult.recommendations} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, highlight = false }: { title: string; value: string, highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border shadow-sm ${highlight ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
      <p className={`text-xs mb-1 font-medium ${highlight ? 'text-rose-600' : 'text-slate-500'}`}>{title}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
