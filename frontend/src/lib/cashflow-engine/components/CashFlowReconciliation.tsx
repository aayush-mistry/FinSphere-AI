import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowReconciliation, useCashFlowSummary } from '../hooks/useCashFlow';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, AlertTriangle, ArrowDown } from 'lucide-react';

export function CashFlowReconciliation({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data: rec, isLoading: recLoading, error: recError } = useCashFlowReconciliation({ start_date: startDate, end_date: endDate });
  const { data: summary, isLoading: sumLoading, error: sumError } = useCashFlowSummary({ start_date: startDate, end_date: endDate });

  if (recLoading || sumLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (recError || sumError || !rec || !summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Reconciliation Status Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        rec.reconciled 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        {rec.reconciled ? <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
        <div>
          <h4 className="font-semibold">{rec.reconciled ? 'Cash flow reconciled' : 'Reconciliation difference detected'}</h4>
          <p className="text-sm opacity-90 mt-0.5">
            {rec.reconciled 
              ? 'All recorded cash movements are accounted for exactly.' 
              : `Difference: ${formatCurrency(rec.difference)}`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cash Position Changes */}
        <Card className="shadow-sm lg:col-span-1 border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-700">Cash Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Starting Cash</span>
              <span className="font-medium">{formatCurrency(summary.startingCashPosition)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Ending Cash</span>
              <span className="font-medium">{formatCurrency(summary.endingCashPosition)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Change</span>
              <span className={`font-bold ${rec.cashPositionChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {rec.cashPositionChange >= 0 ? '+' : ''}{formatCurrency(rec.cashPositionChange)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Change in liquid cash across eligible cash accounts.</p>
          </CardContent>
        </Card>

        {/* Money Allocation Visualization */}
        <Card className="shadow-sm lg:col-span-2 border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-700 text-center">Where did the money go?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Top Node: Net Cash Flow */}
              <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md text-center z-10 relative">
                <div className="text-xs text-indigo-200 font-medium tracking-wide uppercase mb-0.5">Net Cash Flow</div>
                <div className="text-xl font-bold">{formatCurrency(rec.netCashFlow)}</div>
              </div>
              
              {/* Connecting Lines */}
              <div className="relative w-full max-w-lg h-12 flex justify-center -mt-2">
                <div className="w-[2px] h-full bg-slate-300 absolute"></div>
                <div className="w-[85%] h-[2px] bg-slate-300 absolute top-1/2"></div>
                
                {/* Arrow heads */}
                <div className="absolute left-[7.5%] top-1/2 w-[2px] h-6 bg-slate-300 flex items-end justify-center">
                  <ArrowDown className="w-3 h-3 text-slate-400 -mb-2 absolute" />
                </div>
                <div className="absolute left-1/2 top-1/2 w-[2px] h-6 bg-slate-300 flex items-end justify-center">
                  <ArrowDown className="w-3 h-3 text-slate-400 -mb-2 absolute" />
                </div>
                <div className="absolute right-[7.5%] top-1/2 w-[2px] h-6 bg-slate-300 flex items-end justify-center">
                  <ArrowDown className="w-3 h-3 text-slate-400 -mb-2 absolute" />
                </div>
              </div>

              {/* Bottom Nodes: Allocation */}
              <div className="w-full max-w-2xl grid grid-cols-3 gap-2 sm:gap-4 mt-2">
                <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl text-center shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Liquid Cash</div>
                  <div className={`font-bold text-sm sm:text-lg ${rec.cashPositionChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {rec.cashPositionChange >= 0 ? '+' : ''}{formatCurrency(rec.cashPositionChange)}
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl text-center shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Investments</div>
                  <div className="font-bold text-sm sm:text-lg text-blue-600">
                    {formatCurrency(rec.investmentContributions)}
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl text-center shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Debt Reduction</div>
                  <div className="font-bold text-sm sm:text-lg text-purple-600">
                    {formatCurrency(rec.debtReduction)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
