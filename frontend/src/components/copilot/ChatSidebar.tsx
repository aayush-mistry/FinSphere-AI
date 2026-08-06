import { Plus, MessageSquare, Trash2 } from "lucide-react";

interface ChatSidebarProps {
  onNewChat: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

export function ChatSidebar({ onNewChat, onClearChat, hasMessages }: ChatSidebarProps) {
  // Mock history for now. Next milestone will connect to backend history.
  const history = [
    { id: '1', title: 'Monthly Budget Review', date: 'Today' },
    { id: '2', title: 'Subscription Analysis', date: 'Yesterday' },
    { id: '3', title: 'Investment Strategy', date: 'Previous 7 Days' },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus className="h-4 w-4 text-indigo-500" />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        <div>
          <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent</h4>
          <div className="space-y-1">
            {history.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex flex-col text-left px-3 py-2.5 rounded-lg hover:bg-slate-200/50 text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{chat.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 pl-6 mt-0.5">{chat.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasMessages && (
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Clear Conversation
          </button>
        </div>
      )}
    </div>
  );
}
