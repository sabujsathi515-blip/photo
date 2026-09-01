import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { loadImage } from "../../services/imageTools";
import { jsPDF } from "jspdf";
import {
  Upload,
  Printer,
  Download,
  Grid,
  Scissors,
  Layers,
  Sparkles,
  Sliders,
  Check,
  FileDown,
  RotateCw,
  Plus,
  Minus,
  RefreshCw,
  ShieldCheck,
  Building,
} from "lucide-react";

type PageSize = "a4" | "4r" | "5x7";

export const PhotoPrintLayout: React.FC = () => {
  const { language, t, sharedPhoto, setSharedPhoto, profile, notify } = useApp();
  const [photoSrc, setPhotoSrc] = useState<string | null>(sharedPhoto || null);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [copies, setCopies] = useState<number>(8);
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [showCafeHeader, setShowCafeHeader] = useState<boolean>(true);
  const [marginMm, setMarginMm] = useState<number>(8);
  const [gapMm, setGapMm] = useState<number>(3);
  const [photoWidthMm, setPhotoWidthMm] = useState<number>(35);
  const [photoHeightMm, setPhotoHeightMm] = useState<number>(45);
  const [layoutPreviewUrl, setLayoutPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (sharedPhoto) {
      setPhotoSrc(sharedPhoto);
    }
  }, [sharedPhoto]);

  // Page dimensions in MM (300 DPI)
  const getPageDimensionsMm = () => {
    switch (pageSize) {
      case "4r":
        return { width: 102, height: 152 }; // 4x6 inch
      case "5x7":
        return { width: 127, height: 178 };
      case "a4":
      default:
        return { width: 210, height: 297 };
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify(language === "bn" ? "অনুগ্রহ করে ছবি ফাইল দিন" : "Please upload an image", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Re-generate layout canvas
  useEffect(() => {
    let isCurrent = true;
    if (!photoSrc) {
      setLayoutPreviewUrl(null);
      return;
    }

    const generateLayout = async () => {
      try {
        const dpi = 300;
        const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);
        const { width: pageWMm, height: pageHMm } = getPageDimensionsMm();

        const canvasW = mmToPx(pageWMm);
        const canvasH = mmToPx(pageHMm);

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Header watermark / shop info
        let headerOffsetPx = 0;
        if (showCafeHeader) {
          headerOffsetPx = mmToPx(12);
          ctx.fillStyle = "#1e293b";
          ctx.font = `bold ${mmToPx(3.5)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(profile.name.toUpperCase(), canvasW / 2, mmToPx(7));
          ctx.font = `${mmToPx(2.2)}px sans-serif`;
          ctx.fillStyle = "#64748b";
          ctx.fillText(`${profile.phone}  |  ${profile.address}`, canvasW / 2, mmToPx(10.5));
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = mmToPx(0.3);
          ctx.beginPath();
          ctx.moveTo(mmToPx(marginMm), mmToPx(11.8));
          ctx.lineTo(canvasW - mmToPx(marginMm), mmToPx(11.8));
          ctx.stroke();
        }

        const img = await loadImage(photoSrc);

        const pWPx = mmToPx(photoWidthMm);
        const pHPx = mmToPx(photoHeightMm);
        const gapPx = mmToPx(gapMm);
        const marginPx = mmToPx(marginMm);

        const startY = marginPx + headerOffsetPx;
        const availWidth = canvasW - marginPx * 2;
        const availHeight = canvasH - startY - marginPx;

        // Calculate columns and rows that fit
        const cols = Math.max(1, Math.floor((availWidth + gapPx) / (pWPx + gapPx)));
        const rows = Math.max(1, Math.floor((availHeight + gapPx) / (pHPx + gapPx)));

        const totalSlots = cols * rows;
        const itemsToDraw = Math.min(copies, totalSlots);

        for (let i = 0; i < itemsToDraw; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);

          const x = marginPx + col * (pWPx + gapPx);
          const y = startY + row * (pHPx + gapPx);

          // Draw Photo
          ctx.drawImage(img, x, y, pWPx, pHPx);

          // Photo subtle hairline border
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = mmToPx(0.2);
          ctx.strokeRect(x, y, pWPx, pHPx);

          // Scissor Cut Guide Marks at 4 corners
          if (showCutMarks) {
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = mmToPx(0.25);
            const markLen = mmToPx(2);

            // Top-left
            ctx.beginPath();
            ctx.moveTo(x - gapPx / 2, y);
            ctx.lineTo(x - gapPx / 2 - markLen, y);
            ctx.moveTo(x, y - gapPx / 2);
            ctx.lineTo(x, y - gapPx / 2 - markLen);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(x + pWPx + gapPx / 2, y + pHPx);
            ctx.lineTo(x + pWPx + gapPx / 2 + markLen, y + pHPx);
            ctx.moveTo(x + pWPx, y + pHPx + gapPx / 2);
            ctx.lineTo(x + pWPx, y + pHPx + gapPx / 2 + markLen);
            ctx.stroke();
          }
        }

        if (isCurrent) {
          setLayoutPreviewUrl(canvas.toDataURL("image/jpeg", 0.96));
        }
      } catch (err) {
        console.error("Layout generation error:", err);
      }
    };

    generateLayout();
    return () => {
      isCurrent = false;
    };
  }, [
    photoSrc,
    pageSize,
    copies,
    showCutMarks,
    showCafeHeader,
    marginMm,
    gapMm,
    photoWidthMm,
    photoHeightMm,
    profile,
  ]);

  const handlePrint = () => {
    if (!layoutPreviewUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notify("Please allow popups to open print preview", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DIGITAL SEVA PRO - Photo Print (${pageSize.toUpperCase()})</title>
          <style>
            @page {
              size: ${pageSize === "4r" ? "4in 6in" : pageSize === "5x7" ? "5in 7in" : "A4"};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${layoutPreviewUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadJpg = () => {
    if (!layoutPreviewUrl) return;
    const a = document.createElement("a");
    a.href = layoutPreviewUrl;
    a.download = `Photo_Print_Sheet_${pageSize.toUpperCase()}_${copies}Copies_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(language === "bn" ? "প্রিন্ট শিট ডাউনলোড হয়েছে" : "Print sheet downloaded");
  };

  const handleDownloadPdf = () => {
    if (!layoutPreviewUrl) return;
    const { width, height } = getPageDimensionsMm();
    const pdf = new jsPDF({
      orientation: width > height ? "landscape" : "portrait",
      unit: "mm",
      format: [width, height],
    });
    pdf.addImage(layoutPreviewUrl, "JPEG", 0, 0, width, height);
    pdf.save(`Photo_Print_${pageSize.toUpperCase()}_${copies}Copies.pdf`);
    notify(language === "bn" ? "পিডিএফ প্রস্তুত হয়েছে" : "PDF ready");
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.photoPrintLayout.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t.photoPrintLayout.subtitle}</p>
        </div>

        {layoutPreviewUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.photoPrintLayout.directPrint}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-rose-400" />
              <span>PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Sheet Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[500px]">
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
            {layoutPreviewUrl ? (
              <div className="relative group max-w-full">
                <img
                  src={layoutPreviewUrl}
                  alt="A4 Sheet Preview"
                  className="max-h-[460px] max-w-full object-contain rounded shadow-2xl border border-slate-700 bg-white"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all hover:bg-slate-900/40 p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {language === "bn" ? "প্রিন্ট করার জন্য ছবি বা পাসপোর্ট ফটো আপলোড করুন" : "Upload Photo for Print Layout"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">A4 / 4R Glossy Sheet Ready</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {language === "bn" ? "ছবি ফাইল নির্বাচন করুন" : "Select Photo"}
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

          {/* Quick Print Bottom Bar */}
          {layoutPreviewUrl && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {language === "bn" ? "অন্য ছবি বদলান" : "Change Photo"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJpg}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JPG</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.photoPrintLayout.directPrint}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Layout Configs & Copies (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4 text-xs">
            {/* Paper Size Selection */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t.photoPrintLayout.pageSize}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["a4", "4r", "5x7"] as const).map((ps) => (
                  <button
                    key={ps}
                    onClick={() => setPageSize(ps)}
                    className={`py-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                      pageSize === ps
                        ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                    }`}
                  >
                    {ps === "a4" ? "A4 Sheet" : ps === "4r" ? "4R (4x6\")" : "5x7 Inch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Copies Preset Buttons (4, 6, 8, 12, 16, 24, 30, 36) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.photoPrintLayout.copies}
                </label>
                <span className="font-mono font-bold text-amber-400">{copies} {language === "bn" ? "কপি" : "Copies"}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12, 16, 20, 24, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCopies(num)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      copies === num
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                    }`}
                  >
                    {num} Pcs
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Dimensions (mm) */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-slate-200 block">{language === "bn" ? "প্রতিটি ছবির সাইজ (মিমি)" : "Photo Dimensions (mm)"}</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={photoWidthMm}
                    onChange={(e) => setPhotoWidthMm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={photoHeightMm}
                    onChange={(e) => setPhotoHeightMm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Spacing & Margins */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{t.photoPrintLayout.gap}</span>
                  <span className="font-mono text-slate-300 font-bold">{gapMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={gapMm}
                  onChange={(e) => setGapMm(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{t.photoPrintLayout.margins}</span>
                  <span className="font-mono text-slate-300 font-bold">{marginMm} mm</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  value={marginMm}
                  onChange={(e) => setMarginMm(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Scissor Cut Marks & Header Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showCutMarks}
                  onChange={(e) => setShowCutMarks(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 accent-amber-500"
                />
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.photoPrintLayout.cutLines}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showCafeHeader}
                  onChange={(e) => setShowCafeHeader(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 accent-amber-500"
                />
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === "bn" ? "দোকানের নাম ও ওয়াটারমার্ক হেডার" : "Include Studio / Cafe Header"}</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={handlePrint}
              disabled={!layoutPreviewUrl}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t.photoPrintLayout.directPrint}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
