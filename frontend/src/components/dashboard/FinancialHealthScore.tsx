"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface HealthMetric {
  name: string;
  score: number; // out of 5
}

const metrics: HealthMetric[] = [
  { name: "Savings", score: 5 },
  { name: "Debt", score: 4 },
  { name: "Emergency Fund", score: 5 },
  { name: "Investments", score: 4 },
];

export default function FinancialHealthScore() {
  const [score, setScore] = useState(0);
  const targetScore = 91;

  useEffect(() => {
    // Animate score from 0 to targetScore
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += 1;
      setScore(currentScore);
      if (currentScore >= targetScore) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [targetScore]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden group">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-900 flex items-center justify-between">
          Financial Health
        </CardTitle>
        <CardDescription>Excellent Financial Stability</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col md:flex-row items-center gap-8">
        {/* Radial Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="160" height="160" className="rotate-[-90deg]">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-slate-900">{score}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Out of 100</span>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-slate-700">{metric.name}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < metric.score ? "fill-current" : "text-slate-200 fill-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
