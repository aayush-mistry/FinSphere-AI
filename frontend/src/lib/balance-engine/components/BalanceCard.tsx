"use client";

import { useFinancialPosition } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

export const BalanceCard = () => {
  const { data: position, isLoading } = useFinancialPosition();

  if (isLoading || !position) return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-6 text-slate-900 border border-slate-100 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full opacity-50 blur-2xl"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
          <Wallet className="w-5 h-5 text-slate-500" />
        </div>
        <span className="font-semibold text-slate-700 tracking-wide">Total Bank Balance</span>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-4xl font-bold mb-2 tracking-tight text-slate-900">
          {formatCurrency(position.totalBankBalance)}
        </h2>
        <p className="text-slate-500 text-sm">
          Available Cash: <span className="font-semibold text-slate-700">{formatCurrency(position.totalAvailableCash)}</span>
        </p>
      </div>
    </motion.div>
  );
};
