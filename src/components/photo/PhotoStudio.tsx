import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import {
  ImageFilterOptions,
  defaultImageFilters,
  renderFilteredCanvas,
  replaceStudioBackground,
  compressToTargetKB,
} from "../../services/imageTools";
import {
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Sliders,
  Sparkles,
  Download,
  Printer,
  Undo2,
  Redo2,
  RefreshCw,
  UserCheck,
  Grid,
  Check,
  Layers,
  ZoomIn,
  Eye,
  FileDown,
  Palette,
  FileSpreadsheet,
} from "lucide-react";

export const PhotoStudio: React.FC = () => {
  const { language, t, setSharedPhoto, setActiveSection, notify } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilterOptions>(defaultImageFilters);
  const [history, setHistory] = useState<ImageFilterOptions[]>([defaultImageFilters]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"adjust" | "background" | "export">("adjust");
  const [exportFormat, setExportFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [targetKb, setTargetKb] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify(language === "bn" ? "অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন" : "Please select an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      setFilters(defaultImageFilters);
      setHistory([defaultImageFilters]);
      setHistoryIndex(0);
    };
    reader.readAsDataURL(file);
  };

  const pushHistory = (newFilters: ImageFilterOptions) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newFilters);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setFilters(newFilters);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFilters(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFilters(history[historyIndex + 1]);
    }
  };

  // Re-render filtered preview whenever imageSrc or filters change
  useEffect(() => {
    let isCurrent = true;
    if (!imageSrc) {
      setPreviewUrl(null);
      return;
    }

    const render = async () => {
      try {
        const canvas = await renderFilteredCanvas(imageSrc, filters);
        if (isCurrent) {
          setPreviewUrl(canvas.toDataURL(exportFormat, 0.95));
        }
      } catch (err) {
        console.error("Preview render failed:", err);
      }
    };

    render();
    return () => {
      isCurrent = false;
    };
  }, [imageSrc, filters, exportFormat]);

  const handleBackgroundChange = async (color: string) => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const newImg = await replaceStudioBackground(imageSrc, color);
      setImageSrc(newImg);
      notify(
        language === "bn" ? "ব্যাকগ্রাউন্ড সফলভাবে পরিবর্তিত হয়েছে" : "Background updated successfully"
      );
    } catch (err) {
      console.error(err);
      notify("Failed to update background", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/webp" ? "webp" : "jpg";
    a.download = `Studio_Photo_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(language === "bn" ? "ছবি ডাউনলোড হয়েছে" : "Image downloaded");
  };

  const handleSendToPassport = () => {
    if (!previewUrl) return;
    setSharedPhoto(previewUrl);
    setActiveSection("passport-photo");
    notify(language === "bn" ? "পাসপোর্ট ফটো মেকারে ছবি পাঠানো হয়েছে" : "Photo sent to Passport Maker");
  };

  const handleSendToLayout = () => {
    if (!previewUrl) return;
    setSharedPhoto(previewUrl);
    setActiveSection("photo-print-layout");
    notify(language === "bn" ? "প্রিন্ট লেআউটে ছবি পাঠানো হয়েছে" : "Photo sent to Print Layout");
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.photoStudio.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{t.photoStudio.subtitle}</p>
          </div>
        </div>

        {/* Undo/Redo & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.common.undo}</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.common.redo}</span>
          </button>
          <button
            onClick={() => pushHistory(defaultImageFilters)}
            disabled={!imageSrc}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t.common.reset}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Image Canvas Viewport (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[480px]">
          {/* Canvas Box */}
          <div className="flex-1 flex items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 relative overflow-hidden">
            {previewUrl ? (
              <div className="relative group max-w-full max-h-[420px]">
                <img
                  src={previewUrl}
                  alt="Studio Preview"
                  className="max-h-[400px] max-w-full object-contain rounded-lg shadow-2xl transition-all"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span className="text-xs font-semibold text-slate-300">{t.common.loading}</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
                }}
                className="w-full h-72 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all hover:bg-slate-900/40 p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{t.photoStudio.uploadPrompt}</p>
                  <p className="text-xs text-slate-400 mt-1">{t.photoStudio.supportedFormats}</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {language === "bn" ? "কম্পিউটার থেকে ছবি বাছুন" : "Browse Image File"}
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </div>

          {/* Quick Flow Actions to other tools */}
          {previewUrl && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {language === "bn" ? "অন্য ছবি বদলান" : "Change Image"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendToPassport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "পাসপোর্ট ফটো বানান" : "Make Passport Photo"}</span>
                </button>
                <button
                  onClick={handleSendToLayout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "A4 প্রিন্ট লেআউটে পাঠান" : "Send to A4 Print Sheet"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls & Adjustments (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Tabs */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold mb-4">
              <button
                onClick={() => setActiveTab("adjust")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "adjust" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "কালার ও রোটেশন" : "Adjustments"}</span>
              </button>
              <button
                onClick={() => setActiveTab("background")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "background" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "ব্যাকগ্রাউন্ড" : "Background"}</span>
              </button>
              <button
                onClick={() => setActiveTab("export")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "export" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "এক্সপোর্ট / সেভ" : "Export"}</span>
              </button>
            </div>

            {/* Tab 1: Adjustments & Sliders */}
            {activeTab === "adjust" && (
              <div className="space-y-4 text-xs">
                {/* Rotations & Flips */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    {language === "bn" ? "ঘোরান ও ফ্লিপ" : "Rotation & Flip"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => pushHistory({ ...filters, rotate: (filters.rotate + 270) % 360 })}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex flex-col items-center gap-1 transition-colors"
                      title="Rotate 90 Left"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[10px]">-90°</span>
                    </button>
                    <button
                      onClick={() => pushHistory({ ...filters, rotate: (filters.rotate + 90) % 360 })}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex flex-col items-center gap-1 transition-colors"
                      title="Rotate 90 Right"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span className="text-[10px]">+90°</span>
                    </button>
                    <button
                      onClick={() => pushHistory({ ...filters, flipH: !filters.flipH })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                        filters.flipH
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      }`}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      <span className="text-[10px]">Flip H</span>
                    </button>
                    <button
                      onClick={() => pushHistory({ ...filters, flipV: !filters.flipV })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                        filters.flipV
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      }`}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-4 h-4" />
                      <span className="text-[10px]">Flip V</span>
                    </button>
                  </div>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.photoStudio.brightness}</span>
                    <span className="font-mono text-indigo-400 font-bold">{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={filters.brightness}
                    onChange={(e) => setFilters({ ...filters, brightness: Number(e.target.value) })}
                    onMouseUp={() => pushHistory(filters)}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.photoStudio.contrast}</span>
                    <span className="font-mono text-indigo-400 font-bold">{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={filters.contrast}
                    onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
                    onMouseUp={() => pushHistory(filters)}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.photoStudio.saturation}</span>
                    <span className="font-mono text-indigo-400 font-bold">{filters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => setFilters({ ...filters, saturation: Number(e.target.value) })}
                    onMouseUp={() => pushHistory(filters)}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sharpness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.photoStudio.sharpness}</span>
                    <span className="font-mono text-indigo-400 font-bold">{filters.sharpness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.sharpness}
                    onChange={(e) => setFilters({ ...filters, sharpness: Number(e.target.value) })}
                    onMouseUp={() => pushHistory(filters)}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.photoStudio.blur}</span>
                    <span className="font-mono text-indigo-400 font-bold">{filters.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.blur}
                    onChange={(e) => setFilters({ ...filters, blur: Number(e.target.value) })}
                    onMouseUp={() => pushHistory(filters)}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Studio Background Colors */}
            {activeTab === "background" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    {language === "bn" ? "স্টুডিও ব্যাকগ্রাউন্ড প্রিসেট" : "Studio Solid Color Replacement"}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {language === "bn"
                      ? "পাসপোর্ট ও অফিশিয়াল ফটোর জন্য ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে একরঙা করুন:"
                      : "Replace background with solid passport compliant colors:"}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleBackgroundChange("#ffffff")}
                      className="p-3 rounded-xl bg-white text-slate-900 border border-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-white border border-slate-400" />
                      <span>{t.photoStudio.removeBg}</span>
                    </button>
                    <button
                      onClick={() => handleBackgroundChange("#3b82f6")}
                      className="p-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-400" />
                      <span>{t.photoStudio.blueBg}</span>
                    </button>
                    <button
                      onClick={() => handleBackgroundChange("#ef4444")}
                      className="p-3 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-red-400" />
                      <span>{t.photoStudio.redBg}</span>
                    </button>
                    <button
                      onClick={() => handleBackgroundChange("#9ca3af")}
                      className="p-3 rounded-xl bg-slate-400 text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-300 border border-slate-600" />
                      <span>{t.photoStudio.greyBg}</span>
                    </button>
                  </div>
                </div>

                {/* Border Settings */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {language === "bn" ? "ফটোর বর্ডার / ফ্রেম" : "Photo Outline Border"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={filters.borderWidth || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFilters({ ...filters, borderWidth: val, borderColor: filters.borderColor || "#000000" });
                      }}
                      onMouseUp={() => pushHistory(filters)}
                      className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-slate-300">{filters.borderWidth || 0}px</span>
                    <input
                      type="color"
                      value={filters.borderColor || "#000000"}
                      onChange={(e) => {
                        setFilters({ ...filters, borderColor: e.target.value });
                        pushHistory({ ...filters, borderColor: e.target.value });
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      title="Border Color"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Export & Format */}
            {activeTab === "export" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {language === "bn" ? "ফাইল ফরম্যাট নির্বাচন" : "Export Format"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          exportFormat === fmt
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
                    onClick={handleDownload}
                    disabled={!previewUrl}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.photoStudio.downloadImage}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Direct Download Button at Bottom */}
          {activeTab !== "export" && (
            <button
              onClick={handleDownload}
              disabled={!previewUrl}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.photoStudio.downloadImage}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
