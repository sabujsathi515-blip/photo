import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { documentTemplates, DocumentTemplate } from "../../data/documentTemplates";
import { requestAIDocumentAssist } from "../../services/ai";
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  BookOpen,
} from "lucide-react";

export const DocumentMaker: React.FC = () => {
  const { language, t, notify } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(documentTemplates[0]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [docLang, setDocLang] = useState<"bn" | "en">(language === "bn" ? "bn" : "en");
  const [editableText, setEditableText] = useState<string>("");
  const [isAIAssisting, setIsAIAssisting] = useState<boolean>(false);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Initialize form default values
  React.useEffect(() => {
    const defaults: Record<string, any> = {};
    selectedTemplate.fields.forEach((f) => {
      defaults[f.id] = f.defaultValue || "";
    });
    setFormData(defaults);
    updatePreview(selectedTemplate, defaults, docLang);
  }, [selectedTemplate, docLang]);

  const updatePreview = (tpl: DocumentTemplate, data: Record<string, any>, lang: "bn" | "en") => {
    const text = lang === "bn" ? tpl.templateBn(data) : tpl.templateEn(data);
    setEditableText(text);
  };

  const handleFieldChange = (id: string, val: any) => {
    const updated = { ...formData, [id]: val };
    setFormData(updated);
    if (!isCustomMode) {
      updatePreview(selectedTemplate, updated, docLang);
    }
  };

  const handleAIPolish = async () => {
    setIsAIAssisting(true);
    try {
      const draft = await requestAIDocumentAssist(selectedTemplate.title, formData, docLang);
      setEditableText(draft);
      setIsCustomMode(true);
      notify(
        language === "bn" ? "AI দিয়ে দরখাস্তের ভাষা পরিশীলিত হয়েছে" : "Draft polished with Gemini AI"
      );
    } catch (e) {
      console.error(e);
      notify("AI drafting failed, fallback preserved", "error");
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notify("Please allow popups to print", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedTemplate.title}</title>
          <style>
            @page {
              size: A4;
              margin: 25mm 20mm;
            }
            body {
              font-family: 'Hind Siliguri', 'Times New Roman', serif;
              font-size: 15px;
              line-height: 1.8;
              color: #000;
              background: #fff;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div>${editableText.replace(/\n/g, "<br>")}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    notify(language === "bn" ? "টেক্সট কপি করা হয়েছে" : "Text copied to clipboard");
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([editableText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.id}_application.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.documentMaker.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.documentMaker.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.documentMaker.directPrint}</span>
          </button>
        </div>
      </div>

      {/* Templates Selector Carousel */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          {language === "bn" ? "প্রয়োজনীয় দরখাস্ত / ডিক্লারেশন ফরম্যাট বাছুন" : "Choose Template"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {documentTemplates.map((tpl) => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setIsCustomMode(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-rose-600/20 border-rose-500 text-rose-200 shadow-md font-bold"
                    : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold line-clamp-1">{language === "bn" ? tpl.titleBn : tpl.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0 ml-1" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Drafting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Field Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200 text-sm">{language === "bn" ? "তথ্য পূরণ করুন" : "Fill Document Details"}</span>
            {/* Language Switch */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setDocLang("bn")}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  docLang === "bn" ? "bg-rose-600 text-white" : "text-slate-400"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setDocLang("en")}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  docLang === "en" ? "bg-rose-600 text-white" : "text-slate-400"
                }`}
              >
                ENG
              </button>
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedTemplate.fields.map((field) => (
              <div key={field.id}>
                <label className="text-slate-300 font-medium block mb-1">
                  {language === "bn" ? field.labelBn : field.label} {field.required && "*"}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          {/* AI Polish Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleAIPolish}
              disabled={isAIAssisting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isAIAssisting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "bn" ? "AI লিখছে..." : "AI Writing Draft..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.documentMaker.aiAssist}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live A4 Printable Preview / Text Editor (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[560px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {language === "bn" ? "A4 প্রিন্ট পেজ প্রিভিউ ও এডিটর" : "A4 Print Sheet Preview"}
              </span>
              <span className="text-[10px] text-slate-500">
                {language === "bn" ? "(টেক্সট সরাসরি এডিট করতে পারেন)" : "(You can edit text directly below)"}
              </span>
            </div>

            {/* A4 Document Canvas Sheet */}
            <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-300 min-h-[460px]">
              <textarea
                value={editableText}
                onChange={(e) => {
                  setEditableText(e.target.value);
                  setIsCustomMode(true);
                }}
                className="w-full h-[400px] bg-transparent text-slate-900 font-serif text-sm leading-relaxed border-0 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleDownloadTxt}
              className="text-xs text-slate-400 hover:text-white"
            >
              Download .TXT
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Copy Text
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t.documentMaker.directPrint}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
