import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinSphere AI",
  description: "AI Fintech Application",
};

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AICopilot from "@/components/AICopilot";
import { BusinessModeProvider } from "@/context/BusinessModeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex bg-slate-50 text-slate-800 font-sans">
        <BusinessModeProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
          <AICopilot />
        </BusinessModeProvider>
      </body>
    </html>
  );
}
