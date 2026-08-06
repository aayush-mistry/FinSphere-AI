import { Bot } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 mt-12 space-y-4">
      <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100/50 relative">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xl" />
        <Bot className="h-8 w-8 text-indigo-600 relative z-10" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900">How can I help you today?</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          I&apos;m your FinSphere AI Copilot. I can analyze your spending, suggest budget optimizations, or review your investment portfolio.
        </p>
      </div>
    </div>
  );
}
