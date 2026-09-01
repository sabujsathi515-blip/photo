import React from "react";
import { useApp } from "../../context/AppContext";
import { NavSection } from "../../types";
import {
  LayoutDashboard,
  Camera,
  UserCheck,
  Grid,
  Calculator,
  GraduationCap,
  FileText,
  Contact,
  FileCode2,
  Image,
  Palette,
  FolderArchive,
  Printer,
  Users,
  BadgeIndianRupee,
  BarChart3,
  HardDrive,
  Building2,
  Settings,
  Zap,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { activeSection, setActiveSection, t, language, setLanguage, profile } = useApp();

  const navGroups: { groupTitle: string; items: NavItem[] }[] = [
    {
      groupTitle: language === "bn" ? "প্রধান কেন্দ্র" : "Main Hub",
      items: [
        { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
        { id: "govt-services", label: t.nav.govtServices, icon: Building2, badge: "30+ Portals", badgeColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
      ],
    },
    {
      groupTitle: language === "bn" ? "ফটো ও প্রিন্ট স্টুডিও" : "Photo & Print",
      items: [
        { id: "photo-studio", label: t.nav.photoStudio, icon: Camera },
        { id: "passport-photo", label: t.nav.passportPhoto, icon: UserCheck, badge: "Auto-Crop", badgeColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
        { id: "photo-print-layout", label: t.nav.photoPrintLayout, icon: Grid, badge: "A4 / 4R", badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
        { id: "photo-calculator", label: t.nav.photoCalculator, icon: Calculator },
        { id: "image-tools", label: t.nav.imageTools, icon: Image },
      ],
    },
    {
      groupTitle: language === "bn" ? "স্কুল প্রজেক্ট ও ডকুমেন্ট" : "School & Documents",
      items: [
        { id: "school-project", label: t.nav.schoolProject, icon: GraduationCap, badge: "AI Smart", badgeColor: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
        { id: "document-maker", label: t.nav.documentMaker, icon: FileText },
        { id: "resume-maker", label: t.nav.resumeMaker, icon: Contact },
        { id: "pdf-tools", label: t.nav.pdfTools, icon: FileCode2, badge: "Offline", badgeColor: "bg-teal-500/10 text-teal-400 border border-teal-500/20" },
      ],
    },
    {
      groupTitle: language === "bn" ? "গ্রাফিক্স ও ডিজাইন ভল্ট" : "Design & Assets",
      items: [
        { id: "design-studio", label: t.nav.designStudio, icon: Palette },
        { id: "psd-manager", label: t.nav.psdManager, icon: FolderArchive, badge: "Vault", badgeColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
        { id: "print-manager", label: t.nav.printManager, icon: Printer },
      ],
    },
    {
      groupTitle: language === "bn" ? "ব্যবসা ও ক্যাশ খাতা" : "Management",
      items: [
        { id: "customer-manager", label: t.nav.customerManager, icon: Users },
        { id: "accounts", label: t.nav.accounts, icon: BadgeIndianRupee },
        { id: "reports", label: t.nav.reports, icon: BarChart3 },
        { id: "file-storage", label: t.nav.fileStorage, icon: HardDrive },
        { id: "settings", label: t.nav.settings, icon: Settings },
      ],
    },
  ];

  const handleSelect = (id: NavSection) => {
    setActiveSection(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-[53px] lg:top-[57px] bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors text-left ${
                        isActive
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-blue-500/20 text-blue-300"
                              : item.badgeColor || "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* High Density Operator & Footer Box */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
              OP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate">
                {profile.ownerName || "Admin Operator"}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online (Station 1)
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleSelect("settings")}
              className="flex-1 text-[10px] py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded transition-colors"
            >
              {language === "bn" ? "সেটিংস" : "Settings"}
            </button>
            <button
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded text-[10px] font-mono transition-colors"
              title="Toggle Language"
            >
              {language === "bn" ? "BN | EN" : "EN | BN"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
