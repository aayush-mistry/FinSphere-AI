import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Goal } from "@/lib/types";
import { useFinancialProfile } from "@/context/FinancialProfileContext";

export default function GoalTracker() {
  const { goals } = useFinancialProfile();
  return (
    <Card className="border-slate-100 shadow-sm bg-white flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-slate-900 text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-500" />
          Financial Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="space-y-6">
          {goals.map((goal: Goal) => {
            const progress = (goal.savedAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-800">{goal.name}</h4>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{goal.estimatedCompletion}</span>
                  </div>
                </div>

                <Progress value={progress} className="h-2 w-full bg-slate-100 [&>div]:bg-indigo-500" />
                
                <div className="flex gap-2 items-start bg-indigo-50/50 p-2 rounded-md mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-900 leading-snug">
                    {goal.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
