import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-xs font-medium transition-all transform translate-y-0 ${
            toast.type === "success"
              ? "bg-emerald-950/95 text-emerald-200 border-emerald-800/80 backdrop-blur-md"
              : toast.type === "error"
              ? "bg-rose-950/95 text-rose-200 border-rose-800/80 backdrop-blur-md"
              : "bg-slate-900/95 text-slate-200 border-slate-700/80 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Toast = ToastContainer;
