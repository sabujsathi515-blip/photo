import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
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
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  Scissors,
  Minimize2,
  FileSearch,
  CheckCircle,
  Smartphone,
  Wand2,
} from "lucide-react";
import { NavSection } from "../../types";

export const DashboardOverview: React.FC = () => {
  const { setActiveSection, t, language, transactions, customers, govtLinks, profile, notify } = useApp();
  const [aiInput, setAiInput] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);

  const todayIncome = todayTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayExpense = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayProfit = todayIncome - todayExpense;

  const totalDues = customers
    .filter((c) => c.paidStatus === "due" || c.paidStatus === "partial")
    .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  const samplePrintQueue = [
    {
      id: "job-1",
      name: "Passport_4x6_Sheet_01.jpg",
      type: "A4 Glossy",
      qty: 2,
      status: "Printing...",
      cost: 40,
      statusClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      id: "job-2",
      name: "Water_Pollution_Project_Final.pdf",
      type: "A4 Bond",
      qty: 12,
      status: "In Queue",
      cost: 120,
      statusClass: "bg-slate-800 text-slate-400 border border-slate-700",
    },
    {
      id: "job-3",
      name: "Aadhaar_Card_Correction.doc",
      type: "Normal Paper",
      qty: 1,
      status: "In Queue",
      cost: 10,
      statusClass: "bg-slate-800 text-slate-400 border border-slate-700",
    },
    {
      id: "job-4",
      name: "Marriage_Invitation_PSD_v2.jpg",
      type: "A4 Matte",
      qty: 50,
      status: "On Hold",
      cost: 500,
      statusClass: "bg-slate-800 text-slate-400 border border-slate-700",
    },
    {
      id: "job-5",
      name: "Scholarship_Application.pdf",
      type: "A4 B&W",
      qty: 4,
      status: "In Queue",
      cost: 8,
      statusClass: "bg-slate-800 text-slate-400 border border-slate-700",
    },
  ];

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    notify(language === "bn" ? `AI প্রম্পট পাঠানো হয়েছে: "${aiInput}"` : `AI Prompt Sent: "${aiInput}"`, "info");
    setActiveSection("school-project");
  };

  const quickServices: {
    id: NavSection;
    title: string;
    titleBn: string;
    description: string;
    descriptionBn: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: "whatsapp-doc-fix",
      title: "WhatsApp Doc Fix & Clean Print",
      titleBn: "হোয়াটসঅ্যাপ ডক সোজা ও প্রিন্ট",
      description: "Perspective 4-corner crop, deskew, white background & 1-click A4 print",
      descriptionBn: "বাঁকা ফটো/PDF সোজা, শ্যাডো দূরীকরণ, সাদা কাগজ ও ১-ক্লিক প্রিন্ট",
      icon: Smartphone,
      badge: "Deskew",
    },
    {
      id: "photo-studio",
      title: "Photo Studio",
      titleBn: "ফটো স্টুডিও",
      description: "Crop, brighten, clean background & sharpen",
      descriptionBn: "ছবি ক্রপ, ব্যাকগ্রাউন্ড রিমুভ ও এডিটিং",
      icon: Camera,
    },
    {
      id: "passport-photo",
      title: "Passport Photo Maker",
      titleBn: "পাসপোর্ট ফটো মেকার",
      description: "Indian Passport, Visa, Aadhaar & PAN presets",
      descriptionBn: "পাসপোর্ট, আধার ও প্যান কার্ড ফটো সাইজ",
      icon: UserCheck,
      badge: "Auto",
    },
    {
      id: "photo-print-layout",
      title: "Print Layout Studio",
      titleBn: "প্রিন্ট লেআউট শিট",
      description: "Arrange 4, 8, 12, 16 photos on A4 with cut marks",
      descriptionBn: "A4 পেজে ৪, ৮, ১২ কপি ফটো সাজিয়ে প্রিন্ট",
      icon: Grid,
      badge: "A4",
    },
    {
      id: "school-project",
      title: "School Project AI",
      titleBn: "স্কুল প্রজেক্ট মেকার",
      description: "Cover pages, chapters & structured projects",
      descriptionBn: "ফ্রন্ট পেজ, ভূমিকা ও ডায়াগ্রামসহ প্রজেক্ট",
      icon: GraduationCap,
      badge: "AI",
    },
    {
      id: "document-maker",
      title: "Document Drafter",
      titleBn: "ডকুমেন্ট ড্রাফটার",
      description: "Leave apps, police GD, receipts & agreements",
      descriptionBn: "দরখাস্ত, পুলিশ জিডি ও এগ্রিমেন্ট ফরম্যাট",
      icon: FileText,
    },
    {
      id: "resume-maker",
      title: "Resume & Bio-Data",
      titleBn: "সিভি ও বায়োডাটা",
      description: "Job resumes and Bengali matrimonial bio-data",
      descriptionBn: "চাকরির রিজিউমে ও বিয়ের পাত্র/পাত্রীর বায়োডাটা",
      icon: Contact,
    },
    {
      id: "pdf-tools",
      title: "PDF Suite Pro",
      titleBn: "পিডিএফ টুলকিট",
      description: "Merge, split, compress, watermark & convert",
      descriptionBn: "মার্জ, স্প্লিট, কম্প্রেস ও ওয়াটারমার্ক",
      icon: FileCode2,
      badge: "Safe",
    },
    {
      id: "psd-manager",
      title: "PSD Templates",
      titleBn: "পিএসডি ভল্ট",
      description: "Ready-to-use PSD action files & designs",
      descriptionBn: "ভোট, আধার, প্যান ও ব্যানার PSD ভল্ট",
      icon: FolderArchive,
    },
  ];

  const pinnedGovtLinks = govtLinks.filter((l) => l.isPinned).slice(0, 4);

  return (
    <div className="space-y-5 pb-8 font-sans">
      {/* Featured WhatsApp Doc Straightener & Clean Print Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {language === "bn"
                  ? "হোয়াটসঅ্যাপ বাঁকা ডকুমেন্ট সোজা ও ক্লিন প্রিন্ট টুল"
                  : "WhatsApp Document Straightener & Clean Print"}
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NEW
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {language === "bn"
                ? "কাস্টমারের পাঠানো বাঁকা ফটো ও PDF ৪-কোণ টেনে সোজা করুন, টেবিল/বেডের শ্যাডো মুছে ধবধবে সাদা জেরক্স বানান ও সরাসরি A4 প্রিন্ট করুন।"
                : "Straighten skewed mobile camera photos & PDFs with 4-corner perspective crop, whiten shadows & print clean A4 copies."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSection("whatsapp-doc-fix")}
            className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            {language === "bn" ? "ডকুমেন্ট সোজা করুন" : "Launch Straightener"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 High Density Quick Action Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Passport Photo Maker */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
          <div>
            <span className="text-2xl mb-1 inline-block">📸</span>
            <h3 className="font-bold text-sm text-slate-100">
              {language === "bn" ? "পাসপোর্ট ফটো মেকার" : "Passport Photo Maker"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {language === "bn" ? "অটো ক্রপ, ফেস অ্যালাইন ও প্রিন্ট লেআউট।" : "Auto crop, face align & print layouts."}
            </p>
          </div>
          <button
            onClick={() => setActiveSection("passport-photo")}
            className="mt-3.5 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
          >
            {language === "bn" ? "স্টুডিও চালু করুন" : "Launch Studio"}
          </button>
        </div>

        {/* Card 2: School Project AI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
          <div>
            <span className="text-2xl mb-1 inline-block">📚</span>
            <h3 className="font-bold text-sm text-slate-100">
              {language === "bn" ? "স্কুল প্রজেক্ট AI" : "School Project AI"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {language === "bn" ? "বাংলা/ইংরেজি কন্টেন্ট ও ফ্রন্ট পেজ তৈরি।" : "Generate full content & cover pages."}
            </p>
          </div>
          <button
            onClick={() => setActiveSection("school-project")}
            className="mt-3.5 w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
          >
            {language === "bn" ? "নতুন প্রজেক্ট" : "New Project"}
          </button>
        </div>

        {/* Card 3: PDF Suite Pro */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
          <div>
            <span className="text-2xl mb-1 inline-block">🛠️</span>
            <h3 className="font-bold text-sm text-slate-100">
              {language === "bn" ? "পিডিএফ স্যুট প্রো" : "PDF Suite Pro"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {language === "bn" ? "মার্জ, স্প্লিট, কম্প্রেস ও কনভার্ট।" : "Merge, Split, Compress & Convert."}
            </p>
          </div>
          <button
            onClick={() => setActiveSection("pdf-tools")}
            className="mt-3.5 w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
          >
            {language === "bn" ? "টুলকিট খুলুন" : "Open Tools"}
          </button>
        </div>

        {/* Card 4: Resume & CV Maker */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
          <div>
            <span className="text-2xl mb-1 inline-block">📝</span>
            <h3 className="font-bold text-sm text-slate-100">
              {language === "bn" ? "বায়োডাটা ও সিভি মেকার" : "Resume & CV Maker"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {language === "bn" ? "চাকরির সিভি ও পাত্র/পাত্রীর বায়োডাটা।" : "Professional templates for applications."}
            </p>
          </div>
          <button
            onClick={() => setActiveSection("resume-maker")}
            className="mt-3.5 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
          >
            {language === "bn" ? "ড্রাফট শুরু করুন" : "Start Draft"}
          </button>
        </div>
      </div>

      {/* Main High Density 12-Column Grid: Left Active Queue + Right Tool & AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Active Print Queue & Live Jobs Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <h2 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              {language === "bn" ? "সক্রিয় প্রিন্ট ও জব কিউ" : "Active Print Queue"}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSection("photo-print-layout")}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {language === "bn" ? "নতুন জব" : "Add Job"}
              </button>
              <button
                onClick={() => notify(language === "bn" ? "কিউ রিফ্রেশ হয়েছে" : "Queue refreshed", "info")}
                className="text-xs text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
              >
                {language === "bn" ? "রিফ্রেশ" : "Clear Completed"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/60 text-slate-500 sticky top-0 border-b border-slate-800/80">
                <tr>
                  <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider">
                    {language === "bn" ? "জবের নাম" : "Job Name"}
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider">
                    {language === "bn" ? "সাইজ/টাইপ" : "Size/Type"}
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider">
                    {language === "bn" ? "পরিমাণ" : "Qty"}
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider">
                    {language === "bn" ? "অবস্থা" : "Status"}
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-right">
                    {language === "bn" ? "মূল্য" : "Cost"}
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/80 text-slate-300">
                {samplePrintQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-200 truncate max-w-[200px]">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{item.type}</td>
                    <td className="py-2.5 px-4 font-mono">{item.qty}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold font-mono text-right text-slate-200">
                      ₹{item.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Tools Sidebar + AI Assistant Pro */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Quick Tools Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-sm">
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
              {language === "bn" ? "কুইক টুলস সাইডবার" : "Quick Tools Sidebar"}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setActiveSection("photo-studio")}
                className="p-2.5 bg-slate-800/50 border border-slate-700/80 rounded hover:border-blue-500 cursor-pointer text-center transition-colors group"
              >
                <div className="text-lg group-hover:scale-110 transition-transform">✂️</div>
                <div className="text-[10px] text-slate-300 mt-1 font-medium">
                  {language === "bn" ? "ক্রপ ছবি" : "Crop Image"}
                </div>
              </div>
              <div
                onClick={() => setActiveSection("pdf-tools")}
                className="p-2.5 bg-slate-800/50 border border-slate-700/80 rounded hover:border-blue-500 cursor-pointer text-center transition-colors group"
              >
                <div className="text-lg group-hover:scale-110 transition-transform">🗜️</div>
                <div className="text-[10px] text-slate-300 mt-1 font-medium">
                  {language === "bn" ? "কম্প্রেস" : "Compress"}
                </div>
              </div>
              <div
                onClick={() => setActiveSection("image-tools")}
                className="p-2.5 bg-slate-800/50 border border-slate-700/80 rounded hover:border-blue-500 cursor-pointer text-center transition-colors group"
              >
                <div className="text-lg group-hover:scale-110 transition-transform">📐</div>
                <div className="text-[10px] text-slate-300 mt-1 font-medium">
                  {language === "bn" ? "রিসাইজ" : "Resize"}
                </div>
              </div>
              <div
                onClick={() => setActiveSection("psd-manager")}
                className="p-2.5 bg-slate-800/50 border border-slate-700/80 rounded hover:border-blue-500 cursor-pointer text-center transition-colors group"
              >
                <div className="text-lg group-hover:scale-110 transition-transform">🖼️</div>
                <div className="text-[10px] text-slate-300 mt-1 font-medium">
                  {language === "bn" ? "পিএসডি ভিউ" : "PSD Preview"}
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Pro Box */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-xl p-4 flex flex-col gap-2 flex-1 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Assistant Pro
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Online
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
              {language === "bn"
                ? '"আমি ক্লাস ৭ এর \'জল দূষণ ও প্রতিকার\' স্কুল প্রজেক্ট তৈরি করতে প্রস্তুত।"'
                : '"I am ready to help you with \'Water Pollution\' project in Bengali for Class 7."'}
            </div>
            <div className="mt-auto space-y-2 pt-2">
              <div className="bg-slate-950/80 p-2 rounded text-[10px] border border-slate-800 text-slate-400 font-mono">
                • Chapter: Introduction generated
                <br />• Layout: 4 Photo placeholders aligned
              </div>
              <form onSubmit={handleAiAsk} className="flex gap-1.5">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={language === "bn" ? "AI কে যেকোনো বিষয় বলুন..." : "Ask AI anything..."}
                  className="flex-1 bg-slate-800 text-slate-200 text-[11px] border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  ➜
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            {language === "bn" ? "ক্যাফে ও স্টুডিও টুলস ডিরেক্টরি" : "Workstation Services Directory"}
          </h2>
          <span className="text-[11px] text-slate-400">
            {language === "bn" ? "ক্লিক করে সরাসরি ওপেন করুন" : "Click to launch"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                onClick={() => setActiveSection(srv.id)}
                className="p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    {srv.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 border border-slate-600">
                        {srv.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate">
                    {language === "bn" ? srv.titleBn : srv.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {language === "bn" ? srv.descriptionBn : srv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pinned Government Portals & Recent Customer Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pinned Government Portals */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              {language === "bn" ? "জরুরি সরকারি পোর্টাল ও লিংক" : "Essential Government Portals"}
            </h3>
            <button
              onClick={() => setActiveSection("govt-services")}
              className="text-[11px] text-blue-400 hover:underline cursor-pointer"
            >
              {language === "bn" ? "সবগুলো দেখুন" : "View All (30+)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pinnedGovtLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                    {language === "bn" ? link.bengaliName : link.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{link.category}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Customer Ledger Activity */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {language === "bn" ? "সাম্প্রতিক কাস্টমার খাতা" : "Recent Customer Activity"}
              </h3>
              <button
                onClick={() => setActiveSection("customer-manager")}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                {language === "bn" ? "খাতা খুলুন" : "Open CRM"}
              </button>
            </div>

            <div className="space-y-2">
              {customers.slice(0, 3).map((cust) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-800/40 border border-slate-700/40 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{cust.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{cust.service}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-slate-200">₹{cust.amount}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        cust.paidStatus === "paid"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {cust.paidStatus === "paid" ? "PAID" : "DUE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
