import React, { useState } from 'react';
import { useBillsReconciliation } from '../../hooks/useBillsReconciliation';
import { BillReconciliationSummaryCards } from './BillReconciliationSummaryCards';
import { BillReconciliationTable } from './BillReconciliationTable';

export function BillReconciliation() {
  const [dateRange, setDateRange] = useState({
    startDate: '2026-08-01',
    endDate: '2026-08-31'
  });
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Hardcoded userId = 1 for the demo scope
  const { data, isLoading, isError, refetch } = useBillsReconciliation(
    1, 
    dateRange.startDate, 
    dateRange.endDate, 
    statusFilter === 'ALL' ? undefined : (statusFilter as any)
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
        <h3 className="font-bold mb-2">Bill reconciliation unavailable</h3>
        <p className="text-sm mb-4">We could not load your reconciliation data at this time.</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.results.length === 0 && statusFilter === 'ALL' ? (
        <div className="bg-slate-50 text-slate-600 p-12 rounded-3xl text-center border border-slate-100">
          <h3 className="font-bold text-lg mb-2 text-slate-900">No bill reconciliation data</h3>
          <p className="text-sm max-w-md mx-auto">
            Bill payments will appear here once active bill occurrences can be compared with transactions.
          </p>
        </div>
      ) : (
        <>
          <BillReconciliationSummaryCards summary={data.summary} />
          <BillReconciliationTable 
            results={data.results} 
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </>
      )}
    </div>
  );
}
