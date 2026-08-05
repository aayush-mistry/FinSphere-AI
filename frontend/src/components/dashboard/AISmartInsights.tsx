import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Insight, InsightSeverity } from "@/lib/types";
import { MOCK_INSIGHTS } from "@/lib/mockData";

export default function AISmartInsights() {
  const getSeverityStyles = (severity: InsightSeverity) => {
    switch (severity) {
      case "success": return "bg-emerald-50 border-emerald-100 text-emerald-800";
      case "warning": return "bg-amber-50 border-amber-100 text-amber-800";
      case "critical": return "bg-rose-50 border-rose-100 text-rose-800";
      case "info": default: return "bg-blue-50 border-blue-100 text-blue-800";
    }
  };

  const getSeverityIcon = (severity: InsightSeverity) => {
    switch (severity) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "critical": return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "info": default: return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-slate-900 text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {MOCK_INSIGHTS.map((insight: Insight) => (
            <div 
              key={insight.id} 
              className={`p-3 rounded-lg border ${getSeverityStyles(insight.severity)} hover:shadow-md transition-shadow duration-200 cursor-default flex gap-3`}
            >
              <div className="mt-0.5">
                {getSeverityIcon(insight.severity)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white/50 px-1.5 py-0">
                    {insight.category}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
