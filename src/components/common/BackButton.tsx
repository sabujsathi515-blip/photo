import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NavSection } from "../../types";

interface BackButtonProps {
  to?: NavSection;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to = "dashboard",
  label,
  className = "",
}) => {
  const { setActiveSection, language } = useApp();

  const defaultText =
    to === "dashboard"
      ? language === "bn"
        ? "ড্যাশবোর্ডে ফিরুন (Back)"
        : "Back to Dashboard"
      : language === "bn"
      ? "পেছনে যান"
      : "Go Back";

  const displayText = label || defaultText;

  return (
    <button
      onClick={() => setActiveSection(to)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/90 hover:border-blue-500/60 text-xs font-semibold shadow-sm transition-all cursor-pointer group shrink-0 active:scale-98 ${className}`}
      title={displayText}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
      <span>{displayText}</span>
    </button>
  );
};
