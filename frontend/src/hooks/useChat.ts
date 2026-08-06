import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getFinancialContext } from '@/engine';
import { MultiAgentSupervisor } from '@/lib/ai/supervisor';
import { streamSimulatedResponse } from '@/lib/ai/streaming';

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize supervisor to avoid re-instantiating on every render
  const supervisor = React.useMemo(() => new MultiAgentSupervisor(), []);

  // Auto-scroll ref logic to be used by ChatWindow
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    setError(null);
    
    try {
      // 1. Fetch real Context Engine data (using mock user-1 for now)
      const context = await getFinancialContext('user-1');

      // 2. Pass to Multi-Agent Supervisor
      const response = await supervisor.processRequest({
        query: userMessage,
        context
      });

      // 3. Create the initial empty AI message slot
      const aiMessageId = Date.now().toString() + "-ai";
      setMessages((prev) => [
        ...prev, 
        { id: aiMessageId, role: 'assistant', content: '', timestamp: Date.now() }
      ]);

      // 4. Stream the simulated response chunk-by-chunk
      const stream = streamSimulatedResponse(response.content, 4, 15);
      
      let accumulatedContent = "";
      for await (const chunk of stream) {
        accumulatedContent += chunk;
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === aiMessageId 
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }
    } catch (err) {
      console.error("AI Brain Error:", err);
      setError("The AI Brain encountered an error processing your request.");
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    await simulateAIResponse(content);
  }, [isTyping]);

  const regenerateResponse = useCallback(async () => {
    if (isTyping) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => {
        const newArr = [...prev];
        if (newArr.length > 0 && newArr[newArr.length - 1].role === 'assistant') {
          newArr.pop();
        }
        return newArr;
      });
      await simulateAIResponse(lastUserMessage.content);
    }
  }, [messages, isTyping]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    regenerateResponse,
    clearChat,
    messagesEndRef,
  };
}
