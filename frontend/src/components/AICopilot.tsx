"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, MessageSquare, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Hello! I am your FinSphere AI Copilot. How can I assist you with your finances today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActiveAgent('supervisor'); // Default to supervisor while routing

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', content: '' }]);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content, 
          user_id: 1,
          conversation_id: conversationId 
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                
                // Handle Metadata Events
                if (data.conversation_id) {
                  setConversationId(data.conversation_id);
                }
                if (data.active_agent) {
                  setActiveAgent(data.active_agent);
                }
                
                // Handle Content Streaming
                if (data.content) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, content: msg.content + data.content } 
                        : msg
                    )
                  );
                } else if (data.error) {
                  console.error('AI Error:', data.error);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks safely
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again later.' } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      // We can choose to clear the active agent or leave it to show who answered last
      // Let's leave it visible so the user knows which agent helped them
    }
  };

  const formatAgentName = (agent: string) => {
    return agent.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-gray-200 z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 flex flex-col gap-2 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <h3 className="font-semibold text-lg">FinSphere AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* AI Agents Status Tracker Widget */}
          {activeAgent && (
            <div className="flex items-center gap-2 text-xs bg-blue-700/50 p-2 rounded-lg border border-blue-500/30">
              <Activity size={14} className={isLoading ? "animate-pulse text-green-400" : "text-blue-300"} />
              <span className="opacity-80">Active Agent:</span>
              <span className="font-medium text-blue-100">{formatAgentName(activeAgent)}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl prose prose-sm max-w-none ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none prose-p:text-white prose-strong:text-white' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-full outline-none transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
