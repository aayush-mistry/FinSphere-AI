"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings,
  PieChart,
  Wallet
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Income", href: "/income", icon: Wallet },
    { name: "Expenses", href: "/expenses", icon: PieChart },
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
