import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit } from "lucide-react";
import { useFinancialProfile } from "@/context/FinancialProfileContext";
import { InsightCard } from "./InsightCard";

export default function AISmartInsights() {
  const { insights, isLoading } = useFinancialProfile();

  return (
    <Card className="border-slate-100 shadow-sm bg-white flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 text-base flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-md">
              <BrainCircuit className="h-4 w-4 text-indigo-600" />
            </div>
            AI Financial Engine
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span>Analyzing Behavior</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <div className="space-y-4 pr-1">
          {isLoading ? (
            // Skeleton Loader
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 animate-pulse">
                <div className="h-6 w-6 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : insights.length > 0 ? (
            insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <BrainCircuit className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-900">No significant insights yet</p>
              <p className="text-xs text-slate-500 mt-1">We&apos;ll keep monitoring your financial behavior and let you know when we find something interesting.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

