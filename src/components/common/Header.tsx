import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Sun,
  Moon,
  Printer,
  Search,
  Menu,
  X,
  Bell,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { language, setLanguage, theme, toggleTheme, transactions, activeSection, setActiveSection, t, profile, customers } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate today's net income
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayIncome = todayTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeJobsCount = todayTransactions.length || 8;

  return (
    <header className="h-14 sm:h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Global Back to Dashboard button in Header whenever not in dashboard */}
        {activeSection !== "dashboard" && (
          <button
            onClick={() => setActiveSection("dashboard")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/40 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm group"
            title={language === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xs:inline">{language === "bn" ? "ড্যাশবোর্ড (Back)" : "Dashboard"}</span>
          </button>
        )}

        {/* Brand in Header (Mobile/Small Screen or High Density display) */}
        <div
          onClick={() => setActiveSection("dashboard")}
          className="cursor-pointer flex items-center gap-2 group shrink-0"
        >
          <div>
            <h1 className="text-sm sm:text-base font-bold text-blue-400 tracking-tight uppercase group-hover:text-blue-300 transition-colors">
              {profile.name || "Digital Seva Pro"}
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest hidden sm:block">
              Cyber Café Workstation v2.4
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-40 sm:w-72 md:w-80 ml-1 sm:ml-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "bn" ? "সার্ভিস, ফাইল বা কাস্টমার খুঁজুন..." : "Search services, files or customers..."}
            className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Metrics, Notifications, Theme, Print Button */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Today's Income & Active Jobs Header Metrics */}
        <div className="hidden md:flex items-center gap-4 border-r border-slate-800 pr-5">
          <div
            onClick={() => setActiveSection("accounts")}
            className="text-right cursor-pointer group"
          >
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              {language === "bn" ? "আজকের আয়" : "Today's Income"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-green-400 font-mono group-hover:underline">
              ₹{todayIncome.toFixed(2)}
            </div>
          </div>
          <div
            onClick={() => setActiveSection("print-manager")}
            className="text-right cursor-pointer group"
          >
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              {language === "bn" ? "সক্রিয় কাজ" : "Active Jobs"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-blue-400 font-mono group-hover:underline">
              {activeJobsCount}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Print Studio Launcher */}
          <button
            onClick={() => setActiveSection("photo-print-layout")}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Open Print Layout"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{language === "bn" ? "প্রিন্ট লেআউট" : "Print Studio"}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
