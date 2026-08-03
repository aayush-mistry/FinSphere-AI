import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinSphere AI",
  description: "AI Fintech Application",
};

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AICopilot from "@/components/AICopilot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-slate-50 text-slate-800 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <AICopilot />
      </body>
    </html>
  );
}
