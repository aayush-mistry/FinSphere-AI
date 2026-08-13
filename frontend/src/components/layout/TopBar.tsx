"use client";

import { Bell, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative h-24 bg-white border-b-[3px] border-slate-200 shadow-md flex items-center justify-between px-8 shrink-0 z-50 mb-2">
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
        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400">Check back later for new alerts.</p>
                </div>
              </div>
            )}
          </div>
          
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
