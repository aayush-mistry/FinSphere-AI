"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Star, ShieldCheck, ArrowRight, BrainCircuit, Activity, ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useFinancialProfile } from "@/context/FinancialProfileContext";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";

export default function FinancialHealthScore() {
  const { profile } = useFinancialProfile();
  const { data, isLoading, error } = useFinancialHealth(profile);
  const [animatedScore, setAnimatedScore] = useState(0);

  const targetScore = data?.overall_score || 0;

  useEffect(() => {
    if (isLoading || !data) return;
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += 2;
      if (currentScore >= targetScore) {
        currentScore = targetScore;
        clearInterval(interval);
      }
      setAnimatedScore(currentScore);
    }, 15);
    return () => clearInterval(interval);
  }, [targetScore, isLoading, data]);

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600 font-medium text-center">Failed to load health score</p>
        </CardContent>
      </Card>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (colorCode: string) => {
    if (colorCode === "emerald") return "text-emerald-500";
    if (colorCode === "amber") return "text-amber-500";
    if (colorCode === "rose") return "text-rose-500";
    return "text-indigo-500";
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-emerald-500";
      case "good": return "text-indigo-500";
      case "fair": return "text-amber-500";
      case "poor": return "text-rose-500";
      default: return "text-slate-500";
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        nativeButton={false}
        render={
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden group cursor-pointer hover:shadow-md transition-shadow relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Financial Health Score
                </span>
                <Badge variant="outline" className="bg-slate-50 text-slate-500 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Badge>
              </CardTitle>
              <CardDescription>
                {isLoading ? "Analyzing your financial data..." : data?.ai_explanation.substring(0, 75) + "..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col md:flex-row items-center gap-8 relative z-10 text-left">
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
                    strokeDashoffset={isLoading ? circumference : strokeDashoffset}
                    strokeLinecap="round"
                    className={`${getScoreColor(data?.color_code || "")} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-slate-900">{animatedScore}</span>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Out of 100</span>
                </div>
              </div>

              {/* AI Summary Breakdown */}
              <div className="flex-1 w-full">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
                      <BrainCircuit className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                        {data?.ai_explanation}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Top Strength
                        </h4>
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                          {data?.strengths[0] || "No data"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Area to Improve
                        </h4>
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                          {data?.weaknesses[0] || "No data"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        }
      />

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Comprehensive Health Analysis
          </DialogTitle>
          <DialogDescription>
            A deep dive into the 8 core metrics shaping your financial health.
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="mt-6 space-y-8">
            
            {/* Overview Banner */}
            <div className={`p-6 rounded-xl flex flex-col md:flex-row items-center gap-8 ${
              data.color_code === "emerald" ? "bg-emerald-50 border border-emerald-100" :
              data.color_code === "amber" ? "bg-amber-50 border border-amber-100" :
              "bg-rose-50 border border-rose-100"
            }`}>
              <div className="text-center shrink-0">
                <div className={`text-6xl font-black ${getScoreColor(data.color_code)}`}>
                  {data.overall_score}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-600 mt-1">
                  {data.risk_level}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Assessment</h3>
                <p className="text-slate-700 leading-relaxed">{data.ai_explanation}</p>
              </div>
            </div>

            {/* Metric Breakdown Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Metric Breakdown
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {data.metrics.map((m) => (
                  <div key={m.name} className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-800">{m.name}</h4>
                        <span className={`text-xs font-bold uppercase tracking-wider ${getMetricColor(m.status)}`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{m.score} <span className="text-xs text-slate-400 font-normal">/ {m.max_score}</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                        <span>Current Value:</span>
                        <span>{m.value_description}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${m.score === m.max_score ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${(m.score / m.max_score) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" /> Core Strengths
                </h3>
                <ul className="space-y-3">
                  {data.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-900 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl border border-rose-100 bg-rose-50/50">
                <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {data.weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-rose-900 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                      {wk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Actionable Recommendations
              </h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
