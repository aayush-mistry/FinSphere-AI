"use client";

import { useMonthlySummary } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export const CashFlowCard = () => {
  const { data: summary, isLoading } = useMonthlySummary();

  if (isLoading || !summary) return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>;

  const isPositive = summary.cashFlow >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <DollarSign className="w-5 h-5 text-slate-500" />
          </div>
          <span className="font-semibold text-slate-700">Monthly Cash Flow</span>
        </div>
        
        <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {formatCurrency(summary.cashFlow)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Income
          </div>
          <div className="font-bold text-slate-900">{formatCurrency(summary.income)}</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-500" /> Expenses
          </div>
          <div className="font-bold text-slate-900">{formatCurrency(summary.expenses)}</div>
        </div>
      </div>
    </motion.div>
  );
};
