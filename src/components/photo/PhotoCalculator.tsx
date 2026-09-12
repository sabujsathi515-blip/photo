import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import {
  Calculator,
  BadgeIndianRupee,
  TrendingUp,
  Percent,
  Layers,
  Printer,
  Sparkles,
  PieChart,
} from "lucide-react";

export const PhotoCalculator: React.FC = () => {
  const { language, t, profile } = useApp();

  const [printType, setPrintType] = useState<"passport" | "a4_photo" | "doc_bw" | "doc_color">("passport");
  const [copies, setCopies] = useState<number>(8);
  const [paperCostPerSheet, setPaperCostPerSheet] = useState<number>(5.5); // 180 GSM photo paper sheet
  const [inkCostPerSheet, setInkCostPerSheet] = useState<number>(3.0); // 6-ink tank estimated
  const [electricityAndLami, setElectricityAndLami] = useState<number>(1.5);
  const [customerRate, setCustomerRate] = useState<number>(60); // Customer charge

  const totalCost = paperCostPerSheet + inkCostPerSheet + electricityAndLami;
  const netProfit = customerRate - totalCost;
  const profitMargin = customerRate > 0 ? Math.round((netProfit / customerRate) * 100) : 0;

  const handleTypeChange = (type: "passport" | "a4_photo" | "doc_bw" | "doc_color") => {
    setPrintType(type);
    if (type === "passport") {
      setCopies(8);
      setPaperCostPerSheet(5.5);
      setInkCostPerSheet(3.0);
      setElectricityAndLami(1.5);
      setCustomerRate(60);
    } else if (type === "a4_photo") {
      setCopies(1);
      setPaperCostPerSheet(8.0);
      setInkCostPerSheet(12.0);
      setElectricityAndLami(4.0);
      setCustomerRate(80);
    } else if (type === "doc_bw") {
      setCopies(1);
      setPaperCostPerSheet(0.8);
      setInkCostPerSheet(0.4);
      setElectricityAndLami(0.3);
      setCustomerRate(3);
    } else {
      setCopies(1);
      setPaperCostPerSheet(1.0);
      setInkCostPerSheet(2.5);
      setElectricityAndLami(0.5);
      setCustomerRate(10);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {language === "bn" ? "প্রিন্ট ও ফটো খরচ ও লাভ ক্যালকুলেটর" : "Photo & Print Profit Estimator"}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === "bn"
                ? "কাগজ, কালি ও বিদ্যুৎ খরচের সঠিক হিসাব দেখে কাস্টমার রেট এবং নেট প্রফিট মার্জিন নির্ধারণ করুন।"
                : "Accurate breakdown of paper, ink, electricity vs customer pricing and net margins."}
            </p>
          </div>
        </div>
      </div>

      {/* Preset Service Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "passport", labelBn: "পাসপোর্ট ফটো (৮ কপি)", labelEn: "Passport (8 Copies)" },
          { id: "a4_photo", labelBn: "A4 ফুল গ্লসি ফটো", labelEn: "A4 Full Glossy Photo" },
          { id: "doc_color", labelBn: "কালার জেরক্স / প্রিন্ট", labelEn: "Color Xerox / Print" },
          { id: "doc_bw", labelBn: "সাদা-কালো (B&W) জেরক্স", labelEn: "B&W Xerox / Print" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTypeChange(item.id as any)}
            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center ${
              printType === item.id
                ? "bg-amber-600/20 border-amber-500 text-amber-300 shadow-md"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
          >
            {language === "bn" ? item.labelBn : item.labelEn}
          </button>
        ))}
      </div>

      {/* Calculator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            {language === "bn" ? "খরচ ও মূল্যের বিবরণ" : "Cost Breakdown & Customer Rate"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">
                {language === "bn" ? "কাগজের খরচ প্রতি পাতা (₹)" : "Photo Paper Cost / Sheet (₹)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={paperCostPerSheet}
                  onChange={(e) => setPaperCostPerSheet(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">
                {language === "bn" ? "কালির (Ink) আনুমানিক খরচ (₹)" : "Ink Tank Usage Cost (₹)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={inkCostPerSheet}
                onChange={(e) => setInkCostPerSheet(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">
                {language === "bn" ? "বিদ্যুৎ, পরিধান ও অন্যান্য (₹)" : "Electricity & Misc Overhead (₹)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={electricityAndLami}
                onChange={(e) => setElectricityAndLami(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-amber-400 block mb-1.5 font-bold">
                {language === "bn" ? "কাস্টমারের থেকে ধার্য রেট (₹)" : "Customer Selling Rate (₹)"}
              </label>
              <input
                type="number"
                value={customerRate}
                onChange={(e) => setCustomerRate(Number(e.target.value))}
                className="w-full bg-amber-950/40 border border-amber-600/50 rounded-xl px-3 py-2 text-amber-200 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Financial Calculation Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {language === "bn" ? "প্রতি শিট নেট লাভ বিশ্লেষণ" : "Per Sheet Profit Analysis"}
            </span>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800">
                <span className="text-slate-400">{language === "bn" ? "সর্বমোট উৎপাদন খরচ:" : "Total Production Cost:"}</span>
                <span className="font-mono font-bold text-rose-400">₹{totalCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800">
                <span className="text-slate-400">{language === "bn" ? "কাস্টমার বিল:" : "Customer Invoice Amount:"}</span>
                <span className="font-mono font-bold text-indigo-300">₹{customerRate.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm py-3 bg-emerald-950/40 px-3 rounded-xl border border-emerald-800/60">
                <span className="font-bold text-emerald-300">{language === "bn" ? "নেট প্রফিট (লাভ):" : "Net Profit:"}</span>
                <span className="font-mono font-black text-xl text-emerald-400">₹{netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">{language === "bn" ? "প্রফিট মার্জিন" : "Profit Margin"}</span>
              <span className="text-2xl font-black font-mono text-cyan-300">{profitMargin}%</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
