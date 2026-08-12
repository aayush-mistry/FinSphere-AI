import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BillReconciliationResult, BillReconciliationStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { BillReconciliationDetails } from './BillReconciliationDetails';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TableProps {
  results: BillReconciliationResult[];
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function BillReconciliationTable({ results, statusFilter, onStatusFilterChange }: TableProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const [search, setSearch] = useState('');
  const [selectedResult, setSelectedResult] = useState<BillReconciliationResult | null>(null);

  const filteredResults = results.filter(r => 
    r.bill_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-900">Bill Reconciliation</h3>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search bills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val || 'ALL')}>
            <SelectTrigger className="w-full md:w-48 bg-slate-50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="DUE">Due Today</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PAID_LATE">Paid Late</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="OVERPAID">Overpaid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-xl">Bill</th>
              <th className="px-4 py-3 font-semibold">Due Date</th>
              <th className="px-4 py-3 font-semibold">Expected</th>
              <th className="px-4 py-3 font-semibold">Paid</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No bill reconciliation data found.
                </td>
              </tr>
            ) : (
              filteredResults.map((result) => (
                <tr key={`${result.bill_id}-${result.occurrence_date}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {result.bill_name}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {new Date(result.occurrence_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-slate-900">
                    <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.expected_amount)} />
                  </td>
                  <td className="px-4 py-4 text-emerald-600 font-medium">
                    <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.paid_amount)} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => setSelectedResult(result)}
                      className="text-sm text-emerald-600 font-medium hover:text-emerald-700 underline-offset-4 hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-4">
        {filteredResults.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No bill reconciliation data found.
          </div>
        ) : (
          filteredResults.map((result) => (
            <div key={`${result.bill_id}-${result.occurrence_date}`} className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{result.bill_name}</h4>
                  <p className="text-xs text-slate-500">Due: {new Date(result.occurrence_date).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Expected:</span>
                <span className="font-medium text-slate-900"><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.expected_amount)} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Paid:</span>
                <span className="font-medium text-emerald-600"><PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.paid_amount)} /></span>
              </div>
              <button 
                onClick={() => setSelectedResult(result)}
                className="w-full mt-2 py-2 text-sm text-emerald-600 font-medium bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Drawer / Details Modal */}
      <BillReconciliationDetails 
        isOpen={!!selectedResult} 
        onClose={() => setSelectedResult(null)} 
        result={selectedResult} 
      />
    </div>
  );
}
