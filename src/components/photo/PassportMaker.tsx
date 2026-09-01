import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { PassportPreset, defaultPassportPresets } from "../../types";
import {
  loadImage,
  resizeToDimensions,
  replaceStudioBackground,
} from "../../services/imageTools";
import {
  Upload,
  UserCheck,
  Grid,
  Download,
  Scissors,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  Check,
  RefreshCw,
  Palette,
  Printer,
  Undo,
} from "lucide-react";

export const PassportMaker: React.FC = () => {
  const { language, t, sharedPhoto, setSharedPhoto, setActiveSection, notify } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(sharedPhoto || null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(defaultPassportPresets[0]);
  const [customWidthMm, setCustomWidthMm] = useState<number>(35);
  const [customHeightMm, setCustomHeightMm] = useState<number>(45);
  const [customName, setCustomName] = useState<string>("Custom Size");
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [hasBorder, setHasBorder] = useState<boolean>(true);
  const [borderColor, setBorderColor] = useState<string>("#000000");
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [dpi, setDpi] = useState<number>(300);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedPassportUrl, setCroppedPassportUrl] = useState<string | null>(null);

  // Zoom / Pan offsets for manual face alignment inside passport crop frame
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // If shared photo changed from outside
  useEffect(() => {
    if (sharedPhoto) {
      setImageSrc(sharedPhoto);
    }
  }, [sharedPhoto]);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify(language === "bn" ? "অনুগ্রহ করে একটি ছবি দিন" : "Please upload an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const getActiveDimensions = () => {
    if (selectedPreset.id === "custom") {
      return { widthMm: customWidthMm, heightMm: customHeightMm };
    }
    return { widthMm: selectedPreset.widthMm, heightMm: selectedPreset.heightMm };
  };

  // Render passport output onto canvas
  useEffect(() => {
    let isCurrent = true;
    if (!imageSrc) {
      setCroppedPassportUrl(null);
      return;
    }

    const render = async () => {
      try {
        const { widthMm, heightMm } = getActiveDimensions();
        const mmToInches = 1 / 25.4;
        const targetWidthPx = Math.round(widthMm * mmToInches * dpi);
        const targetHeightPx = Math.round(heightMm * mmToInches * dpi);

        const img = await loadImage(imageSrc);
        const canvas = document.createElement("canvas");
        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Background color
        if (selectedPreset.bgColor && selectedPreset.bgColor !== "transparent") {
          ctx.fillStyle = selectedPreset.bgColor;
          ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
        }

        // Draw image with zoom and pan
        const baseRatio = Math.max(targetWidthPx / img.width, targetHeightPx / img.height);
        const drawWidth = img.width * baseRatio * zoom;
        const drawHeight = img.height * baseRatio * zoom;
        const drawX = (targetWidthPx - drawWidth) / 2 + offsetX;
        const drawY = (targetHeightPx - drawHeight) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Optional Border
        if (hasBorder && borderWidth > 0) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth * 2;
          ctx.strokeRect(0, 0, targetWidthPx, targetHeightPx);
        }

        if (isCurrent) {
          setCroppedPassportUrl(canvas.toDataURL("image/jpeg", 0.98));
        }
      } catch (err) {
        console.error("Passport rendering error:", err);
      }
    };

    render();
    return () => {
      isCurrent = false;
    };
  }, [
    imageSrc,
    selectedPreset,
    customWidthMm,
    customHeightMm,
    dpi,
    zoom,
    offsetX,
    offsetY,
    hasBorder,
    borderWidth,
    borderColor,
  ]);

  const handleBgColor = async (color: string) => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const newImg = await replaceStudioBackground(imageSrc, color);
      setImageSrc(newImg);
      notify(language === "bn" ? "ব্যাকগ্রাউন্ড পরিবর্তন হয়েছে" : "Background color updated");
    } catch (e) {
      notify("Failed to change background", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = () => {
    if (!croppedPassportUrl) return;
    const a = document.createElement("a");
    a.href = croppedPassportUrl;
    a.download = `Passport_${selectedPreset.name.replace(/\s+/g, "_")}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(language === "bn" ? "পাসপোর্ট ফটো ডাউনলোড হয়েছে" : "Passport photo downloaded");
  };

  const handleSendToPrintLayout = () => {
    if (!croppedPassportUrl) return;
    setSharedPhoto(croppedPassportUrl);
    setActiveSection("photo-print-layout");
    notify(
      language === "bn"
        ? "ছবিটি A4 প্রিন্ট লেআউটে পাঠানো হয়েছে"
        : "Passport photo sent to A4 Multi-Photo Print layout"
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.passportMaker.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t.passportMaker.subtitle}</p>
        </div>

        {croppedPassportUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendToPrintLayout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>{language === "bn" ? "A4 পেজে একাধিক কপি প্রিন্ট" : "Print on A4 Sheet"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Passport Viewport (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[460px]">
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
            {imageSrc ? (
              <div className="relative flex flex-col items-center">
                {/* Passport Frame with 35x45 ratio simulation */}
                <div
                  className="relative overflow-hidden rounded-md shadow-2xl bg-white flex items-center justify-center border-2 border-slate-700"
                  style={{
                    width: "240px",
                    height: `${Math.round(240 * (getActiveDimensions().heightMm / getActiveDimensions().widthMm))}px`,
                    maxHeight: "340px",
                  }}
                >
                  {croppedPassportUrl ? (
                    <img
                      src={croppedPassportUrl}
                      alt="Passport Crop"
                      className="w-full h-full object-cover"
                    />
                  ) : null}

                  {/* Face Guide Oval Overlay */}
                  {showFaceGuide && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-[62%] h-[68%] border-2 border-dashed border-cyan-400/80 rounded-[50%] shadow-inner" />
                      <div className="absolute top-[38%] w-full h-[1px] bg-cyan-400/40" />
                      <div className="absolute top-[58%] w-[50%] h-[1px] bg-cyan-400/40" />
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Face Alignment Tip */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {language === "bn"
                      ? "মুখমণ্ডলের সঠিক অবস্থানের জন্য জুম ও প্যান স্লাইডার ব্যবহার করুন"
                      : "Use sliders below to align head & chin within guide oval"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all hover:bg-slate-900/40 p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {language === "bn" ? "পাসপোর্ট ফটো তৈরির জন্য ছবি আপলোড করুন" : "Upload Photo for Passport"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {language === "bn" ? "ছবি ফাইল বাছুন" : "Browse Image"}
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </div>

          {/* Zoom & Alignment Sliders */}
          {imageSrc && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t.passportMaker.zoom}</span>
                <span className="font-mono text-indigo-400 font-bold">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="2.2"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{language === "bn" ? "ডান-বাম" : "Pan X"}</span>
                    <span className="font-mono text-slate-300">{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{language === "bn" ? "উপর-নিচ" : "Pan Y"}</span>
                    <span className="font-mono text-slate-300">{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Presets & Configurations (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Presets List */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t.passportMaker.presets}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {defaultPassportPresets.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm"
                          : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{preset.dimensionText || `${preset.widthMm} x ${preset.heightMm} mm`}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Dimensions if selected */}
            {selectedPreset.id === "custom" && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">{t.passportMaker.customSize}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Width (mm)</label>
                    <input
                      type="number"
                      value={customWidthMm}
                      onChange={(e) => setCustomWidthMm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Height (mm)</label>
                    <input
                      type="number"
                      value={customHeightMm}
                      onChange={(e) => setCustomHeightMm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Background Color Shortcuts */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t.passportMaker.changeBackground}
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => handleBgColor("#ffffff")}
                  className="py-2 px-2 rounded-xl bg-white text-slate-900 border border-slate-300 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                  <span>White</span>
                </button>
                <button
                  onClick={() => handleBgColor("#3b82f6")}
                  className="py-2 px-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-blue-300" />
                  <span>Blue</span>
                </button>
                <button
                  onClick={() => handleBgColor("#ef4444")}
                  className="py-2 px-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-red-300" />
                  <span>Red</span>
                </button>
                <button
                  onClick={() => handleBgColor("#9ca3af")}
                  className="py-2 px-2 rounded-xl bg-slate-400 text-slate-900 font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-600" />
                  <span>Grey</span>
                </button>
              </div>
            </div>

            {/* Options: Face Guide & Border */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showFaceGuide}
                  onChange={(e) => setShowFaceGuide(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 accent-indigo-600"
                />
                <span>{t.passportMaker.showFaceGuide}</span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasBorder}
                    onChange={(e) => setHasBorder(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 accent-indigo-600"
                  />
                  <span>{t.passportMaker.addBorder}</span>
                </label>

                {hasBorder && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                    />
                    <span className="text-[10px] text-slate-400">px</span>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleDownloadSingle}
              disabled={!croppedPassportUrl}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === "bn" ? "সিঙ্গেল ফটো ডাউনলোড" : "Download Single"}</span>
            </button>

            <button
              onClick={handleSendToPrintLayout}
              disabled={!croppedPassportUrl}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>{t.passportMaker.sendToPrintLayout}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
