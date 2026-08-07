"use client";

import { useTransactions } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";

export const TransactionTable = () => {
  const { data: transactions, isLoading } = useTransactions();

  if (isLoading || !transactions) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-900">All Transactions</h3>
        
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-xl">Date</th>
              <th className="px-4 py-3 font-semibold">Merchant</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-xl">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedTxns.map((txn) => {
              const isIncome = txn.amount > 0;
              return (
                <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold text-slate-900">{txn.merchant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                      {txn.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      txn.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : ''}{formatCurrency(txn.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
