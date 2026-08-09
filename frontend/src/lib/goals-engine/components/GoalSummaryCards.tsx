import React from 'react';
import { motion } from 'framer-motion';
import { Target, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';
import { GoalSummaryOut } from '../types';

interface GoalSummaryCardsProps {
  summary?: GoalSummaryOut;
  isLoading: boolean;
}

export function GoalSummaryCards({ summary, isLoading }: GoalSummaryCardsProps) {
  const { isPrivacyMode } = usePrivacyMode();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 animate-pulse">
            <div className="h-10 w-10 bg-slate-100 rounded-lg mb-4"></div>
            <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 w-32 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Active Goals",
      value: summary.total_active_goals,
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      isCurrency: false
    },
    {
      title: "Total Saved",
      value: summary.total_current_amount,
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      isCurrency: true
    },
    {
      title: "Total Remaining",
      value: summary.total_remaining,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      isCurrency: true
    },
    {
      title: "Overall Progress",
      value: summary.overall_progress.toFixed(1) + "%",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      isCurrency: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">{card.title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {card.isCurrency ? (
              <PrivacyMask 
                isPrivacyMode={isPrivacyMode} 
                value={formatCurrency(card.value as number)} 
              />
            ) : (
              card.value
            )}
          </h3>
        </motion.div>
      ))}
    </div>
  );
}
