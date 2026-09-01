import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Palette,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Download,
  Printer,
  Trash2,
  Move,
  Layers,
  Sparkles,
  RefreshCw,
  Award,
  CreditCard,
  Flag,
} from "lucide-react";

interface CanvasElement {
  id: string;
  type: "text" | "rect" | "circle" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  src?: string;
  imgElement?: HTMLImageElement;
  fontWeight?: string;
}

type DesignPreset = "visiting_card" | "certificate" | "banner_flex" | "notice_poster";

export const DesignStudio: React.FC = () => {
  const { language, t, notify } = useApp();
  const [preset, setPreset] = useState<DesignPreset>("visiting_card");
  const [canvasBg, setCanvasBg] = useState<string>("#ffffff");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Canvas size based on preset
  const canvasConfig = {
    visiting_card: { width: 500, height: 300, label: "Visiting Card (500x300)" },
    certificate: { width: 700, height: 500, label: "Certificate (700x500)" },
    banner_flex: { width: 800, height: 400, label: "Shop Flex Banner (800x400)" },
    notice_poster: { width: 500, height: 700, label: "Notice / Poster (500x700)" },
  };

  const currentConfig = canvasConfig[preset];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load starter elements based on preset
  useEffect(() => {
    if (preset === "visiting_card") {
      setCanvasBg("#0f172a");
      setElements([
        {
          id: "t1",
          type: "text",
          x: 40,
          y: 60,
          width: 300,
          height: 30,
          text: "DIGITAL SEVA KENDRA",
          fontSize: 22,
          fill: "#38bdf8",
          fontWeight: "bold",
          fontFamily: "sans-serif",
        },
        {
          id: "t2",
          type: "text",
          x: 40,
          y: 95,
          width: 300,
          height: 20,
          text: "All Online Govt Services & Photo Studio",
          fontSize: 13,
          fill: "#94a3b8",
          fontFamily: "sans-serif",
        },
        {
          id: "t3",
          type: "text",
          x: 40,
          y: 160,
          width: 300,
          height: 20,
          text: "👤 Sourav Mondal (Proprietor)",
          fontSize: 14,
          fill: "#f8fafc",
          fontWeight: "bold",
          fontFamily: "sans-serif",
        },
        {
          id: "t4",
          type: "text",
          x: 40,
          y: 190,
          width: 300,
          height: 20,
          text: "📞 +91 98321 09876 | ✉️ digital.seva@gmail.com",
          fontSize: 12,
          fill: "#cbd5e1",
          fontFamily: "sans-serif",
        },
        {
          id: "t5",
          type: "text",
          x: 40,
          y: 220,
          width: 400,
          height: 20,
          text: "📍 Main Road, Burdwan, WB - 713101",
          fontSize: 12,
          fill: "#cbd5e1",
          fontFamily: "sans-serif",
        },
      ]);
    } else if (preset === "certificate") {
      setCanvasBg("#fefdf8");
      setElements([
        {
          id: "c-border",
          type: "rect",
          x: 20,
          y: 20,
          width: 660,
          height: 460,
          fill: "transparent",
          stroke: "#b45309",
          strokeWidth: 4,
        },
        {
          id: "c-title",
          type: "text",
          x: 180,
          y: 80,
          width: 400,
          height: 40,
          text: "CERTIFICATE OF EXCELLENCE",
          fontSize: 24,
          fill: "#78350f",
          fontWeight: "bold",
          fontFamily: "serif",
        },
        {
          id: "c-sub",
          type: "text",
          x: 250,
          y: 130,
          width: 400,
          height: 20,
          text: "This is proudly presented to",
          fontSize: 14,
          fill: "#64748b",
          fontFamily: "serif",
        },
        {
          id: "c-name",
          type: "text",
          x: 230,
          y: 200,
          width: 400,
          height: 35,
          text: "Sourav Mondal",
          fontSize: 32,
          fill: "#1e3a8a",
          fontWeight: "bold",
          fontFamily: "serif",
        },
        {
          id: "c-desc",
          type: "text",
          x: 100,
          y: 270,
          width: 500,
          height: 30,
          text: "For outstanding performance in Computer Operations and Digital Literacy",
          fontSize: 14,
          fill: "#334155",
          fontFamily: "serif",
        },
      ]);
    } else if (preset === "banner_flex") {
      setCanvasBg("#1e1b4b");
      setElements([
        {
          id: "b1",
          type: "text",
          x: 60,
          y: 80,
          width: 600,
          height: 50,
          text: "DIGITAL SEVA KENDRA",
          fontSize: 36,
          fill: "#fde047",
          fontWeight: "bold",
          fontFamily: "sans-serif",
        },
        {
          id: "b2",
          type: "text",
          x: 60,
          y: 150,
          width: 600,
          height: 30,
          text: "Aadhaar • PAN • Passport • Smart Card • Xerox • Money Transfer",
          fontSize: 18,
          fill: "#ffffff",
          fontFamily: "sans-serif",
        },
      ]);
    } else {
      setCanvasBg("#ffffff");
      setElements([
        {
          id: "n1",
          type: "text",
          x: 150,
          y: 80,
          width: 300,
          height: 40,
          text: "URGENT NOTICE",
          fontSize: 28,
          fill: "#dc2626",
          fontWeight: "bold",
          fontFamily: "sans-serif",
        },
      ]);
    }
  }, [preset]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, currentConfig.width, currentConfig.height);

    // Draw elements
    elements.forEach((el) => {
      ctx.save();
      if (el.type === "rect") {
        if (el.fill && el.fill !== "transparent") {
          ctx.fillStyle = el.fill;
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
        if (el.stroke) {
          ctx.strokeStyle = el.stroke;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === "circle") {
        ctx.beginPath();
        const r = Math.min(el.width, el.height) / 2;
        ctx.arc(el.x + r, el.y + r, r, 0, Math.PI * 2);
        if (el.fill) {
          ctx.fillStyle = el.fill;
          ctx.fill();
        }
        if (el.stroke) {
          ctx.strokeStyle = el.stroke;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();
        }
      } else if (el.type === "text" && el.text) {
        ctx.font = `${el.fontWeight || "normal"} ${el.fontSize || 16}px ${el.fontFamily || "sans-serif"}`;
        ctx.fillStyle = el.fill || "#000000";
        ctx.fillText(el.text, el.x, el.y);
      } else if (el.type === "image" && el.imgElement) {
        ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height);
      }

      // Draw active selection box
      if (el.id === selectedId) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(el.x - 4, el.y - (el.type === "text" ? (el.fontSize || 16) : 4), el.width + 8, el.height + 8);
      }
      ctx.restore();
    });
  }, [elements, canvasBg, selectedId, currentConfig]);

  const selectedElement = elements.find((e) => e.id === selectedId);

  // Add new Text element
  const handleAddText = () => {
    const newEl: CanvasElement = {
      id: "text-" + Date.now(),
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 25,
      text: language === "bn" ? "নতুন লেখা যোগ করুন" : "Double Click to Edit",
      fontSize: 18,
      fill: canvasBg === "#ffffff" ? "#0f172a" : "#ffffff",
      fontFamily: "sans-serif",
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Add new Rect
  const handleAddRect = () => {
    const newEl: CanvasElement = {
      id: "rect-" + Date.now(),
      type: "rect",
      x: 80,
      y: 80,
      width: 150,
      height: 80,
      fill: "#3b82f6",
      stroke: "#1d4ed8",
      strokeWidth: 2,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Add image
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const newEl: CanvasElement = {
          id: "img-" + Date.now(),
          type: "image",
          x: 100,
          y: 100,
          width: 120,
          height: (120 * img.height) / img.width,
          src: reader.result as string,
          imgElement: img,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateSelected = (props: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...props } : el))
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `Design_${preset}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(language === "bn" ? "ডিজাইন PNG ফরম্যাটে ডাউনলোড হয়েছে" : "Design downloaded as PNG");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t.designStudio.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.designStudio.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "visiting_card", labelBn: "ভিজিটিং কার্ড", labelEn: "Visiting Card", icon: CreditCard },
          { id: "certificate", labelBn: "সার্টিফিকেট", labelEn: "Certificate", icon: Award },
          { id: "banner_flex", labelBn: "দোকানের ব্যানার (Flex)", labelEn: "Shop Banner", icon: Flag },
          { id: "notice_poster", labelBn: "নোটিশ / পোস্টার", labelEn: "Notice / Poster", icon: Type },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = preset === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPreset(item.id as DesignPreset)}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSelected
                  ? "bg-pink-600 text-white border-pink-500 shadow-md"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{language === "bn" ? item.labelBn : item.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Design Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Toolbar & Element Inspector (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          {/* Add Elements buttons */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-2">
              {language === "bn" ? "উপাদান যোগ করুন" : "Add Elements"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleAddText}
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-pink-500 rounded-xl flex flex-col items-center gap-1 font-semibold text-slate-200"
              >
                <Type className="w-4 h-4 text-pink-400" />
                <span>Text</span>
              </button>
              <button
                onClick={handleAddRect}
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-pink-500 rounded-xl flex flex-col items-center gap-1 font-semibold text-slate-200"
              >
                <Square className="w-4 h-4 text-cyan-400" />
                <span>Shape</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-pink-500 rounded-xl flex flex-col items-center gap-1 font-semibold text-slate-200"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Logo / Pic</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </div>

          {/* Background Color */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
              Canvas Background
            </span>
            <div className="flex gap-2">
              {["#ffffff", "#0f172a", "#1e1b4b", "#fefdf8", "#064e3b", "#7f1d1d"].map((col) => (
                <button
                  key={col}
                  onClick={() => setCanvasBg(col)}
                  style={{ backgroundColor: col }}
                  className={`w-7 h-7 rounded-lg border ${
                    canvasBg === col ? "border-pink-500 ring-2 ring-pink-500/50" : "border-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Selected Element Controls */}
          {selectedElement ? (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-400 uppercase tracking-wider">
                  Edit Selected {selectedElement.type}
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedElement.type === "text" && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Text Content</label>
                    <input
                      type="text"
                      value={selectedElement.text || ""}
                      onChange={(e) => handleUpdateSelected({ text: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Font Size</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 16}
                        onChange={(e) => handleUpdateSelected({ fontSize: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.fill || "#ffffff"}
                        onChange={(e) => handleUpdateSelected({ fill: e.target.value })}
                        className="w-full h-8 bg-slate-950 border border-slate-700 rounded-xl p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Position controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-slate-400 block mb-1">X Position (px)</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => handleUpdateSelected({ x: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Y Position (px)</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => handleUpdateSelected({ y: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
              Click on any layer on canvas to inspect and edit properties.
            </p>
          )}
        </div>

        {/* Right Canvas Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[500px] overflow-auto">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 shadow-2xl flex items-center justify-center max-w-full overflow-auto">
            <canvas
              ref={canvasRef}
              width={currentConfig.width}
              height={currentConfig.height}
              className="rounded-lg shadow-xl cursor-crosshair border border-slate-700"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <span>Preset: <strong className="text-slate-200">{currentConfig.label}</strong></span>
            <span>•</span>
            <span>Total Layers: <strong className="text-slate-200">{elements.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
