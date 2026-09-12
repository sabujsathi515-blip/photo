import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import { psdTemplates, PsdTemplate } from "../../data/psdTemplates";
import {
  FolderArchive,
  Search,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCode,
  Tag,
  Eye,
  Filter,
} from "lucide-react";

export const PsdManager: React.FC = () => {
  const { language, t, notify } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<PsdTemplate | null>(null);

  const categories = [
    { id: "all", labelBn: "সমস্ত টেমপ্লেট", labelEn: "All PSD Templates" },
    { id: "passport", labelBn: "পাসপোর্ট ও স্টুডিও", labelEn: "Passport & Photo Studio" },
    { id: "visiting_card", labelBn: "ভিজিটিং কার্ড", labelEn: "Visiting Cards" },
    { id: "certificate", labelBn: "সার্টিফিকেট", labelEn: "Certificates" },
    { id: "flex_banner", labelBn: "ফ্লেক্স ব্যানার", labelEn: "Flex Banners" },
    { id: "marriage", labelBn: "বিবাহ ও নিমন্ত্রণ", labelEn: "Wedding & Cards" },
    { id: "school", labelBn: "স্কুল প্রজেক্ট ফ্রেম", labelEn: "School Project Frames" },
  ];

  const filteredTemplates = psdTemplates.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleDownload = (tpl: PsdTemplate) => {
    // Generate a mock download artifact JSON/ZIP descriptor with smart layer manifest
    const manifest = {
      templateName: tpl.title,
      resolution: tpl.resolution,
      layers: tpl.layers,
      recommendedFonts: tpl.fonts,
      generatedBy: "DIGITAL SEVA PRO Cyber Cafe Suite",
      createdDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tpl.id}_smart_psd_bundle.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(
      language === "bn"
        ? `"${tpl.titleBn}" স্মার্ট বান্ডিল প্রস্তুত হয়েছে`
        : `Downloaded "${tpl.title}" template package`
    );
  };

  const handleOpenPhotopea = (tpl: PsdTemplate) => {
    window.open(`https://www.photopea.com`, "_blank");
    notify(
      language === "bn" ? "Photopea অনলাইন ফটোশপ এডিটর খোলা হয়েছে" : "Opening Photopea Online Editor"
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-indigo-400" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.psdManager.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.psdManager.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open("https://www.photopea.com", "_blank")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{language === "bn" ? "Photopea এডিটর খুলুন" : "Open Photopea"}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "bn"
                ? "PSD টেমপ্লেট সার্চ করুন (যেমন: পাসপোর্ট, বিয়ের কার্ড, ব্যানার, ৩X৩ ফ্রেম)..."
                : "Search PSD templates by name, tag, or category..."
            }
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "bn" ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-lg"
          >
            {/* Thumbnail Preview Area */}
            <div className="h-44 bg-slate-950 relative flex items-center justify-center p-4 border-b border-slate-800 overflow-hidden">
              <img
                src={tpl.thumbnailUrl}
                alt={tpl.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                  {tpl.resolution}
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-mono text-slate-300 border border-slate-800">
                  {tpl.fileSize}
                </span>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm line-clamp-1">
                  {language === "bn" ? tpl.titleBn : tpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {language === "bn" ? tpl.descriptionBn : tpl.description}
                </p>

                {/* Meta details */}
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{tpl.layers} Layers</span>
                  </span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {tpl.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenPhotopea(tpl)}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Photopea</span>
                </button>
                <button
                  onClick={() => handleDownload(tpl)}
                  className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
