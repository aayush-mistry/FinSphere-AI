import { Lightbulb } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const prompts = [
    "Analyze my spending this month",
    "How can I reduce my bills?",
    "Review my investment portfolio",
    "Help me create a savings goal",
  ];

  return (
    <div className="mt-8 max-w-2xl mx-auto w-full px-4 mb-8">
      <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-semibold tracking-wider uppercase justify-center">
        <Lightbulb className="h-3.5 w-3.5" />
        <p>Suggested Prompts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left p-3.5 text-sm text-slate-600 font-medium bg-white/50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
