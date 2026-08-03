"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bot, 
  Copy, 
  Briefcase, 
  Settings
} from "lucide-react";
import { useBusinessMode } from "@/context/BusinessModeContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isBusinessMode, setIsBusinessMode } = useBusinessMode();


  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Copilot", href: "/copilot", icon: Bot },
    { name: "Digital Twin", href: "/digital-twin", icon: Copy },
    { name: "Business CFO", href: "/business-cfo", icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 shadow-sm flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2 text-indigo-950">
          FinSphere <span className="text-emerald-700">AI</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive 
                  ? "bg-indigo-50 text-indigo-900 font-semibold" 
                  : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Mode</span>
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => setIsBusinessMode(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!isBusinessMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              Personal
            </button>
            <button 
              onClick={() => setIsBusinessMode(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${isBusinessMode ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-500'}`}
            >
              Business
            </button>
          </div>
        </div>

        <Link 
          href="/settings" 
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
            pathname === "/settings"
              ? "bg-indigo-50 text-indigo-900 font-semibold"
              : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
