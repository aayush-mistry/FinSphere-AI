"use client";

import { useFinancialPosition } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { Landmark, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const NetWorthCard = () => {
  const { data: position, isLoading } = useFinancialPosition();

  if (isLoading || !position) return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-3xl p-6 text-slate-900 border border-slate-100 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <Landmark className="w-5 h-5 text-slate-500" />
          </div>
          <span className="font-semibold text-slate-700 tracking-wide">Total Net Worth</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100">
          <TrendingUp className="w-3 h-3" />
          <span>+2.4%</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-4xl font-bold mb-2 tracking-tight text-slate-900">
          {formatCurrency(position.netWorth)}
        </h2>
        <p className="text-slate-500 text-sm">
          Credit Used: <span className="font-semibold text-slate-700">{formatCurrency(position.totalCreditUsed)}</span>
        </p>
      </div>
    </motion.div>
  );
};
