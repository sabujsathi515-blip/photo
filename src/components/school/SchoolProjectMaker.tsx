import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { SchoolProjectData, SchoolProjectBorder } from "../../types";
import { requestAIProject } from "../../services/ai";
import { exportProjectToDocx } from "../../services/docxExport";
import { jsPDF } from "jspdf";
import {
  GraduationCap,
  Sparkles,
  FileDown,
  Printer,
  Edit3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layout,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  Eye,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

export const SchoolProjectMaker: React.FC = () => {
  const { language, t, saveProject, notify } = useApp();

  const [topic, setTopic] = useState<string>("Water Pollution and Conservation");
  const [subject, setSubject] = useState<string>("Environmental Science / ভূগোল");
  const [studentClass, setStudentClass] = useState<string>("Class 9");
  const [projectLang, setProjectLang] = useState<"bn" | "en">("bn");
  const [studentName, setStudentName] = useState<string>("Sourav Mondal");
  const [rollNumber, setRollNumber] = useState<string>("14");
  const [schoolName, setSchoolName] = useState<string>("Burdwan Municipal High School");
  const [teacherName, setTeacherName] = useState<string>("Shri A. K. Banerjee");
  const [academicYear, setAcademicYear] = useState<string>("2026-2027");

  const [borderStyle, setBorderStyle] = useState<SchoolProjectBorder>("ornate-classic");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProject, setGeneratedProject] = useState<SchoolProjectData | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      notify(language === "bn" ? "অনুগ্রহ করে প্রজেক্টের বিষয় লিখুন" : "Please enter project topic", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await requestAIProject({
        topic,
        subject,
        studentClass,
        language: projectLang,
        studentName,
        schoolName,
      });

      const fullProject: SchoolProjectData = {
        ...result,
        id: "proj-" + Date.now(),
        topic,
        subject,
        studentClass,
        language: projectLang,
        studentName,
        rollNumber,
        schoolName,
        teacherName,
        academicYear,
        borderStyle,
        createdAt: Date.now(),
      };

      setGeneratedProject(fullProject);
      saveProject(fullProject);
      notify(
        language === "bn"
          ? "AI দিয়ে সম্পূর্ণ স্কুল প্রজেক্ট সফলভাবে প্রস্তুত হয়েছে!"
          : "Full School Project generated successfully with AI!"
      );
    } catch (err) {
      console.error(err);
      notify("AI generation failed, please check internet or retry", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDocxExport = async () => {
    if (!generatedProject) return;
    try {
      await exportProjectToDocx(generatedProject);
      notify(language === "bn" ? "Word (.docx) ফাইল ডাউনলোড হয়েছে" : "Word (.docx) document downloaded");
    } catch (e) {
      console.error(e);
      notify("Failed to export Word document", "error");
    }
  };

  const handleDirectPrint = () => {
    if (!printAreaRef.current) return;
    const contentHtml = printAreaRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notify("Please allow popups to print", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${generatedProject?.title || "School Project"} - DIGITAL SEVA PRO</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Hind Siliguri', 'Times New Roman', serif;
              color: #1e293b;
              background: #fff;
            }
            .page-sheet {
              page-break-after: always;
              box-sizing: border-box;
              min-height: 270mm;
              padding: 15mm;
              border: 3px double #1e293b;
              margin-bottom: 20px;
              position: relative;
            }
            .title-hero {
              text-align: center;
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .subtitle {
              text-align: center;
              font-size: 16px;
              margin-bottom: 25px;
            }
            h2 {
              font-size: 18px;
              border-bottom: 1.5px solid #334155;
              padding-bottom: 4px;
              margin-top: 20px;
            }
            p {
              font-size: 14px;
              line-height: 1.6;
              text-align: justify;
            }
            ul {
              font-size: 14px;
              line-height: 1.6;
            }
            .footer-info {
              position: absolute;
              bottom: 10mm;
              left: 15mm;
              right: 15mm;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              border-top: 1px solid #94a3b8;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const borderStyles: { id: SchoolProjectBorder; name: string; nameBn: string; borderClass: string }[] = [
    { id: "ornate-classic", name: "Classic Ornate Double", nameBn: "ক্ল্যাসিক ডাবল বর্ডার", borderClass: "border-8 border-double border-indigo-900" },
    { id: "floral-bengali", name: "Floral Alpona Art", nameBn: "ঐতিহ্যবাহী নকশা আলপনা", borderClass: "border-4 border-amber-800 ring-4 ring-amber-600/30" },
    { id: "science-blueprint", name: "Science Blueprint Grid", nameBn: "সায়েন্স ব্লুপ্রিন্ট গ্রিড", borderClass: "border-4 border-cyan-700 ring-2 ring-cyan-500/40" },
    { id: "modern-minimal", name: "Modern Clean Minimal", nameBn: "মডার্ন মিনিমাল ফ্রেম", borderClass: "border-2 border-slate-800" },
    { id: "golden-royal", name: "Royal Gold Filigree", nameBn: "রয়েল গোল্ডেন ফ্রেম", borderClass: "border-4 border-amber-500 ring-2 ring-amber-400" },
    { id: "vintage-manuscript", name: "Vintage Parchment", nameBn: "ভিন্টেজ ম্যানুস্ক্রিপ্ট", borderClass: "border-4 border-dashed border-stone-600" },
  ];

  const currentBorder = borderStyles.find((b) => b.id === borderStyle) || borderStyles[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.schoolProject.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.schoolProject.subtitle}</p>
        </div>

        {generatedProject && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDocxExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Word (.docx)</span>
            </button>
            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.schoolProject.directPrint}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form / Generator on Left, Live Multi-Page A4 on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200 text-sm">{t.schoolProject.projectTopic}</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              Gemini AI Pro
            </span>
          </div>

          {/* Topic & Subject */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {language === "bn" ? "প্রজেক্টের বিষয় / নাম *" : "Project Topic *"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Water Pollution, Photosynthesis, Rabindranath Tagore, Solar System"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-medium focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  {language === "bn" ? "বিষয় (Subject)" : "Subject"}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {language === "bn" ? "শ্রেণী (Class)" : "Class"}
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  {["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10 (Madhyamik)", "Class 11", "Class 12 (Higher Secondary)", "College / Degree"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Switch for AI */}
            <div>
              <label className="text-slate-400 block mb-1.5">
                {language === "bn" ? "প্রজেক্টের ভাষা" : "Content Language"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProjectLang("bn")}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    projectLang === "bn"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  বাংলা (Bengali)
                </button>
                <button
                  type="button"
                  onClick={() => setProjectLang("en")}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    projectLang === "en"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Student & School Details */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  {language === "bn" ? "ছাত্র/ছাত্রীর নাম" : "Student Name"}
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">
                    {language === "bn" ? "রোল নম্বর" : "Roll Number"}
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    {language === "bn" ? "শিক্ষাবর্ষ" : "Academic Year"}
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {language === "bn" ? "বিদ্যালয়ের নাম" : "School / Institution Name"}
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {language === "bn" ? "শিক্ষক/শিক্ষিকার নাম" : "Teacher Name (Submitted To)"}
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            {/* Border Style Picker */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 block mb-1.5 font-bold">
                {language === "bn" ? "A4 পেজ বর্ডার ডিজাইন" : "Border Style"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {borderStyles.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBorderStyle(b.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      borderStyle === b.id
                        ? "bg-purple-600/20 border-purple-500 text-purple-200 font-bold"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-[11px] block">{language === "bn" ? b.nameBn : b.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Generate Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{language === "bn" ? "AI প্রজেক্ট তৈরি করছে..." : "Generating Project with Gemini AI..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === "bn" ? "AI দিয়ে সম্পূর্ণ প্রজেক্ট তৈরি করুন" : "Generate Complete AI Project"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Multi-Page A4 Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[600px]">
          {generatedProject ? (
            <div className="space-y-4">
              {/* Top Controls for Preview */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">
                    {language === "bn" ? "পেজ ভিউ:" : "Viewing Page:"}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5, 6].map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setActivePage(pNum)}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold font-mono transition-all ${
                          activePage === pNum
                            ? "bg-purple-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      isEditing
                        ? "bg-amber-600 text-white border-amber-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Done Editing" : "Edit Text"}</span>
                  </button>
                </div>
              </div>

              {/* Printable Live A4 Pages Container */}
              <div
                ref={printAreaRef}
                className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[700px] flex flex-col items-center gap-6"
              >
                {/* PAGE 1: COVER PAGE */}
                {(activePage === 1 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-12 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="text-center space-y-3 pt-4">
                      <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-indigo-950 border-b-2 border-indigo-900 pb-2">
                        {generatedProject.schoolName.toUpperCase()}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {language === "bn" ? "প্রকল্প প্রতিবেদন" : "PROJECT REPORT"}
                      </p>
                      <h1 className="text-xl sm:text-2xl font-black text-indigo-900 py-3 uppercase">
                        "{generatedProject.title || generatedProject.topic}"
                      </h1>
                      <p className="text-xs font-semibold text-slate-700">
                        Subject: <span className="font-bold">{generatedProject.subject}</span> | Year:{" "}
                        <span className="font-bold">{generatedProject.academicYear}</span>
                      </p>
                    </div>

                    {/* Student details grid */}
                    <div className="grid grid-cols-2 gap-4 border-t-2 border-b-2 border-slate-400 py-4 text-xs font-medium">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{language === "bn" ? "প্রস্তুতকারক:" : "Submitted By:"}</p>
                        <p>Name: <span className="font-bold">{generatedProject.studentName}</span></p>
                        <p>Class: <span className="font-bold">{generatedProject.studentClass}</span></p>
                        <p>Roll No: <span className="font-bold">{generatedProject.rollNumber}</span></p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="font-bold text-slate-900">{language === "bn" ? "মূল্যায়নকারী:" : "Submitted To:"}</p>
                        <p>Teacher: <span className="font-bold">{generatedProject.teacherName}</span></p>
                        <p>Department: <span className="font-bold">{generatedProject.subject}</span></p>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-500">
                      DIGITAL SEVA PRO • SCHOOL PROJECT REPORT
                    </div>
                  </div>
                )}

                {/* PAGE 2: INTRODUCTION & OBJECTIVES */}
                {(activePage === 2 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-10 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase text-indigo-950">
                          {language === "bn" ? "১. ভূমিকা ও পটভূমি" : "1. INTRODUCTION & BACKGROUND"}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">Page 2</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-800 text-justify">
                        {generatedProject.sections.introduction}
                      </p>

                      <div className="pt-3 border-t border-slate-300">
                        <h2 className="text-sm font-black uppercase text-indigo-950 mb-2">
                          {language === "bn" ? "২. প্রকল্পের মূল উদ্দেশ্য" : "2. PROJECT OBJECTIVES"}
                        </h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-800">
                          {generatedProject.sections.objectives.map((obj, i) => (
                            <li key={i} className="leading-snug">
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                      <span>{generatedProject.title}</span>
                      <span>Page 2 of 6</span>
                    </div>
                  </div>
                )}

                {/* PAGE 3: MAIN TOPIC CONTENT */}
                {(activePage === 3 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-10 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase text-indigo-950">
                          {language === "bn" ? "৩. মূল বিষয়বস্তু" : "3. MAIN CONTENT & OVERVIEW"}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">Page 3</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-800 text-justify">
                        {generatedProject.sections.mainContent}
                      </p>

                      <div className="pt-2 border-t border-slate-300">
                        <h2 className="text-sm font-black uppercase text-indigo-950 mb-1.5">
                          {language === "bn" ? "৪. বিস্তারিত আলোচনা ও ব্যাখ্যা" : "4. DETAILED EXPLANATION"}
                        </h2>
                        <p className="text-xs leading-relaxed text-slate-800 text-justify">
                          {generatedProject.sections.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                      <span>{generatedProject.title}</span>
                      <span>Page 3 of 6</span>
                    </div>
                  </div>
                )}

                {/* PAGE 4: KEY FACTS & EXAMPLES */}
                {(activePage === 4 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-10 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase text-indigo-950">
                          {language === "bn" ? "৫. গুরুত্বপূর্ণ তথ্য ও তথ্যপঞ্জী" : "5. IMPORTANT FACTS & DATA"}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">Page 4</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-800">
                        {generatedProject.sections.importantFacts.map((fact, i) => (
                          <li key={i}>{fact}</li>
                        ))}
                      </ul>

                      <div className="pt-3 border-t border-slate-300">
                        <h2 className="text-sm font-black uppercase text-indigo-950 mb-2">
                          {language === "bn" ? "৬. বাস্তব উদাহরণ ও কেস স্টাডি" : "6. REAL-LIFE EXAMPLES & CASE STUDIES"}
                        </h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-800">
                          {generatedProject.sections.examples.map((ex, i) => (
                            <li key={i}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                      <span>{generatedProject.title}</span>
                      <span>Page 4 of 6</span>
                    </div>
                  </div>
                )}

                {/* PAGE 5: ADVANTAGES & DISADVANTAGES */}
                {(activePage === 5 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-10 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase text-indigo-950">
                          {language === "bn" ? "৭. সুবিধা ও সীমাবদ্ধতা" : "7. ADVANTAGES & CHALLENGES"}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">Page 5</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-emerald-800">{language === "bn" ? "প্রধান সুবিধাসমূহ:" : "Key Advantages:"}</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-800">
                          {generatedProject.sections.advantages.map((adv, i) => (
                            <li key={i}>{adv}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-300 space-y-2">
                        <p className="text-xs font-bold text-rose-800">{language === "bn" ? "সীমাবদ্ধতা ও চ্যালেঞ্জ:" : "Challenges & Disadvantages:"}</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-800">
                          {generatedProject.sections.disadvantages.map((dis, i) => (
                            <li key={i}>{dis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                      <span>{generatedProject.title}</span>
                      <span>Page 5 of 6</span>
                    </div>
                  </div>
                )}

                {/* PAGE 6: CONCLUSION & BIBLIOGRAPHY */}
                {(activePage === 6 || isEditing) && (
                  <div
                    className={`w-full max-w-[560px] bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-10 relative flex flex-col justify-between aspect-[1/1.414] ${currentBorder.borderClass}`}
                  >
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase text-indigo-950">
                          {language === "bn" ? "৮. উপসংহার" : "8. CONCLUSION"}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">Page 6</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-800 text-justify">
                        {generatedProject.sections.conclusion}
                      </p>

                      <div className="pt-3 border-t border-slate-300">
                        <h2 className="text-sm font-black uppercase text-indigo-950 mb-2">
                          {language === "bn" ? "৯. তথ্যসূত্র ও গ্রন্থপঞ্জি" : "9. BIBLIOGRAPHY & REFERENCES"}
                        </h2>
                        <ul className="list-none space-y-1 text-xs text-slate-800 font-mono">
                          {generatedProject.sections.bibliography.map((bib, i) => (
                            <li key={i}>[{i + 1}] {bib}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Teacher's evaluation signature box */}
                    <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-400 pt-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Teacher's Remarks:</p>
                        <p className="text-[10px] text-slate-500">Grade: _______ | Marks: _____/20</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">Teacher's Signature:</p>
                        <p className="text-[10px] text-slate-400 mt-4">Date: _______________</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">
                {language === "bn" ? "প্রজেক্টের লাইভ প্রিভিউ এখানে প্রদর্শিত হবে" : "Live Project Preview"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {language === "bn"
                  ? "বামদিকের ফর্মটিতে বিষয় লিখে 'AI দিয়ে সম্পূর্ণ প্রজেক্ট তৈরি করুন' বাটনে চাপুন।"
                  : "Fill in the project topic on the left and click Generate AI Project."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
