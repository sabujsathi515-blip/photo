import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { compressToTargetKB, resizeToDimensions } from "../../services/imageTools";
import {
  Image as ImageIcon,
  Upload,
  Sliders,
  Download,
  FileCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Layers,
  ShieldCheck,
} from "lucide-react";

export const ImageTools: React.FC = () => {
  const { language, t, notify } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState<number>(30);
  const [targetDpi, setTargetDpi] = useState<number>(200);
  const [widthMm, setWidthMm] = useState<number>(35);
  const [heightMm, setHeightMm] = useState<number>(45);
  const [targetFormat, setTargetFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<{
    dataUrl: string;
    actualKB: number;
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify(language === "bn" ? "ছবি ফাইল নির্বাচন করুন" : "Please select an image", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setProcessedResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!imageSrc) return;
    setIsCompressing(true);
    try {
      // First resize to dimension/DPI if selected
      const resized = await resizeToDimensions(imageSrc, widthMm, heightMm, targetDpi);
      // Then compress to exact KB limit
      const result = await compressToTargetKB(resized, targetKb, targetFormat);
      setProcessedResult(result);
      notify(
        language === "bn"
          ? `ফটো সাইজ সফলভাবে ${result.actualKB} KB-তে প্রস্তুত হয়েছে`
          : `Image successfully compressed to ${result.actualKB} KB`
      );
    } catch (err) {
      console.error(err);
      notify("Compression failed", "error");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!processedResult) return;
    const a = document.createElement("a");
    a.href = processedResult.dataUrl;
    const ext = targetFormat === "image/png" ? "png" : targetFormat === "image/webp" ? "webp" : "jpg";
    a.download = `Doc_Resized_${processedResult.actualKB}KB.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Job portal quick presets
  const applyPreset = (preset: "signature" | "wb_police_photo" | "ssc_photo" | "upsc_photo") => {
    if (preset === "signature") {
      setTargetKb(15);
      setWidthMm(45);
      setHeightMm(20);
      setTargetDpi(200);
    } else if (preset === "wb_police_photo") {
      setTargetKb(30);
      setWidthMm(35);
      setHeightMm(45);
      setTargetDpi(200);
    } else if (preset === "ssc_photo") {
      setTargetKb(40);
      setWidthMm(35);
      setHeightMm(45);
      setTargetDpi(200);
    } else {
      setTargetKb(50);
      setWidthMm(35);
      setHeightMm(45);
      setTargetDpi(300);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {language === "bn"
              ? "অনলাইন ফর্ম ফটো ও সিগনেচার সাইজ টুল (KB & DPI)"
              : "Govt Job Photo & Signature Resizer (KB & DPI)"}
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {language === "bn"
            ? "SSC, WBCS, WB Police, Railway ও NSDL পোর্টালের জন্য নির্দিষ্ট KB (১০-২০ KB Signature, ২০-৫০ KB Photo) ও DPI সাইজ নির্ধারণ করুন।"
            : "Compress exactly to 10-20KB signatures and 20-50KB photos with 200/300 DPI for government portals."}
        </p>
      </div>

      {/* Quick Portal Presets */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          {language === "bn" ? "জনপ্রিয় চাকরির ফর্ম প্রিসেট" : "Popular Exam Portal Presets"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset("signature")}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-indigo-400">
              {language === "bn" ? "স্বাক্ষর (Signature)" : "Signature (10-20 KB)"}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">45x20mm @ 200 DPI</p>
          </button>
          <button
            onClick={() => applyPreset("wb_police_photo")}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-indigo-400">WB Police / WBPRB</div>
            <p className="text-[10px] text-slate-400 mt-0.5">20-50 KB @ 200 DPI</p>
          </button>
          <button
            onClick={() => applyPreset("ssc_photo")}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-indigo-400">SSC CGL / CHSL / MTS</div>
            <p className="text-[10px] text-slate-400 mt-0.5">20-50 KB @ 200 DPI</p>
          </button>
          <button
            onClick={() => applyPreset("upsc_photo")}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-indigo-400">UPSC / WBCS / Bank</div>
            <p className="text-[10px] text-slate-400 mt-0.5">30-100 KB @ 300 DPI</p>
          </button>
        </div>
      </div>

      {/* Main Resizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upload and Result Preview (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[420px]">
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800 p-4">
            {processedResult ? (
              <div className="text-center space-y-3">
                <img
                  src={processedResult.dataUrl}
                  alt="Processed"
                  className="max-h-[260px] max-w-full object-contain rounded-lg shadow-xl border border-slate-700 bg-white"
                />
                <div className="flex items-center justify-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Size: {processedResult.actualKB} KB
                  </span>
                  <span className="text-slate-400">
                    {processedResult.width} x {processedResult.height} px
                  </span>
                </div>
              </div>
            ) : imageSrc ? (
              <div className="text-center space-y-3">
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-h-[260px] max-w-full object-contain rounded-lg shadow-xl"
                />
                <p className="text-xs text-slate-400">
                  {language === "bn" ? "ডানদিকের বাটনে ক্লিক করে প্রসেস করুন" : "Click Process button to compress"}
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all hover:bg-slate-900/40 p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  {language === "bn" ? "ফটো বা স্বাক্ষর ফাইল আপলোড করুন" : "Upload Photo or Signature"}
                </p>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {language === "bn" ? "ফাইল বাছুন" : "Browse File"}
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>

          {processedResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-400 hover:text-white"
              >
                {language === "bn" ? "অন্য ফাইল" : "Change File"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === "bn" ? "ডাউনলোড ফাইল" : "Download File"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Target KB, Dimensions & DPI Controls (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1.5">
              <span>{language === "bn" ? "টার্গেট সর্বোচ্চ সাইজ (KB)" : "Target File Size Limit (KB)"}</span>
              <span className="font-mono text-indigo-400 text-sm font-extrabold">{targetKb} KB</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
              className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>10 KB (Signatures)</span>
              <span>50 KB (Photos)</span>
              <span>200 KB (Govt ID)</span>
            </div>
          </div>

          {/* Physical Dimensions (mm) */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
            <span className="font-bold text-slate-200 block">{language === "bn" ? "কাগজের সাইজ (মিমি)" : "Print Dimensions (mm)"}</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={widthMm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Height (mm)</label>
                <input
                  type="number"
                  value={heightMm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* DPI Resolution */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {language === "bn" ? "ডিপিআই রেজোলিউশন (DPI)" : "Target Resolution (DPI)"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[150, 200, 300].map((d) => (
                <button
                  key={d}
                  onClick={() => setTargetDpi(d)}
                  className={`py-2 rounded-xl border font-bold transition-all ${
                    targetDpi === d
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {language === "bn" ? "আউটপুট ফরম্যাট" : "Output File Format"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`py-2 rounded-xl border font-bold transition-all ${
                    targetFormat === fmt
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                  }`}
                >
                  {fmt === "image/jpeg" ? "JPG" : fmt === "image/png" ? "PNG" : "WEBP"}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleProcess}
              disabled={!imageSrc || isCompressing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isCompressing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "bn" ? "প্রসেস হচ্ছে..." : "Compressing..."}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{language === "bn" ? "রিসাইজ ও কম্প্রেস করুন" : "Resize & Compress Now"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
