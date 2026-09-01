import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { govServices, GovServiceCategory } from "../../data/govServices";
import {
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  FileText,
  Tag,
  Sparkles,
} from "lucide-react";

export const GovServicesDirectory: React.FC = () => {
  const { language, t, notify } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dsp_bookmarked_gov");
      return saved ? JSON.parse(saved) : ["uidai", "banglarbhumi", "lakshmir_bhandar", "wbprb"];
    } catch {
      return ["uidai", "banglarbhumi", "lakshmir_bhandar", "wbprb"];
    }
  });

  const categories = [
    { id: "all", labelBn: "সমস্ত সার্ভিস", labelEn: "All Services" },
    { id: "identity", labelBn: "আধার / ভোটার / প্যান", labelEn: "Identity & Cards" },
    { id: "wb_schemes", labelBn: "পশ্চিমবঙ্গ সরকারি প্রকল্প", labelEn: "WB Schemes" },
    { id: "land_revenue", labelBn: "বাংলারভূমি ও জমি মিউটেশন", labelEn: "Land & Property" },
    { id: "scholarship", labelBn: "স্কলারশিপ ও শিক্ষা", labelEn: "Scholarships & Edu" },
    { id: "jobs", labelBn: "চাকরির রিক্রুটমেন্ট", labelEn: "Jobs & Recruitment" },
    { id: "certificates", labelBn: "সার্টিফিকেট ও বিদ্যুৎ বিল", labelEn: "Certificates & Bills" },
    { id: "business", labelBn: "GST, MSME ও ইনকাম ট্যাক্স", labelEn: "Business & Tax" },
  ];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("dsp_bookmarked_gov", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredServices = govServices.filter((srv) => {
    const matchesCat = activeCategory === "all" || srv.category === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.portalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.govServices.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.govServices.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60">
          <ShieldCheck className="w-4 h-4" />
          <span>{language === "bn" ? "ভেরিফায়েড অফিসিয়াল সরকারি পোর্টাল লিঙ্ক" : "Verified Official Govt Portals"}</span>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "bn"
                ? "সরকারি পোর্টাল সার্চ করুন (যেমন: আধার, লক্ষ্মীর ভাণ্ডার, বাংলারভূমি, রিক্রুটমেন্ট, কাস্ট সার্টিফিকেট)..."
                : "Search portal by name, scheme or service (Aadhaar, Banglarbhumi, Scholarship, WB Police)..."
            }
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
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
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "bn" ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map((srv) => {
          const isFav = bookmarkedIds.includes(srv.id);
          return (
            <div
              key={srv.id}
              onClick={() => handleOpenLink(srv.url)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 rounded-2xl p-4 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{srv.icon}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => toggleBookmark(srv.id, e)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isFav
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                    {language === "bn" ? srv.nameBn : srv.name}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400/90 block mt-0.5">
                    {srv.portalName}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {language === "bn" ? srv.descriptionBn : srv.description}
                  </p>
                </div>

                {/* Required Documents Badge */}
                {srv.requiredDocs && srv.requiredDocs.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {language === "bn" ? "প্রয়োজনীয় ডকুমেন্টস:" : "Required Docs:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {srv.requiredDocs.slice(0, 3).map((doc, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 border border-slate-800"
                        >
                          {doc}
                        </span>
                      ))}
                      {srv.requiredDocs.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono self-center">
                          +{srv.requiredDocs.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Link Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400">
                <span className="font-medium">{t.govServices.openPortal}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
