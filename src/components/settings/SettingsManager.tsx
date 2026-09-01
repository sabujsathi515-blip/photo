import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { CyberCafeProfile } from "../../types";
import {
  Settings,
  Store,
  DollarSign,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Trash2,
} from "lucide-react";

export const SettingsManager: React.FC = () => {
  const { language, setLanguage, t, profile, updateProfile, notify } = useApp();
  const [formData, setFormData] = useState<CyberCafeProfile>(profile);
  const [rates, setRates] = useState(profile.serviceRates);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      serviceRates: rates,
    });
    notify(language === "bn" ? "প্রোফাইল ও রেট চার্ট সেভ হয়েছে" : "Profile & Rate chart saved successfully");
  };

  const handleExportBackup = () => {
    const data = {
      profile: formData,
      transactions: localStorage.getItem("dsp_transactions"),
      customers: localStorage.getItem("dsp_customers"),
      projects: localStorage.getItem("dsp_school_projects"),
      backupDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Digital_Seva_Pro_Backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(language === "bn" ? "ডাটা ব্যাকআপ ডাউনলোড হয়েছে" : "Full Data backup exported successfully");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.settings.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.settings.subtitle}</p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.settings.backupData}</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Shop Details (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Store className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-sm">{t.settings.cafeDetails}</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Cyber Café / Shop Name</label>
              <input
                type="text"
                value={formData.cafeName}
                onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Owner / Operator Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Shop Address & Landmark</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">UPI ID (For QR Invoicing)</label>
                <input
                  type="text"
                  value={formData.upiId || ""}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="e.g. 9832109876@upi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">GSTIN / Trade License (Optional)</label>
                <input
                  type="text"
                  value={formData.gstNumber || ""}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Service Rate Chart & Defaults (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-sm">{t.settings.rateChart}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Passport Photo (8 Copy) ₹</label>
              <input
                type="number"
                value={rates.passport8}
                onChange={(e) => setRates({ ...rates, passport8: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Passport Photo (16 Copy) ₹</label>
              <input
                type="number"
                value={rates.passport16}
                onChange={(e) => setRates({ ...rates, passport16: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">A4 Photo Print (Glossy) ₹</label>
              <input
                type="number"
                value={rates.photoA4}
                onChange={(e) => setRates({ ...rates, photoA4: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">4R Photo Print (4x6") ₹</label>
              <input
                type="number"
                value={rates.photo4R}
                onChange={(e) => setRates({ ...rates, photo4R: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">B&W Xerox / Print (Per Page) ₹</label>
              <input
                type="number"
                value={rates.xeroxBw}
                onChange={(e) => setRates({ ...rates, xeroxBw: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Color Print (Per Page) ₹</label>
              <input
                type="number"
                value={rates.xeroxColor}
                onChange={(e) => setRates({ ...rates, xeroxColor: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">A4 Lamination ₹</label>
              <input
                type="number"
                value={rates.laminationA4}
                onChange={(e) => setRates({ ...rates, laminationA4: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Online Form Fill-up Charge ₹</label>
              <input
                type="number"
                value={rates.onlineFormFill}
                onChange={(e) => setRates({ ...rates, onlineFormFill: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.settings.saveChanges}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
