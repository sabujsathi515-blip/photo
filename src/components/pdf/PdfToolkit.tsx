import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  mergePdfs,
  extractPdfPages,
  rotatePdfPages,
  addWatermarkToPdf,
  addPageNumbersToPdf,
  imagesToPdf,
  downloadUint8Array,
} from "../../services/pdfTools";
import {
  FileCode2,
  Layers,
  Scissors,
  RotateCw,
  Stamp,
  Hash,
  Image as ImageIcon,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react";

type PdfToolType = "merge" | "split" | "rotate" | "watermark" | "page_numbers" | "images_to_pdf";

export const PdfToolkit: React.FC = () => {
  const { language, t, notify } = useApp();
  const [activeTool, setActiveTool] = useState<PdfToolType>("merge");

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<{ file: File; name: string; size: string }[]>([]);
  // Single PDF Buffer state
  const [singlePdfFile, setSinglePdfFile] = useState<File | null>(null);
  const [singlePdfName, setSinglePdfName] = useState<string>("");
  // Rotate angle
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);
  // Watermark text
  const [watermarkText, setWatermarkText] = useState<string>("DIGITAL SEVA KENDRA");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  // Split pages range string
  const [splitRangeStr, setSplitRangeStr] = useState<string>("1, 2, 3");
  // Images to PDF state
  const [imageFiles, setImageFiles] = useState<{ dataUrl: string; name: string }[]>([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singlePdfInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Handle Multi PDF Upload for Merge
  const handleMergeUpload = (files: FileList | null) => {
    if (!files) return;
    const newItems: { file: File; name: string; size: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
        newItems.push({
          file: f,
          name: f.name,
          size: `${Math.round(f.size / 1024)} KB`,
        });
      }
    }
    setMergeFiles((prev) => [...prev, ...newItems]);
  };

  // Handle Single PDF Upload
  const handleSinglePdfUpload = (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      notify("Please choose a PDF file", "error");
      return;
    }
    setSinglePdfFile(file);
    setSinglePdfName(file.name);
  };

  // Handle Image Upload for Images to PDF
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        setImageFiles((prev) => [...prev, { dataUrl: reader.result as string, name: f.name }]);
      };
      reader.readAsDataURL(f);
    }
  };

  // Run Merge
  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      notify(language === "bn" ? "কমপক্ষে ২টি পিডিএফ ফাইল যোগ করুন" : "Please add at least 2 PDF files to merge", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const buffers = await Promise.all(mergeFiles.map((m) => m.file.arrayBuffer()));
      const mergedBytes = await mergePdfs(buffers);
      downloadUint8Array(mergedBytes, `Merged_Document_${Date.now()}.pdf`);
      notify(language === "bn" ? "পিডিএফ সফলভাবে মার্জ হয়েছে!" : "PDF merged successfully!");
    } catch (e) {
      console.error(e);
      notify("Failed to merge PDFs", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Split
  const handleExecuteSplit = async () => {
    if (!singlePdfFile) {
      notify(language === "bn" ? "একটি পিডিএফ আপলোড করুন" : "Upload a PDF first", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const buffer = await singlePdfFile.arrayBuffer();
      // Parse comma separated 1-based page numbers to 0-based indices
      const indices = splitRangeStr
        .split(/[,-\s]/)
        .map((s) => parseInt(s.trim()) - 1)
        .filter((n) => !isNaN(n) && n >= 0);

      const splitBytes = await extractPdfPages(buffer, indices);
      downloadUint8Array(splitBytes, `Extracted_Pages_${Date.now()}.pdf`);
      notify(language === "bn" ? "পেজ সফলভাবে আলাদা করা হয়েছে!" : "Pages split successfully!");
    } catch (e) {
      console.error(e);
      notify("Failed to extract pages", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Rotate
  const handleExecuteRotate = async () => {
    if (!singlePdfFile) return;
    setIsProcessing(true);
    try {
      const buffer = await singlePdfFile.arrayBuffer();
      const rotatedBytes = await rotatePdfPages(buffer, rotateAngle);
      downloadUint8Array(rotatedBytes, `Rotated_${rotateAngle}deg_${Date.now()}.pdf`);
      notify(language === "bn" ? "পিডিএফ সফলভাবে ঘোরানো হয়েছে!" : "PDF rotated successfully!");
    } catch (e) {
      console.error(e);
      notify("Failed to rotate PDF", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Watermark
  const handleExecuteWatermark = async () => {
    if (!singlePdfFile) return;
    setIsProcessing(true);
    try {
      const buffer = await singlePdfFile.arrayBuffer();
      const watermarkedBytes = await addWatermarkToPdf(buffer, watermarkText, watermarkOpacity);
      downloadUint8Array(watermarkedBytes, `Watermarked_${Date.now()}.pdf`);
      notify(language === "bn" ? "ওয়াটারমার্ক যুক্ত হয়েছে!" : "Watermark applied!");
    } catch (e) {
      console.error(e);
      notify("Failed to add watermark", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Page Numbers
  const handleExecutePageNumbers = async () => {
    if (!singlePdfFile) return;
    setIsProcessing(true);
    try {
      const buffer = await singlePdfFile.arrayBuffer();
      const numberedBytes = await addPageNumbersToPdf(buffer);
      downloadUint8Array(numberedBytes, `Numbered_${Date.now()}.pdf`);
      notify(language === "bn" ? "পেজ নম্বর যুক্ত হয়েছে!" : "Page numbers added!");
    } catch (e) {
      console.error(e);
      notify("Failed to add page numbers", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Images to PDF
  const handleExecuteImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      notify(language === "bn" ? "কমপক্ষে একটি ছবি যোগ করুন" : "Add at least one image", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const urls = imageFiles.map((f) => f.dataUrl);
      const pdfBytes = await imagesToPdf(urls);
      downloadUint8Array(pdfBytes, `Images_To_PDF_${Date.now()}.pdf`);
      notify(language === "bn" ? "ছবিগুলি পিডিএফ-এ কনভার্ট হয়েছে!" : "Images converted to PDF!");
    } catch (e) {
      console.error(e);
      notify("Failed to convert images to PDF", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const tools: { id: PdfToolType; labelBn: string; labelEn: string; icon: React.ElementType }[] = [
    { id: "merge", labelBn: "পিডিএফ মার্জ (Merge)", labelEn: "Merge PDFs", icon: Layers },
    { id: "split", labelBn: "পেজ আলাদা (Split)", labelEn: "Split Pages", icon: Scissors },
    { id: "rotate", labelBn: "ঘোরান (Rotate)", labelEn: "Rotate PDF", icon: RotateCw },
    { id: "watermark", labelBn: "ওয়াটারমার্ক (Watermark)", labelEn: "Watermark", icon: Stamp },
    { id: "page_numbers", labelBn: "পেজ নম্বর (Numbers)", labelEn: "Page Numbers", icon: Hash },
    { id: "images_to_pdf", labelBn: "ছবি থেকে পিডিএফ (JPG to PDF)", labelEn: "Images to PDF", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.pdfTools.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.pdfTools.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60">
          <ShieldCheck className="w-4 h-4" />
          <span>{language === "bn" ? "কোনো সার্ভার আপলোড নয় • ১০০% প্রাইভেট" : "100% Client-Side Safe"}</span>
        </div>
      </div>

      {/* Tool Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                isSelected
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{language === "bn" ? tool.labelBn : tool.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Body */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        {/* 1. MERGE PDF */}
        {activeTool === "merge" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {language === "bn" ? "একাধিক পিডিএফ ফাইল একত্রিত করুন" : "Merge Multiple PDFs"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn"
                    ? "ক্রম অনুযায়ী ফাইলগুলি যোগ করুন এবং একটি একক পিডিএফ ফাইলে মার্জ করুন।"
                    : "Add multiple PDFs in sequence and combine into one."}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "bn" ? "PDF যোগ করুন" : "Add PDF Files"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handleMergeUpload(e.target.files)}
              />
            </div>

            {/* List of uploaded merge items */}
            {mergeFiles.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {mergeFiles.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200 truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({m.size})</span>
                    </div>
                    <button
                      onClick={() => setMergeFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-slate-950/40"
              >
                <Layers className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">
                  {language === "bn" ? "পিডিএফ ফাইলগুলি ড্র্যাগ করুন বা ক্লিক করে বাছুন" : "Click to select PDF files"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Combine 2 or more documents into one</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteMerge}
                disabled={mergeFiles.length < 2 || isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{language === "bn" ? "মার্জ করে ডাউনলোড করুন" : "Merge & Download PDF"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. SPLIT PDF */}
        {activeTool === "split" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {language === "bn" ? "পিডিএফ থেকে নির্দিষ্ট পাতা আলাদা করুন" : "Split / Extract PDF Pages"}
              </h3>
              <p className="text-xs text-slate-400">
                {language === "bn"
                  ? "যে যে পেজগুলি প্রয়োজন সেগুলির নম্বর লিখুন (যেমন: 1, 3, 5)।"
                  : "Enter the page numbers to extract (e.g., 1, 2, 4-6)."}
              </p>
            </div>

            {singlePdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{singlePdfName}</span>
                <button
                  onClick={() => setSinglePdfFile(null)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div
                onClick={() => singlePdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-slate-950/40"
              >
                <Scissors className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">
                  {language === "bn" ? "একটি পিডিএফ ফাইল নির্বাচন করুন" : "Select PDF to split"}
                </p>
              </div>
            )}
            <input
              ref={singlePdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
            />

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === "bn" ? "নিষ্কাশনযোগ্য পেজ নম্বর" : "Pages to Extract (Comma separated)"}
              </label>
              <input
                type="text"
                value={splitRangeStr}
                onChange={(e) => setSplitRangeStr(e.target.value)}
                placeholder="e.g. 1, 3, 5"
                className="w-full max-w-sm bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteSplit}
                disabled={!singlePdfFile || isProcessing}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === "bn" ? "আলাদা করে ডাউনলোড করুন" : "Extract & Download"}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ROTATE PDF */}
        {activeTool === "rotate" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {language === "bn" ? "উল্টো বা বাঁকা পিডিএফ সোজা করুন" : "Rotate PDF Pages"}
              </h3>
            </div>

            {singlePdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{singlePdfName}</span>
                <button onClick={() => setSinglePdfFile(null)} className="text-rose-400 hover:underline">
                  Change File
                </button>
              </div>
            ) : (
              <div
                onClick={() => singlePdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer"
              >
                <RotateCw className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Select PDF to rotate</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Rotate Angle</label>
              <div className="flex gap-3">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotateAngle(deg as any)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                      rotateAngle === deg
                        ? "bg-cyan-600 text-white border-cyan-500"
                        : "bg-slate-950 text-slate-300 border-slate-700"
                    }`}
                  >
                    +{deg}°
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteRotate}
                disabled={!singlePdfFile || isProcessing}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Rotate & Download</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. WATERMARK PDF */}
        {activeTool === "watermark" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {language === "bn" ? "পিডিএফ পাতায় ওয়াটারমার্ক বা স্ট্যাম্প লাগান" : "Add Text Watermark"}
              </h3>
            </div>

            {singlePdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{singlePdfName}</span>
                <button onClick={() => setSinglePdfFile(null)} className="text-rose-400 hover:underline">
                  Change File
                </button>
              </div>
            ) : (
              <div
                onClick={() => singlePdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer"
              >
                <Stamp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Select PDF to add Watermark</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Opacity: {Math.round(watermarkOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteWatermark}
                disabled={!singlePdfFile || isProcessing}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Apply Watermark & Download</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. PAGE NUMBERS */}
        {activeTool === "page_numbers" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {language === "bn" ? "পিডিএফ পাতায় পেজ নম্বর বসান" : "Add Page Numbers"}
              </h3>
            </div>

            {singlePdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{singlePdfName}</span>
                <button onClick={() => setSinglePdfFile(null)} className="text-rose-400 hover:underline">
                  Change File
                </button>
              </div>
            ) : (
              <div
                onClick={() => singlePdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer"
              >
                <Hash className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Select PDF to add page numbers</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecutePageNumbers}
                disabled={!singlePdfFile || isProcessing}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add Numbers & Download</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. IMAGES TO PDF */}
        {activeTool === "images_to_pdf" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {language === "bn" ? "একাধিক ছবি (JPG/PNG) থেকে একটি পিডিএফ তৈরি করুন" : "Convert Images to PDF"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn"
                    ? "আধার, ভোটার বা ডকুমেন্টের ছবিগুলি যোগ করে A4 পিডিএফ তৈরি করুন।"
                    : "Combine scans & photos into formatted A4 PDF."}
                </p>
              </div>
              <button
                onClick={() => imagesInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Images</span>
              </button>
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </div>

            {imageFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                {imageFiles.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                    <img src={img.dataUrl} alt={img.name} className="h-28 w-full object-contain" />
                    <button
                      onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => imagesInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer"
              >
                <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Click to upload JPG / PNG images</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteImagesToPdf}
                disabled={imageFiles.length === 0 || isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Convert to PDF & Download</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
