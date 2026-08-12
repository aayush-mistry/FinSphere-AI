'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BillReconciliation } from '@/lib/bills-engine/components/reconciliation/BillReconciliation';

const queryClient = new QueryClient();

export default function BillsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-8 max-w-7xl mx-auto p-8 pt-6 pb-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bills & Payments</h1>
            <p className="text-slate-500">Track and reconcile your expected bills with actual payments.</p>
          </div>
        </div>
        
        <BillReconciliation />
      </div>
    </QueryClientProvider>
  );
}
