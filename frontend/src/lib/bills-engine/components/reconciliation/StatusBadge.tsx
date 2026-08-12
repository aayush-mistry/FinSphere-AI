import React from 'react';
import { BillReconciliationStatus } from '../../types';

interface StatusBadgeProps {
  status: BillReconciliationStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let label = status.replace('_', ' ');
  label = label.charAt(0) + label.slice(1).toLowerCase();

  let colorClasses = '';
  switch (status) {
    case 'UPCOMING':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'DUE':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Due Today';
      break;
    case 'PAID':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Paid';
      break;
    case 'PAID_LATE':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Paid Late';
      break;
    case 'PARTIALLY_PAID':
      colorClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      label = 'Partially Paid';
      break;
    case 'OVERPAID':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      label = 'Overpaid';
      break;
    case 'UNPAID':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'OVERDUE':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}>
      {label}
    </span>
  );
}
