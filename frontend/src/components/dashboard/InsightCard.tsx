"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Info, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Insight, InsightSeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityStyles = (severity: InsightSeverity) => {
    switch (severity) {
      case "low": return "bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-300 shadow-emerald-100/50";
      case "medium": return "bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-300 shadow-blue-100/50";
      case "high": return "bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-300 shadow-amber-100/50";
      case "critical": return "bg-rose-50 border-rose-200 text-rose-800 hover:border-rose-300 shadow-rose-100/50";
      default: return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  const getSeverityIcon = (severity: InsightSeverity) => {
    switch (severity) {
      case "low": return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "medium": return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
      case "high": return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "critical": return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      default: return <Sparkles className="h-5 w-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-sm group",
        getSeverityStyles(insight.severity),
        isExpanded ? "ring-2 ring-offset-1 ring-indigo-500/20" : ""
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4 flex gap-3">
        <div className="mt-0.5 relative">
          <div className="absolute inset-0 bg-white/40 blur-md rounded-full"></div>
          {getSeverityIcon(insight.severity)}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight group-hover:text-indigo-900 transition-colors">
              {insight.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white/60 backdrop-blur-sm px-1.5 py-0 border-current/20">
                {insight.category}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 opacity-50" />
              ) : (
                <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed font-medium">
            {insight.description}
          </p>
        </div>
      </div>

      {/* Expandable Content */}
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 border-t border-current/10 bg-white/30 backdrop-blur-md space-y-3 mt-3 text-sm">
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-1">Reasoning</p>
              <p>{insight.reasoning}</p>
            </div>
            
            {insight.financialImpact && (
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-1">Impact</p>
                <p className="font-medium">{insight.financialImpact}</p>
              </div>
            )}
            
            {insight.suggestedAction && (
              <div className="bg-white/50 p-3 rounded-lg border border-current/10 mt-2">
                <p className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Suggested Action
                </p>
                <p className="font-medium text-slate-800">{insight.suggestedAction}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] opacity-50 font-medium pt-2 uppercase tracking-wide">
              <span>Confidence: {insight.confidenceScore}%</span>
              <span>{new Date(insight.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
