"use client";

import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

export function ChatLayout() {
  const {
    messages,
    isTyping,
    sendMessage,
    regenerateResponse,
    clearChat,
    messagesEndRef,
  } = useChat();

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[600px] w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="hidden md:block shrink-0">
        <ChatSidebar 
          onNewChat={clearChat} 
          onClearChat={clearChat} 
          hasMessages={messages.length > 0} 
        />
      </div>
      
      <div className="flex-1 min-w-0 h-full flex flex-col relative">
        <ChatWindow 
          messages={messages}
          isTyping={isTyping}
          onSendMessage={sendMessage}
          onRegenerate={regenerateResponse}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}
