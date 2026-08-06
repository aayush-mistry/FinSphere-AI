"use client";

import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number; // 0-100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  // Map 0-100 to an angle from 0 to 180 degrees
  const rotation = (score / 100) * 180;
  
  let statusText = 'Low Risk';
  let colorClass = 'text-emerald-500';
  let gradientClass = 'from-emerald-400 to-emerald-600';
  
  if (score >= 80) {
    statusText = 'Critical Risk';
    colorClass = 'text-rose-600';
    gradientClass = 'from-rose-500 to-rose-700';
  } else if (score >= 50) {
    statusText = 'High Risk';
    colorClass = 'text-amber-500';
    gradientClass = 'from-amber-400 to-amber-600';
  }

  return (
    <div className="relative w-48 h-24 mx-auto flex flex-col items-center justify-end overflow-hidden">
      {/* Semi-circle background */}
      <div className="absolute w-48 h-48 border-[16px] border-slate-100 rounded-full top-0 box-border" />
      
      {/* Colored Gauge fill (using CSS mask or just a simple rotated semi-circle) */}
      <div 
        className="absolute w-48 h-48 rounded-full top-0 box-border border-[16px] border-transparent"
        style={{
          borderTopColor: score >= 80 ? '#f43f5e' : score >= 50 ? '#f59e0b' : '#10b981',
          borderRightColor: score >= 80 ? '#f43f5e' : score >= 50 ? '#f59e0b' : '#10b981',
          transform: `rotate(${rotation - 135}deg)`, // -135 starts it at bottom left.
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      <div className="z-10 text-center pb-2">
        <span className={`text-4xl font-black ${colorClass}`}>{score.toFixed(0)}</span>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{statusText}</p>
      </div>
    </div>
  );
}
