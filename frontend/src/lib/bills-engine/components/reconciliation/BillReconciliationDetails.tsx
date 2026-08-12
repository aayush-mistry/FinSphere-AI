import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BillReconciliationResult } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '@/lib/format';
import { usePrivacyMode, PrivacyMask } from '@/lib/privacy';
import { useTransactions } from '@/lib/balance-engine/hooks/useBalanceEngine';

interface DetailsProps {
  result: BillReconciliationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BillReconciliationDetails({ result, isOpen, onClose }: DetailsProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const { data: allTransactions } = useTransactions();

  if (!result) return null;

  const matchedTxns = allTransactions?.filter(t => result.matched_transaction_ids.includes(t.id)) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">{result.bill_name}</DialogTitle>
              <DialogDescription>Due: {new Date(result.occurrence_date).toLocaleDateString()}</DialogDescription>
            </div>
            <StatusBadge status={result.status} />
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Expected</p>
              <p className="text-lg font-bold text-slate-900">
                <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.expected_amount)} />
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Actually Paid</p>
              <p className="text-lg font-bold text-emerald-600">
                <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.paid_amount)} />
              </p>
            </div>
            {result.remaining_amount > 0 && (
              <div>
                <p className="text-sm text-slate-500 font-medium">Remaining</p>
                <p className="text-lg font-bold text-amber-600">
                  <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.remaining_amount)} />
                </p>
              </div>
            )}
            {result.overpayment_amount > 0 && (
              <div>
                <p className="text-sm text-slate-500 font-medium">Overpaid By</p>
                <p className="text-lg font-bold text-teal-600">
                  <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(result.overpayment_amount)} />
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Reconciliation Reason</h4>
            <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
              {result.reconciliation_reason}
            </p>
          </div>

          {matchedTxns.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
                Matched Transactions 
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{result.payment_count}</span>
              </h4>
              <div className="space-y-2">
                {matchedTxns.map((txn, idx) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{txn.merchant}</p>
                      <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString()} &middot; {txn.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(Math.abs(txn.amount))} />
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {txn.id.substring(0, 8)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
