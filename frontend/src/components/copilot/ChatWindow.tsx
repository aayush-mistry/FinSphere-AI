import { RefObject } from "react";
import { Message } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (msg: string) => void;
  onRegenerate: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChatWindow({
  messages,
  isTyping,
  onSendMessage,
  onRegenerate,
  messagesEndRef,
}: ChatWindowProps) {
  return (
    <div className="flex flex-col flex-1 h-full bg-white relative">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col space-y-6">
          
          {messages.length === 0 ? (
            <>
              <EmptyState />
              <SuggestedPrompts onSelect={onSendMessage} />
            </>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLatest={index === messages.length - 1}
                  onRegenerate={onRegenerate}
                />
              ))}
              
              {isTyping && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <TypingIndicator />
                </div>
              )}
            </>
          )}

          {/* Invisible div for auto-scrolling */}
          <div ref={messagesEndRef} className="h-4 w-full" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={onSendMessage} disabled={isTyping} />
          <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
            AI Copilot can make mistakes. Consider verifying important financial information.
          </p>
        </div>
      </div>
    </div>
  );
}
