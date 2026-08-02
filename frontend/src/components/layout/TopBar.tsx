"use client";

import { Bell, Search, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 w-64 text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Net Worth</span>
          <span className={`text-2xl font-bold text-slate-900 transition-all ${privacyMode ? 'blur-md opacity-50 select-none' : ''}`}>
            $1,245,000.00
          </span>
        </div>
        
        <div className="h-10 w-px bg-slate-100"></div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
            title="Toggle Privacy Mode"
          >
            {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
          
          <button className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-100 transition-colors ml-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
              JD
            </div>
            <span className="text-sm font-medium text-slate-700">John Doe</span>
          </button>
        </div>
      </div>
    </header>
  );
}
