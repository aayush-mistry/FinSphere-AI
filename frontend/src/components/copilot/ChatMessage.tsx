import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check, RotateCw } from "lucide-react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  onRegenerate: () => void;
}

export function ChatMessage({ message, isLatest, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "group flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border",
        isUser 
          ? "bg-slate-100 border-slate-200" 
          : "bg-indigo-50 border-indigo-100"
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-slate-600" />
        ) : (
          <Bot className="h-5 w-5 text-indigo-600" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-5 py-3.5 rounded-2xl shadow-sm border text-[15px] leading-relaxed",
          isUser 
            ? "bg-slate-900 border-slate-800 text-white rounded-tr-sm" 
            : "bg-white border-slate-100 text-slate-800 rounded-tl-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            {isLatest && (
              <button 
                onClick={onRegenerate}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Regenerate response"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
