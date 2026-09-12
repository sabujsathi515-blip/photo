import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import { ResumeData } from "../../types";
import { exportResumeToDocx } from "../../services/docxExport";
import {
  Contact,
  Upload,
  Printer,
  FileSpreadsheet,
  Plus,
  Trash2,
  Sparkles,
  HeartHandshake,
  Briefcase,
  GraduationCap,
  Eye,
  Check,
} from "lucide-react";

export const ResumeMaker: React.FC = () => {
  const { language, t, notify } = useApp();
  const [docType, setDocType] = useState<"job_cv" | "matrimonial">("job_cv");
  const [templateTheme, setTemplateTheme] = useState<"professional" | "minimal" | "executive">("professional");

  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: "Sourav Mondal",
    designation: "Computer Operator & Digital Services Executive",
    email: "sourav.mondal99@gmail.com",
    phone: "+91 98321 09876",
    address: "Burdwan, West Bengal, PIN: 713101",
    photoUrl: undefined,
    careerObjective:
      "Dedicated and detail-oriented professional with extensive experience in Cyber Café operations, government online portals, document drafting, and customer management.",
    education: [
      { degree: "Bachelor of Science (B.Sc)", institution: "Burdwan University", year: "2023", score: "First Class (72%)" },
      { degree: "Higher Secondary (10+2)", institution: "WBCHSE", year: "2020", score: "84.5%" },
      { degree: "Madhyamik (10th)", institution: "WBBSE", year: "2018", score: "88.2%" },
    ],
    experience: [
      { role: "Senior Cyber Café & Studio Operator", company: "Digital Seva Kendra, Burdwan", duration: "2023 - Present", description: "Managing daily photo printing, online government applications, GST filings, and customer services." },
    ],
    skills: ["Photoshop & Image Editing", "MS Office & Word", "Bangla & English Typing", "Online Govt Portal Filing", "Tally ERP & Accounting"],
    languages: ["Bengali (Native)", "English (Fluent)", "Hindi (Conversational)"],
    declaration: "I hereby solemnly declare that all information given above is true and authentic to the best of my knowledge and belief.",
  });

  // Matrimonial Bio-data extra fields
  const [matrimonialData, setMatrimonialData] = useState({
    dob: "15/08/1998",
    timeOfBirth: "06:30 AM",
    placeOfBirth: "Burdwan, WB",
    height: "5 ft 8 in",
    complexion: "Fair",
    gothra: "Kashyapa",
    rashi: "Leo (Singha)",
    fatherName: "Shri Ashok Kumar Mondal",
    fatherOcc: "Retired Govt Employee (WB Police)",
    motherName: "Smt. Manju Mondal",
    motherOcc: "Homemaker",
    siblings: "1 Brother (Married, IT Engineer in TCS)",
    monthlyIncome: "₹ 55,000 / month",
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setResumeData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "", score: "" }],
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleDocxExport = async () => {
    try {
      await exportResumeToDocx(resumeData);
      notify(language === "bn" ? "Word (.docx) রিজিউমে ডাউনলোড হয়েছে" : "Word CV downloaded");
    } catch (e) {
      console.error(e);
      notify("Failed to export docx", "error");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !printAreaRef.current) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.fullName} - Resume</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Times New Roman', serif; color: #1e293b; background: #fff; line-height: 1.5; }
            .header-name { font-size: 24px; font-weight: bold; text-align: center; text-transform: uppercase; }
            .contact-line { font-size: 12px; text-align: center; margin-bottom: 15px; }
            h2 { font-size: 14px; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-top: 15px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
            th, td { border: 1px solid #64748b; padding: 5px; text-align: left; }
            th { background: #f1f5f9; }
            ul { font-size: 12px; margin-top: 4px; padding-left: 20px; }
          </style>
        </head>
        <body>
          ${printAreaRef.current.innerHTML}
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <Contact className="w-5 h-5 text-indigo-400" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.resumeMaker.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.resumeMaker.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {docType === "job_cv" && (
            <button
              onClick={handleDocxExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Word (.docx)</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.resumeMaker.directPrint}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Job Resume vs Matrimonial Bio-data */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setDocType("job_cv")}
          className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
            docType === "job_cv"
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
              : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{language === "bn" ? "প্রফেশনাল চাকরির সিভি / রিজিউমে (Job CV)" : "Professional Job Resume / CV"}</span>
        </button>
        <button
          onClick={() => setDocType("matrimonial")}
          className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
            docType === "matrimonial"
              ? "bg-rose-600 text-white border-rose-500 shadow-md"
              : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{language === "bn" ? "পাত্র / পাত্রীর বিয়ের বায়োডাটা (Bio-Data)" : "Matrimonial Bio-Data (Marriage)"}</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs max-h-[750px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">{language === "bn" ? "ব্যক্তিগত তথ্য পূরণ" : "Personal Details"}</span>
            {/* Photo Upload */}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{resumeData.photoUrl ? "Change Photo" : "Add Photo"}</span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={resumeData.fullName}
                onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Mobile No</label>
                <input
                  type="text"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email</label>
                <input
                  type="text"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Residential Address</label>
              <input
                type="text"
                value={resumeData.address}
                onChange={(e) => setResumeData({ ...resumeData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            {/* If Job CV */}
            {docType === "job_cv" ? (
              <>
                <div>
                  <label className="text-slate-400 block mb-1">Designation / Role Title</label>
                  <input
                    type="text"
                    value={resumeData.designation || ""}
                    onChange={(e) => setResumeData({ ...resumeData, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Career Objective</label>
                  <textarea
                    rows={3}
                    value={resumeData.careerObjective || ""}
                    onChange={(e) => setResumeData({ ...resumeData, careerObjective: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                {/* Education section */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Education Details</span>
                    <button
                      onClick={handleAddEducation}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 relative">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Degree / Exam"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].degree = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                        />
                        <input
                          placeholder="Board / College"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].institution = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Year (e.g. 2023)"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].year = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                        />
                        <input
                          placeholder="Marks / %"
                          value={edu.score}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].score = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                        />
                      </div>
                      {resumeData.education.length > 1 && (
                        <button
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-[10px] text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-slate-400 block mb-1">Key Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={resumeData.skills.join(", ")}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </>
            ) : (
              /* Matrimonial Bio-data specific inputs */
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Date of Birth</label>
                    <input
                      type="text"
                      value={matrimonialData.dob}
                      onChange={(e) => setMatrimonialData({ ...matrimonialData, dob: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Height & Complexion</label>
                    <input
                      type="text"
                      value={`${matrimonialData.height}, ${matrimonialData.complexion}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        setMatrimonialData({ ...matrimonialData, height: parts[0] || "", complexion: parts[1] || "" });
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Gothra</label>
                    <input
                      type="text"
                      value={matrimonialData.gothra}
                      onChange={(e) => setMatrimonialData({ ...matrimonialData, gothra: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Rashi / Zodiac</label>
                    <input
                      type="text"
                      value={matrimonialData.rashi}
                      onChange={(e) => setMatrimonialData({ ...matrimonialData, rashi: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Father's Name & Occupation</label>
                  <input
                    type="text"
                    value={`${matrimonialData.fatherName} (${matrimonialData.fatherOcc})`}
                    onChange={(e) => setMatrimonialData({ ...matrimonialData, fatherName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Family Siblings Details</label>
                  <input
                    type="text"
                    value={matrimonialData.siblings}
                    onChange={(e) => setMatrimonialData({ ...matrimonialData, siblings: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live A4 Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[600px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300">
                {docType === "job_cv" ? "Curriculum Vitae Preview" : "Matrimonial Bio-Data Preview"}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>

            {/* Printable A4 Sheet View */}
            <div
              ref={printAreaRef}
              className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-300 min-h-[550px] font-serif text-xs leading-relaxed"
            >
              {docType === "job_cv" ? (
                /* Standard Job CV View */
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                        {resumeData.fullName}
                      </h1>
                      <p className="text-xs font-bold text-indigo-900">{resumeData.designation}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Phone: {resumeData.phone} | Email: {resumeData.email}
                      </p>
                      <p className="text-[11px] text-slate-600">{resumeData.address}</p>
                    </div>
                    {resumeData.photoUrl && (
                      <img
                        src={resumeData.photoUrl}
                        alt="Profile"
                        className="w-20 h-24 object-cover border border-slate-400 rounded shadow-sm"
                      />
                    )}
                  </div>

                  {/* Objective */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-1">
                      Career Objective
                    </h2>
                    <p className="text-slate-800 text-justify">{resumeData.careerObjective}</p>
                  </div>

                  {/* Education Table */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
                      Educational Qualifications
                    </h2>
                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold">
                          <th className="border border-slate-300 p-1.5 text-left">Examination</th>
                          <th className="border border-slate-300 p-1.5 text-left">Institution / Board</th>
                          <th className="border border-slate-300 p-1.5 text-center">Year</th>
                          <th className="border border-slate-300 p-1.5 text-right">Percentage / Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumeData.education.map((edu, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 font-semibold">{edu.degree}</td>
                            <td className="border border-slate-300 p-1.5">{edu.institution}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{edu.year}</td>
                            <td className="border border-slate-300 p-1.5 text-right font-mono">{edu.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-1">
                      Skills & Technical Proficiencies
                    </h2>
                    <p className="text-slate-800">{resumeData.skills.join(" • ")}</p>
                  </div>

                  {/* Languages */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-1">
                      Languages Known
                    </h2>
                    <p className="text-slate-800">{resumeData.languages.join(", ")}</p>
                  </div>

                  {/* Declaration */}
                  <div className="pt-3 border-t border-slate-300">
                    <p className="text-[10px] text-slate-700 italic">{resumeData.declaration}</p>
                    <div className="flex justify-between items-end mt-6 text-[11px]">
                      <span>Date: {new Date().toISOString().split("T")[0]}</span>
                      <span className="font-bold border-t border-slate-800 pt-1">
                        ({resumeData.fullName})
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Matrimonial Bio-data View */
                <div className="space-y-4 border-4 border-double border-rose-900 p-6">
                  <div className="text-center pb-2 border-b-2 border-rose-900">
                    <h2 className="text-lg font-black uppercase text-rose-950 tracking-wider">
                      ॥ শ্রী শ্রী প্রজাপতয়ে নমঃ ॥
                    </h2>
                    <h1 className="text-base font-bold uppercase text-slate-900 mt-1">
                      BIODATA FOR MARRIAGE
                    </h1>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 text-xs">
                      <p><span className="font-bold">Full Name:</span> {resumeData.fullName}</p>
                      <p><span className="font-bold">Date of Birth:</span> {matrimonialData.dob} ({matrimonialData.timeOfBirth})</p>
                      <p><span className="font-bold">Place of Birth:</span> {matrimonialData.placeOfBirth}</p>
                      <p><span className="font-bold">Height & Complexion:</span> {matrimonialData.height}, {matrimonialData.complexion}</p>
                      <p><span className="font-bold">Gothra & Rashi:</span> {matrimonialData.gothra} | {matrimonialData.rashi}</p>
                      <p><span className="font-bold">Education:</span> {resumeData.education[0]?.degree || "Graduate"}</p>
                      <p><span className="font-bold">Profession:</span> {resumeData.designation}</p>
                    </div>
                    {resumeData.photoUrl && (
                      <img
                        src={resumeData.photoUrl}
                        alt="Photo"
                        className="w-24 h-28 object-cover border-2 border-rose-900 rounded-md"
                      />
                    )}
                  </div>

                  <div className="pt-2 border-t border-rose-800 space-y-1.5 text-xs">
                    <h3 className="font-bold uppercase text-rose-950">Family Details</h3>
                    <p><span className="font-bold">Father:</span> {matrimonialData.fatherName} ({matrimonialData.fatherOcc})</p>
                    <p><span className="font-bold">Mother:</span> {matrimonialData.motherName} ({matrimonialData.motherOcc})</p>
                    <p><span className="font-bold">Siblings:</span> {matrimonialData.siblings}</p>
                    <p><span className="font-bold">Permanent Address:</span> {resumeData.address}</p>
                    <p><span className="font-bold">Contact Number:</span> {resumeData.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
