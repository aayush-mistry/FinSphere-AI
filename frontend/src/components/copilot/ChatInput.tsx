import { useState, useRef, KeyboardEvent } from "react";
import { Send, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="relative flex items-end w-full bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all p-1">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Message FinSphere AI..."
        className="w-full max-h-[200px] min-h-[44px] bg-transparent border-0 resize-none py-3 px-4 focus:ring-0 text-[15px] custom-scrollbar"
        rows={1}
        disabled={disabled}
      />
      <div className="p-1 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={cn(
            "p-2.5 rounded-xl flex items-center justify-center transition-all",
            input.trim() && !disabled
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md shadow-indigo-200"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {input.trim() ? (
            <Send className="h-4 w-4" />
          ) : (
            <CornerDownLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
