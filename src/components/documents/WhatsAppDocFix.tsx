import React, { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import {
  QuadCorners,
  EnhancementMode,
  EnhancementSettings,
  defaultEnhancementSettings,
  warpPerspective,
  rotateCanvas,
  detectDeskewAngle,
  applyDocumentEnhancement,
  getDefaultCorners,
  Point,
} from "../../services/deskewService";
import { renderPdfPage } from "../../services/pdfRenderService";
import { generateSampleDoc } from "../../services/sampleDocuments";
import { jsPDF } from "jspdf";
import {
  Scan,
  RotateCw,
  RotateCcw,
  Sparkles,
  Printer,
  Download,
  FileCode2,
  FileImage,
  Upload,
  Layers,
  Sliders,
  Check,
  RefreshCw,
  Eye,
  Grid,
  FileText,
  HelpCircle,
  Scissors,
  Wand2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Share2,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Layers3,
  FileCheck,
} from "lucide-react";

export interface SavedPageItem {
  id: string;
  pageNumber: number;
  title: string;
  sourceDataUrl: string;
  sourceDimensions: { width: number; height: number };
  corners: QuadCorners;
  rotation: number;
  isStraightened: boolean;
  straightenedDataUrl: string | null;
  enhancedDataUrl: string | null;
  settings: EnhancementSettings;
  timestamp: number;
}

export const WhatsAppDocFix: React.FC = () => {
  const { language, notify, setActiveSection } = useApp();

  // Mode: "preview" (Stage 0: Original Preview & Direct Print), "crop" (Stage 1: Corner perspective crop), or "enhance" (Stage 2: Clean & Print)
  const [stage, setStage] = useState<"preview" | "crop" | "enhance">("preview");

  // Original Source Image/Canvas Data
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [sourceDimensions, setSourceDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [fileName, setFileName] = useState<string>("WhatsApp_Doc");

  // PDF Page Support
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | File | null>(null);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  // Stage 1: Straightening & 4-Corner Quad
  const [corners, setCorners] = useState<QuadCorners>({
    topLeft: { x: 50, y: 50 },
    topRight: { x: 550, y: 50 },
    bottomRight: { x: 550, y: 750 },
    bottomLeft: { x: 50, y: 750 },
  });
  const [activeCorner, setActiveCorner] = useState<keyof QuadCorners | null>(null);
  const [fineRotation, setFineRotation] = useState<number>(0); // -45 to 45
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Stage 2: Straightened & Enhanced Output
  const [straightenedCanvas, setStraightenedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [enhancedDataUrl, setEnhancedDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<EnhancementSettings>(defaultEnhancementSettings);
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);

  // Print & Sheet Settings
  const [paperSize, setPaperSize] = useState<"A4" | "Legal" | "Letter">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [paperMargin, setPaperMargin] = useState<"standard" | "narrow" | "none">("standard");
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Multi-page Auto-Save Management (বাঁকা সোজা করলে পেজ গুলি অটোমেটিক সেভ হবে)
  const [savedPages, setSavedPages] = useState<SavedPageItem[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isAutoSavedNoticeVisible, setIsAutoSavedNoticeVisible] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreFilesInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load Initial Demo Sample on Mount so user sees immediate results
  useEffect(() => {
    loadSample("aadhaar");
  }, []);

  // Listen to Global Paste (Ctrl+V) from WhatsApp Web (both Image & PDF)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          item.type.startsWith("image/") ||
          item.type === "application/pdf" ||
          item.type === "application/x-pdf"
        ) {
          const file = item.getAsFile();
          if (file) {
            processUploadedFile(file);
            notify(
              language === "bn"
                ? "ক্লিপবোর্ড থেকে ফাইল সফলভাবে লোড হয়েছে!"
                : "File loaded from clipboard!",
              "success"
            );
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [language]);

  // Re-render crop canvas whenever switching to crop stage
  useEffect(() => {
    if (stage === "crop" && imageObjRef.current) {
      const timer = setTimeout(() => {
        if (imageObjRef.current) {
          renderCropEditor(imageObjRef.current, corners, fineRotation, showGrid);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [stage, corners, fineRotation, showGrid]);

  /**
   * Drag & Drop event handlers
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Load Demo Sample Documents
   */
  const loadSample = (type: "aadhaar" | "application" | "marksheet") => {
    setLoadingFile(true);
    setIsPdf(false);
    setPdfBlob(null);
    setPdfTotalPages(1);
    setPdfPage(1);
    const dataUrl = generateSampleDoc(type);
    const sampleNames = {
      aadhaar: "WhatsApp_Aadhaar_Slanted.jpg",
      application: "WhatsApp_Govt_Application.jpg",
      marksheet: "WhatsApp_Marksheet_Tilted.jpg",
    };
    const title = sampleNames[type];
    setFileName(title);

    const initialPage: SavedPageItem = {
      id: `sample-${type}-${Date.now()}`,
      pageNumber: 1,
      title: title,
      sourceDataUrl: dataUrl,
      sourceDimensions: { width: 800, height: 1000 },
      corners: {
        topLeft: { x: 50, y: 50 },
        topRight: { x: 550, y: 50 },
        bottomRight: { x: 550, y: 750 },
        bottomLeft: { x: 50, y: 750 },
      },
      rotation: 0,
      isStraightened: false,
      straightenedDataUrl: null,
      enhancedDataUrl: null,
      settings: { ...defaultEnhancementSettings },
      timestamp: Date.now(),
    };
    setSavedPages([initialPage]);
    setActivePageIndex(0);

    loadImageIntoWorkspace(dataUrl, undefined, 0, 0, title);
  };

  /**
   * Loads image DataURL into the workspace and initializes corner coordinates
   */
  const loadImageIntoWorkspace = (
    dataUrl: string,
    initialCorners?: QuadCorners,
    initialRot?: number,
    pageIdx: number = 0,
    docTitle?: string
  ) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      setSourceDataUrl(dataUrl);
      setSourceDimensions({ width: img.width, height: img.height });

      // Use supplied corners or calculate 5% inset
      const initCorners = initialCorners || getDefaultCorners(img.width, img.height);
      const rot = initialRot !== undefined ? initialRot : 0;
      setCorners(initCorners);
      setFineRotation(rot);
      setStage("preview");
      setLoadingFile(false);

      // Pre-initialize straightened canvas with full image so print/filters are immediately ready
      try {
        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = img.width;
        fullCanvas.height = img.height;
        const fCtx = fullCanvas.getContext("2d");
        if (fCtx) {
          fCtx.drawImage(img, 0, 0);
          setStraightenedCanvas(fullCanvas);
          const enhanced = applyDocumentEnhancement(fullCanvas, settings);
          setEnhancedDataUrl(enhanced.toDataURL("image/jpeg", 0.95));
        }
      } catch (e) {
        console.error("Canvas pre-init error:", e);
      }

      // Sync savedPages list
      setSavedPages((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: `page-${Date.now()}`,
              pageNumber: 1,
              title: docTitle || fileName || "Page 1",
              sourceDataUrl: dataUrl,
              sourceDimensions: { width: img.width, height: img.height },
              corners: initCorners,
              rotation: rot,
              isStraightened: false,
              straightenedDataUrl: null,
              enhancedDataUrl: null,
              settings: { ...settings },
              timestamp: Date.now(),
            },
          ];
        }

        const updated = [...prev];
        if (updated[pageIdx]) {
          updated[pageIdx] = {
            ...updated[pageIdx],
            sourceDataUrl: dataUrl,
            sourceDimensions: { width: img.width, height: img.height },
            corners: initialCorners || updated[pageIdx].corners,
            rotation: initialRot !== undefined ? initialRot : updated[pageIdx].rotation,
          };
          return updated;
        }
        return prev;
      });

      // Render crop canvas
      renderCropEditor(img, initCorners, rot, showGrid);
    };
    img.onerror = () => {
      setLoadingFile(false);
      notify(language === "bn" ? "ছবি লোড করতে সমস্যা হয়েছে" : "Failed to load image", "error");
    };
    img.src = dataUrl;
  };

  /**
   * Universal file processor for Images & PDFs
   */
  const processUploadedFile = (file: File) => {
    setFileName(file.name.replace(/\.[^/.]+$/, ""));

    const isPdfFile =
      file.type === "application/pdf" ||
      file.type === "application/x-pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (isPdfFile) {
      handlePdfUpload(file);
    } else {
      handleImageUpload(file);
    }
  };

  /**
   * File upload handler for input change (supports multiple files)
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files) as File[];
    e.target.value = "";

    if (fileList.length === 1) {
      processUploadedFile(fileList[0]);
    } else {
      // Multiple files uploaded at once
      handleUploadMultipleFiles(fileList);
    }
  };

  /**
   * Upload multiple image files and register them into savedPages
   */
  const handleUploadMultipleFiles = async (fileList: File[]) => {
    setLoadingFile(true);
    const pages: SavedPageItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const isPdfFile =
        file.type === "application/pdf" ||
        file.type === "application/x-pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (isPdfFile) {
        try {
          const rendered = await renderPdfPage(file, 1, 2.0);
          pages.push({
            id: `doc-${Date.now()}-${i}`,
            pageNumber: pages.length + 1,
            title: file.name.replace(/\.[^/.]+$/, ""),
            sourceDataUrl: rendered.dataUrl,
            sourceDimensions: { width: rendered.width, height: rendered.height },
            corners: getDefaultCorners(rendered.width, rendered.height),
            rotation: 0,
            isStraightened: false,
            straightenedDataUrl: null,
            enhancedDataUrl: null,
            settings: { ...defaultEnhancementSettings },
            timestamp: Date.now(),
          });
        } catch (e) {
          console.error("PDF upload error:", e);
        }
      } else {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (!dataUrl) {
              resolve();
              return;
            }
            const img = new Image();
            img.onload = () => {
              pages.push({
                id: `doc-${Date.now()}-${i}`,
                pageNumber: pages.length + 1,
                title: file.name.replace(/\.[^/.]+$/, "") || `Page ${pages.length + 1}`,
                sourceDataUrl: dataUrl,
                sourceDimensions: { width: img.width, height: img.height },
                corners: getDefaultCorners(img.width, img.height),
                rotation: 0,
                isStraightened: false,
                straightenedDataUrl: null,
                enhancedDataUrl: null,
                settings: { ...defaultEnhancementSettings },
                timestamp: Date.now(),
              });
              resolve();
            };
            img.onerror = () => resolve();
            img.src = dataUrl;
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      }
    }

    if (pages.length > 0) {
      setSavedPages(pages);
      setActivePageIndex(0);
      setPdfTotalPages(pages.length);
      setPdfPage(1);
      setFileName(pages[0].title);
      loadImageIntoWorkspace(pages[0].sourceDataUrl, pages[0].corners, pages[0].rotation, 0, pages[0].title);
      notify(
        language === "bn"
          ? `মোট ${pages.length}টি ফাইল সফলভাবে আপলোড হয়েছে!`
          : `${pages.length} files loaded successfully!`,
        "success"
      );
    } else {
      setLoadingFile(false);
    }
  };

  /**
   * Append more files to existing collection
   */
  const handleAddMoreFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files) as File[];
    e.target.value = "";

    setLoadingFile(true);
    let addedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const isPdfFile =
        file.type === "application/pdf" ||
        file.type === "application/x-pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (isPdfFile) {
        try {
          const rendered = await renderPdfPage(file, 1, 2.0);
          setSavedPages((prev) => [
            ...prev,
            {
              id: `append-${Date.now()}-${i}`,
              pageNumber: prev.length + 1,
              title: file.name.replace(/\.[^/.]+$/, "") || `Page ${prev.length + 1}`,
              sourceDataUrl: rendered.dataUrl,
              sourceDimensions: { width: rendered.width, height: rendered.height },
              corners: getDefaultCorners(rendered.width, rendered.height),
              rotation: 0,
              isStraightened: false,
              straightenedDataUrl: null,
              enhancedDataUrl: null,
              settings: { ...defaultEnhancementSettings },
              timestamp: Date.now(),
            },
          ]);
          addedCount++;
        } catch (err) {
          console.error("PDF append error:", err);
        }
      } else {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (!dataUrl) {
              resolve();
              return;
            }
            const img = new Image();
            img.onload = () => {
              setSavedPages((prev) => [
                ...prev,
                {
                  id: `append-${Date.now()}-${i}`,
                  pageNumber: prev.length + 1,
                  title: file.name.replace(/\.[^/.]+$/, "") || `Page ${prev.length + 1}`,
                  sourceDataUrl: dataUrl,
                  sourceDimensions: { width: img.width, height: img.height },
                  corners: getDefaultCorners(img.width, img.height),
                  rotation: 0,
                  isStraightened: false,
                  straightenedDataUrl: null,
                  enhancedDataUrl: null,
                  settings: { ...defaultEnhancementSettings },
                  timestamp: Date.now(),
                },
              ]);
              addedCount++;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = dataUrl;
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      }
    }

    setLoadingFile(false);
    notify(
      language === "bn"
        ? `${addedCount}টি নতুন পেজ তালিকায় যোগ করা হয়েছে!`
        : `${addedCount} new pages added to list!`,
      "success"
    );
  };

  const handleImageUpload = (file: File) => {
    setLoadingFile(true);
    setIsPdf(false);
    setPdfBlob(null);
    setPdfTotalPages(1);
    setPdfPage(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        const initialPage: SavedPageItem = {
          id: `img-${Date.now()}`,
          pageNumber: 1,
          title: file.name.replace(/\.[^/.]+$/, ""),
          sourceDataUrl: dataUrl,
          sourceDimensions: { width: 800, height: 1000 },
          corners: {
            topLeft: { x: 50, y: 50 },
            topRight: { x: 550, y: 50 },
            bottomRight: { x: 550, y: 750 },
            bottomLeft: { x: 50, y: 750 },
          },
          rotation: 0,
          isStraightened: false,
          straightenedDataUrl: null,
          enhancedDataUrl: null,
          settings: { ...defaultEnhancementSettings },
          timestamp: Date.now(),
        };
        setSavedPages([initialPage]);
        setActivePageIndex(0);
        loadImageIntoWorkspace(dataUrl, undefined, 0, 0, initialPage.title);
        notify(
          language === "bn"
            ? "ছবি সফলভাবে লোড হয়েছে!"
            : "Image loaded successfully!",
          "success"
        );
      }
    };
    reader.onerror = () => {
      setLoadingFile(false);
      notify(
        language === "bn"
          ? "ছবি পড়তে ব্যর্থ হয়েছে।"
          : "Failed to read image file.",
        "error"
      );
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = async (file: File) => {
    try {
      setLoadingFile(true);
      setIsPdf(true);
      setPdfBlob(file);
      setPdfPage(1);

      const rendered = await renderPdfPage(file, 1, 2.0);
      setPdfTotalPages(rendered.totalPages);
      const docTitle = file.name.replace(/\.[^/.]+$/, "");
      setFileName(docTitle);

      // Pre-populate saved pages list for all PDF pages
      const initialPdfPages: SavedPageItem[] = [];
      for (let p = 1; p <= rendered.totalPages; p++) {
        initialPdfPages.push({
          id: `pdf-page-${p}-${Date.now()}`,
          pageNumber: p,
          title: `${docTitle} - Page ${p}`,
          sourceDataUrl: p === 1 ? rendered.dataUrl : "",
          sourceDimensions:
            p === 1
              ? { width: rendered.width, height: rendered.height }
              : { width: 0, height: 0 },
          corners: getDefaultCorners(rendered.width, rendered.height),
          rotation: 0,
          isStraightened: false,
          straightenedDataUrl: null,
          enhancedDataUrl: null,
          settings: { ...defaultEnhancementSettings },
          timestamp: Date.now(),
        });
      }
      setSavedPages(initialPdfPages);
      setActivePageIndex(0);

      loadImageIntoWorkspace(
        rendered.dataUrl,
        undefined,
        0,
        0,
        `${docTitle} - Page 1`
      );
      notify(
        language === "bn"
          ? `PDF সফলভাবে লোড হয়েছে (মোট ${rendered.totalPages} পেজ)`
          : `PDF loaded successfully (${rendered.totalPages} pages)`,
        "success"
      );
    } catch (err: any) {
      console.error("PDF Render Error:", err);
      setLoadingFile(false);
      notify(
        language === "bn"
          ? `PDF ফাইল প্রসেস করতে ব্যর্থ হয়েছে: ${err?.message || "ফরম্যাট চেক করুন"}`
          : `Failed to render PDF: ${err?.message || "Check format"}`,
        "error"
      );
    }
  };

  /**
   * Save current active page state into savedPages array
   */
  const syncActivePageToState = () => {
    setSavedPages((prev) => {
      if (!prev[activePageIndex]) return prev;
      const copy = [...prev];
      copy[activePageIndex] = {
        ...copy[activePageIndex],
        corners: { ...corners },
        rotation: fineRotation,
        settings: { ...settings },
        enhancedDataUrl: enhancedDataUrl || copy[activePageIndex].enhancedDataUrl,
        straightenedDataUrl: straightenedCanvas
          ? straightenedCanvas.toDataURL("image/jpeg", 0.95)
          : copy[activePageIndex].straightenedDataUrl,
      };
      return copy;
    });
  };

  /**
   * Select a saved page from the gallery/tray
   */
  const selectSavedPage = async (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= savedPages.length) return;

    // 1. Sync current state before switching
    syncActivePageToState();

    // 2. Target page info
    setActivePageIndex(targetIndex);
    const targetPage = savedPages[targetIndex];
    if (!targetPage) return;

    setPdfPage(targetPage.pageNumber);

    // 3. If target page was already straightened, restore its state immediately
    if (targetPage.isStraightened && targetPage.straightenedDataUrl) {
      setLoadingFile(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageObjRef.current = img;
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
        setStraightenedCanvas(c);
        setEnhancedDataUrl(targetPage.enhancedDataUrl || targetPage.straightenedDataUrl);
        setSettings(targetPage.settings);
        setSourceDataUrl(targetPage.sourceDataUrl || targetPage.straightenedDataUrl);
        setCorners(targetPage.corners);
        setFineRotation(targetPage.rotation);
        setStage("enhance");
        setLoadingFile(false);
      };
      img.onerror = () => {
        setLoadingFile(false);
      };
      img.src = targetPage.straightenedDataUrl;
      return;
    }

    // 4. If target page already has raw sourceDataUrl
    if (targetPage.sourceDataUrl) {
      loadImageIntoWorkspace(
        targetPage.sourceDataUrl,
        targetPage.corners,
        targetPage.rotation,
        targetIndex,
        targetPage.title
      );
      setSettings(targetPage.settings);
      setStage("preview");
      return;
    }

    // 5. If it's a PDF page that hasn't been rendered yet
    if (isPdf && pdfBlob) {
      try {
        setLoadingFile(true);
        const rendered = await renderPdfPage(pdfBlob, targetPage.pageNumber, 2.0);
        setSavedPages((prev) => {
          const copy = [...prev];
          if (copy[targetIndex]) {
            copy[targetIndex] = {
              ...copy[targetIndex],
              sourceDataUrl: rendered.dataUrl,
              sourceDimensions: { width: rendered.width, height: rendered.height },
              corners: getDefaultCorners(rendered.width, rendered.height),
            };
          }
          return copy;
        });
        loadImageIntoWorkspace(
          rendered.dataUrl,
          undefined,
          0,
          targetIndex,
          targetPage.title
        );
      } catch (err: any) {
        console.error(err);
        setLoadingFile(false);
        notify(
          language === "bn" ? "পেজ লোড করতে সমস্যা হয়েছে" : "Failed to load page",
          "error"
        );
      }
    }
  };

  /**
   * PDF Page Navigation helper
   */
  const switchPdfPage = async (newPage: number) => {
    selectSavedPage(newPage - 1);
  };

  /**
   * Delete a page from saved pages
   */
  const deleteSavedPage = (indexToDelete: number) => {
    if (savedPages.length <= 1) {
      notify(
        language === "bn"
          ? "কমপক্ষে ১টি পেজ তালিকায় থাকতে হবে"
          : "At least 1 page must remain in the list",
        "error"
      );
      return;
    }

    const updated = savedPages.filter((_, idx) => idx !== indexToDelete);
    const renumbered = updated.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
    }));
    setSavedPages(renumbered);

    let nextActive = activePageIndex;
    if (activePageIndex >= renumbered.length) {
      nextActive = renumbered.length - 1;
    } else if (activePageIndex === indexToDelete) {
      nextActive = Math.max(0, indexToDelete - 1);
    }
    setActivePageIndex(nextActive);
    selectSavedPage(nextActive);

    notify(
      language === "bn" ? "পেজ মুছে ফেলা হয়েছে" : "Page deleted from list",
      "info"
    );
  };

  /**
   * Renders the interactive crop/perspective canvas editor
   */
  const renderCropEditor = useCallback(
    (
      img: HTMLImageElement,
      quad: QuadCorners,
      rot: number,
      drawGrid: boolean
    ) => {
      const canvas = cropCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw image with optional fine rotation
      ctx.save();
      if (rot !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else {
        ctx.drawImage(img, 0, 0);
      }
      ctx.restore();

      // 2. Dim outside area
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cutout quad
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
      ctx.lineTo(quad.topRight.x, quad.topRight.y);
      ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
      ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Draw Quad Outline
      ctx.save();
      ctx.strokeStyle = "#38bdf8"; // Sky cyan line
      ctx.lineWidth = Math.max(3, Math.round(canvas.width / 400));
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
      ctx.lineTo(quad.topRight.x, quad.topRight.y);
      ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
      ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 4. Optional Horizontal Alignment Grid lines inside quad for straight checking
      if (drawGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const steps = 6;
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          // Interpolate left to right
          const lx = quad.topLeft.x + (quad.bottomLeft.x - quad.topLeft.x) * t;
          const ly = quad.topLeft.y + (quad.bottomLeft.y - quad.topLeft.y) * t;
          const rx = quad.topRight.x + (quad.bottomRight.x - quad.topRight.x) * t;
          const ry = quad.topRight.y + (quad.bottomRight.y - quad.topRight.y) * t;

          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Draw Corner Handles
      const handleRadius = Math.max(14, Math.round(canvas.width / 80));
      const cornerList: { key: keyof QuadCorners; pt: Point; label: string }[] = [
        { key: "topLeft", pt: quad.topLeft, label: "TL" },
        { key: "topRight", pt: quad.topRight, label: "TR" },
        { key: "bottomRight", pt: quad.bottomRight, label: "BR" },
        { key: "bottomLeft", pt: quad.bottomLeft, label: "BL" },
      ];

      cornerList.forEach(({ pt }) => {
        ctx.save();
        // Outer glowing ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, handleRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.fill();

        // Inner solid handle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0284c7";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // Center crosshair
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pt.x - 5, pt.y);
        ctx.lineTo(pt.x + 5, pt.y);
        ctx.moveTo(pt.x, pt.y - 5);
        ctx.lineTo(pt.x, pt.y + 5);
        ctx.stroke();

        ctx.restore();
      });
    },
    []
  );

  // Mouse / Touch Dragging for 4 Corners
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    // Threshold distance to grab a corner
    const grabRadius = Math.max(30, Math.round(canvas.width / 25));

    const distTL = Math.hypot(corners.topLeft.x - pt.x, corners.topLeft.y - pt.y);
    const distTR = Math.hypot(corners.topRight.x - pt.x, corners.topRight.y - pt.y);
    const distBR = Math.hypot(corners.bottomRight.x - pt.x, corners.bottomRight.y - pt.y);
    const distBL = Math.hypot(corners.bottomLeft.x - pt.x, corners.bottomLeft.y - pt.y);

    const minDist = Math.min(distTL, distTR, distBR, distBL);
    if (minDist <= grabRadius) {
      if (minDist === distTL) setActiveCorner("topLeft");
      else if (minDist === distTR) setActiveCorner("topRight");
      else if (minDist === distBR) setActiveCorner("bottomRight");
      else setActiveCorner("bottomLeft");
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!activeCorner || !imageObjRef.current) return;
    const pt = getCanvasCoords(e);
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    // Clamp inside canvas bounds
    const clampedX = Math.max(0, Math.min(canvas.width, pt.x));
    const clampedY = Math.max(0, Math.min(canvas.height, pt.y));

    const updatedCorners = {
      ...corners,
      [activeCorner]: { x: clampedX, y: clampedY },
    };
    setCorners(updatedCorners);
    renderCropEditor(imageObjRef.current, updatedCorners, fineRotation, showGrid);
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  /**
   * Rotate entire source by 90 degrees
   */
  const handle90Rotate = (direction: "cw" | "ccw") => {
    if (!imageObjRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = imageObjRef.current.width;
    canvas.height = imageObjRef.current.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imageObjRef.current, 0, 0);

    const rotated = rotateCanvas(canvas, direction === "cw" ? 90 : -90);
    loadImageIntoWorkspace(rotated.toDataURL("image/jpeg", 0.95));
    notify(
      language === "bn"
        ? `ছবি ৯০° ${direction === "cw" ? "ডানে" : "বামে"} ঘোরানো হয়েছে`
        : `Rotated 90° ${direction === "cw" ? "clockwise" : "counter-clockwise"}`,
      "info"
    );
  };

  /**
   * Fine angle rotation slider change (-45 to +45 deg)
   */
  const handleFineRotateChange = (deg: number) => {
    setFineRotation(deg);
    if (imageObjRef.current) {
      renderCropEditor(imageObjRef.current, corners, deg, showGrid);
    }
  };

  /**
   * Auto-Deskew 1-Click
   */
  const handleAutoDeskew = () => {
    if (!imageObjRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = imageObjRef.current.width;
    canvas.height = imageObjRef.current.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imageObjRef.current, 0, 0);

    const angle = detectDeskewAngle(canvas);
    if (Math.abs(angle) < 0.2) {
      notify(
        language === "bn"
          ? "ডকুমেন্টটি ইতিমধ্যে সোজা রয়েছে!"
          : "Document is already straight!",
        "info"
      );
      return;
    }

    const rotated = rotateCanvas(canvas, angle);
    loadImageIntoWorkspace(rotated.toDataURL("image/jpeg", 0.95));
    notify(
      language === "bn"
        ? `অটো সোজা সম্পন্ন! (${angle > 0 ? "+" : ""}${angle.toFixed(1)}° সোজা করা হয়েছে)`
        : `Auto-deskew applied: ${angle.toFixed(1)}°`,
      "success"
    );
  };

  /**
   * Reset 4 Corners to full frame
   */
  const handleResetCorners = () => {
    if (!imageObjRef.current) return;
    const reset = getDefaultCorners(imageObjRef.current.width, imageObjRef.current.height);
    setCorners(reset);
    renderCropEditor(imageObjRef.current, reset, fineRotation, showGrid);
  };

  /**
   * Apply Perspective Warp & Move to Stage 2 (Clean & Print) - AUTO SAVES PAGE
   */
  const applyStraighten = () => {
    if (!imageObjRef.current) return;

    // Apply rotation to source first if fine rotation was dialed in
    let baseCanvas = document.createElement("canvas");
    baseCanvas.width = imageObjRef.current.width;
    baseCanvas.height = imageObjRef.current.height;
    const bCtx = baseCanvas.getContext("2d");
    if (!bCtx) return;
    bCtx.drawImage(imageObjRef.current, 0, 0);

    if (fineRotation !== 0) {
      baseCanvas = rotateCanvas(baseCanvas, fineRotation);
    }

    // Warp perspective
    const warped = warpPerspective(baseCanvas, corners);
    setStraightenedCanvas(warped);

    // Apply initial clean filter
    const enhanced = applyDocumentEnhancement(warped, settings);
    const enhancedUrl = enhanced.toDataURL("image/jpeg", 0.95);
    const straightenedUrl = warped.toDataURL("image/jpeg", 0.95);
    setEnhancedDataUrl(enhancedUrl);

    // === AUTO-SAVE THIS PAGE STATE (বাঁকা সোজা করলে পেজ গুলি অটোমেটিক সেভ হবে) ===
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastSavedTime(timeNow);
    setIsAutoSavedNoticeVisible(true);
    setTimeout(() => {
      setIsAutoSavedNoticeVisible(false);
    }, 3500);

    setSavedPages((prev) => {
      const updated = [...prev];
      if (updated[activePageIndex]) {
        updated[activePageIndex] = {
          ...updated[activePageIndex],
          corners: { ...corners },
          rotation: fineRotation,
          isStraightened: true,
          straightenedDataUrl: straightenedUrl,
          enhancedDataUrl: enhancedUrl,
          settings: { ...settings },
          timestamp: Date.now(),
        };
      } else {
        updated.push({
          id: `page-${Date.now()}`,
          pageNumber: updated.length + 1,
          title: `${fileName} - Page ${updated.length + 1}`,
          sourceDataUrl: sourceDataUrl || enhancedUrl,
          sourceDimensions,
          corners: { ...corners },
          rotation: fineRotation,
          isStraightened: true,
          straightenedDataUrl: straightenedUrl,
          enhancedDataUrl: enhancedUrl,
          settings: { ...settings },
          timestamp: Date.now(),
        });
      }
      return updated;
    });

    setStage("enhance");
    notify(
      language === "bn"
        ? `পেজ ${activePageIndex + 1} সফলভাবে সোজা হয়েছে এবং স্বয়ংক্রিয়ভাবে সেভ করা হয়েছে!`
        : `Page ${activePageIndex + 1} straightened & auto-saved!`,
      "success"
    );
  };

  /**
   * Update Enhancement Settings and Re-render Output (Auto-syncs with saved page)
   */
  const updateEnhancement = (newSettings: Partial<EnhancementSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (!straightenedCanvas) return;

    const enhanced = applyDocumentEnhancement(straightenedCanvas, updated);
    const enhancedUrl = enhanced.toDataURL("image/jpeg", 0.95);
    setEnhancedDataUrl(enhancedUrl);

    // Auto-update saved page with new filter/enhancement
    setSavedPages((prev) => {
      if (!prev[activePageIndex]) return prev;
      const copy = [...prev];
      copy[activePageIndex] = {
        ...copy[activePageIndex],
        enhancedDataUrl: enhancedUrl,
        settings: updated,
        timestamp: Date.now(),
      };
      return copy;
    });
  };

  /**
   * 1-Click Direct Print to A4
   */
  const handleDirectPrint = () => {
    if (!enhancedDataUrl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const marginStyle =
      paperMargin === "standard" ? "10mm" : paperMargin === "narrow" ? "4mm" : "0mm";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName} - Print</title>
        <style>
          @page {
            size: ${paperSize} ${orientation};
            margin: ${marginStyle};
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${enhancedDataUrl}" onload="window.print(); setTimeout(function(){ window.close(); }, 500);" />
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Download High Resolution PDF
   */
  const handleDownloadPdf = () => {
    if (!enhancedDataUrl || !straightenedCanvas) return;

    const isLandscape = orientation === "landscape";
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: paperSize.toLowerCase() as "a4" | "legal" | "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = paperMargin === "standard" ? 10 : paperMargin === "narrow" ? 4 : 0;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const imgRatio = straightenedCanvas.width / straightenedCanvas.height;
    let drawW = availWidth;
    let drawH = availWidth / imgRatio;

    if (drawH > availHeight) {
      drawH = availHeight;
      drawW = availHeight * imgRatio;
    }

    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    pdf.addImage(enhancedDataUrl, "JPEG", x, y, drawW, drawH);
    pdf.save(`${fileName}_Clean_Print.pdf`);
    notify(
      language === "bn"
        ? "HD প্রিন্ট-রেডি PDF ডাউনলোড হয়েছে!"
        : "Print-ready PDF downloaded!",
      "success"
    );
  };

  /**
   * Download Clean JPEG
   */
  const handleDownloadJpeg = () => {
    if (!enhancedDataUrl) return;
    const a = document.createElement("a");
    a.href = enhancedDataUrl;
    a.download = `${fileName}_Cleaned.jpg`;
    a.click();
    notify(
      language === "bn"
        ? "ক্লিন ছবি ডাউনলোড হয়েছে!"
        : "Cleaned image downloaded!",
      "success"
    );
  };

  /**
   * 1-Click Direct Print Original Document (without any editing or cropping, natural colors)
   */
  const handleDirectPrintOriginal = () => {
    if (!sourceDataUrl) {
      notify(
        language === "bn"
          ? "প্রিন্ট করার মতো কোনো ডকুমেন্ট পাওয়া যায়নি"
          : "No document loaded to print",
        "error"
      );
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const marginStyle =
      paperMargin === "standard" ? "10mm" : paperMargin === "narrow" ? "4mm" : "0mm";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName} - Original Print</title>
        <style>
          @page {
            size: ${paperSize} ${orientation};
            margin: ${marginStyle};
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${sourceDataUrl}" onload="window.print(); setTimeout(function(){ window.close(); }, 500);" />
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Download Original Document as Print-Ready A4 PDF
   */
  const handleDownloadOriginalPdf = () => {
    if (!sourceDataUrl) return;

    const isLandscape = orientation === "landscape";
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: paperSize.toLowerCase() as "a4" | "legal" | "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = paperMargin === "standard" ? 10 : paperMargin === "narrow" ? 4 : 0;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const imgW = sourceDimensions.width || 800;
    const imgH = sourceDimensions.height || 1000;
    const imgRatio = imgW / imgH;

    let drawW = availWidth;
    let drawH = availWidth / imgRatio;

    if (drawH > availHeight) {
      drawH = availHeight;
      drawW = availHeight * imgRatio;
    }

    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    pdf.addImage(sourceDataUrl, "JPEG", x, y, drawW, drawH);
    pdf.save(`${fileName}_Original_Color.pdf`);
    notify(
      language === "bn"
        ? "অরিজিনাল কালার PDF ডাউনলোড হয়েছে!"
        : "Original color PDF downloaded!",
      "success"
    );
  };

  /**
   * Download Original Image
   */
  const handleDownloadOriginalImage = () => {
    if (!sourceDataUrl) return;
    const a = document.createElement("a");
    a.href = sourceDataUrl;
    a.download = `${fileName}_Original.jpg`;
    a.click();
    notify(
      language === "bn"
        ? "অরিজিনাল ছবি ডাউনলোড হয়েছে!"
        : "Original image downloaded!",
      "success"
    );
  };

  /**
   * Download All Saved Pages as a Single Multi-Page PDF
   */
  const handleDownloadAllPagesPdf = () => {
    if (savedPages.length === 0) return;

    // Sync current active page first
    syncActivePageToState();

    const isLandscape = orientation === "landscape";
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: paperSize.toLowerCase() as "a4" | "legal" | "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = paperMargin === "standard" ? 10 : paperMargin === "narrow" ? 4 : 0;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    let addedCount = 0;

    for (let i = 0; i < savedPages.length; i++) {
      const pageItem = savedPages[i];
      // Use enhanced/straightened image if available, else raw source image
      const imgUrl =
        i === activePageIndex && enhancedDataUrl
          ? enhancedDataUrl
          : pageItem.enhancedDataUrl || pageItem.straightenedDataUrl || pageItem.sourceDataUrl;

      if (!imgUrl) continue;

      if (addedCount > 0) {
        pdf.addPage(paperSize.toLowerCase(), isLandscape ? "landscape" : "portrait");
      }

      const imgW = pageItem.sourceDimensions?.width || 800;
      const imgH = pageItem.sourceDimensions?.height || 1000;
      const imgRatio = imgW / imgH;

      let drawW = availWidth;
      let drawH = availWidth / imgRatio;

      if (drawH > availHeight) {
        drawH = availHeight;
        drawW = availHeight * imgRatio;
      }

      const x = (pageWidth - drawW) / 2;
      const y = (pageHeight - drawH) / 2;

      pdf.addImage(imgUrl, "JPEG", x, y, drawW, drawH);
      addedCount++;
    }

    if (addedCount === 0) {
      notify(
        language === "bn" ? "PDF তৈরি করার মতো ছবি পাওয়া যায়নি" : "No images available for PDF",
        "error"
      );
      return;
    }

    pdf.save(`${fileName}_All_${addedCount}_Pages.pdf`);
    notify(
      language === "bn"
        ? `সবগুলো (${addedCount}টি) পেজ ১টি PDF ফাইলে সেভ হয়েছে!`
        : `All ${addedCount} pages saved into single PDF!`,
      "success"
    );
  };

  /**
   * Print All Saved Pages in sequence with automatic page breaks
   */
  const handlePrintAllPages = () => {
    if (savedPages.length === 0) return;

    // Sync current active page first
    syncActivePageToState();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const marginStyle =
      paperMargin === "standard" ? "10mm" : paperMargin === "narrow" ? "4mm" : "0mm";

    const pagesHtml = savedPages
      .map((p, idx) => {
        const url =
          idx === activePageIndex && enhancedDataUrl
            ? enhancedDataUrl
            : p.enhancedDataUrl || p.straightenedDataUrl || p.sourceDataUrl;
        if (!url) return "";
        return `
          <div class="print-page">
            <img src="${url}" alt="Page ${idx + 1}" />
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName} - All ${savedPages.length} Pages</title>
        <style>
          @page {
            size: ${paperSize} ${orientation};
            margin: ${marginStyle};
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-page {
            page-break-after: always;
            break-after: page;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }
          .print-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-6 pb-12 font-sans relative"
    >
      {/* Top Header */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {language === "bn"
                  ? "হোয়াটসঅ্যাপ বাঁকা ডকুমেন্ট সোজা ও ক্লিন প্রিন্ট"
                  : "WhatsApp Document Straightener & Print Cleaner"}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NEW
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === "bn"
                ? "হোয়াটসঅ্যাপে আসা বাঁকা ফটো ও PDF ৪-কোণ টেনে সোজা করুন, শ্যাডো মুছে ধবধবে সাদা জেরক্স বানান এবং ১-ক্লিকে A4 প্রিন্ট করুন।"
                : "Straighten tilted mobile photos & PDFs with 4-point perspective crop, remove shadows, clean paper to white and print directly."}
            </p>
          </div>
        </div>

        {/* Action / Stage Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf,image/*,.jpg,.jpeg,.png,.webp,.bmp"
            className="hidden"
          />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {language === "bn" ? "নতুন ছবি / PDF আপলোড" : "Upload Image / PDF"}
            </button>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700 hidden sm:inline-flex items-center gap-1">
              <span>📄 PDF</span>
              <span className="text-slate-600">•</span>
              <span>📷 JPG/PNG</span>
            </span>
          </div>

          {/* Stage Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStage("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === "preview"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "প্রিভিউ ও ডাইরেক্ট প্রিন্ট" : "Preview & Print"}</span>
            </button>

            <button
              onClick={() => setStage("crop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === "crop"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "সোজা ও ক্রপ" : "Straighten"}</span>
            </button>

            <button
              onClick={() => {
                if (!straightenedCanvas) {
                  applyStraighten();
                } else {
                  setStage("enhance");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === "enhance"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "জেরক্স ক্লিন" : "Xerox Clean"}</span>
            </button>
          </div>

          {/* 1-Click Direct Print Button */}
          <button
            onClick={stage === "enhance" ? handleDirectPrint : handleDirectPrintOriginal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title={language === "bn" ? "এডিট ছাড়া আসল রঙে সরাসরি প্রিন্ট করুন" : "Direct print in natural colors"}
          >
            <Printer className="w-4 h-4" />
            <span>
              {stage === "enhance"
                ? language === "bn" ? "ক্লিন কপি প্রিন্ট" : "Print Clean"
                : language === "bn" ? "এডিট ছাড়া ডাইরেক্ট প্রিন্ট" : "Direct Print (Original)"}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Test Demo Bar & Multi-Page PDF Selector */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {language === "bn" ? "টেস্ট ডেমো স্যাম্পল:" : "Test Crooked Samples:"}
          </span>
          <button
            onClick={() => loadSample("aadhaar")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-[11px] cursor-pointer"
          >
            💳 {language === "bn" ? "বাঁকা আধার কার্ড" : "Tilted Aadhaar"}
          </button>
          <button
            onClick={() => loadSample("application")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-[11px] cursor-pointer"
          >
            📝 {language === "bn" ? "মোবাইল তোলা দরখাস্ত" : "Slanted Letter"}
          </button>
          <button
            onClick={() => loadSample("marksheet")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-[11px] cursor-pointer"
          >
            📊 {language === "bn" ? "ছায়াপড়া মার্কশিট" : "Shadowed Marksheet"}
          </button>
        </div>

        {/* Multi-page PDF Navigator */}
        {isPdf && pdfTotalPages > 1 && (
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-300 text-xs">
              PDF পেজ: <strong className="text-sky-400">{pdfPage}</strong> / {pdfTotalPages}
            </span>
            <button
              disabled={pdfPage <= 1}
              onClick={() => switchPdfPage(pdfPage - 1)}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={pdfPage >= pdfTotalPages}
              onClick={() => switchPdfPage(pdfPage + 1)}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* WhatsApp Tip */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {language === "bn"
            ? "টিপস: WhatsApp Web থেকে ছবি কপি করে সরাসরি Ctrl+V চাপুন।"
            : "Tip: Copy image from WhatsApp Web & press Ctrl+V."}
        </div>
      </div>

      {/* ================= AUTO-SAVED PAGES TRAY & GALLERY (বাঁকা সোজা করলে পেজ গুলি অটোমেটিক সেভ হবে) ================= */}
      {savedPages.length > 0 && (
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCheck className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-200">
                    {language === "bn" ? "অটো-সেভ করা পেজ তালিকা" : "Auto-Saved Pages Gallery"}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>
                      {language === "bn"
                        ? `মোট ${savedPages.length}টি পেজ (${savedPages.filter((p) => p.isStraightened).length}টি সোজা করা)`
                        : `${savedPages.length} Pages (${savedPages.filter((p) => p.isStraightened).length} Straightened)`}
                    </span>
                  </span>
                  {lastSavedTime && (
                    <span className="text-[10px] text-emerald-400 font-medium hidden sm:inline-flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      {language === "bn" ? `অটো সেভ হয়েছে: ${lastSavedTime}` : `Auto-saved at: ${lastSavedTime}`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === "bn"
                    ? "✨ বাঁকা সোজা করলেই প্রতিটি পেজ স্বয়ংক্রিয়ভাবে সেভ হয়ে যায়। পেজে ক্লিক করে যেকোনো সময় এডিট বা প্রিন্ট করুন।"
                    : "✨ Pages are automatically saved as soon as you straighten them. Click any page to edit or print."}
                </p>
              </div>
            </div>

            {/* Batch actions & Add Page button */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={addMoreFilesInputRef}
                onChange={handleAddMoreFiles}
                multiple
                accept=".pdf,application/pdf,image/*,.jpg,.jpeg,.png,.webp,.bmp"
                className="hidden"
              />

              <button
                onClick={() => addMoreFilesInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={language === "bn" ? "আরও ছবি বা PDF যোগ করুন" : "Add more pages/images"}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "+ আরও পেজ যোগ করুন" : "Add Page"}</span>
              </button>

              {savedPages.length > 1 && (
                <>
                  <button
                    onClick={handlePrintAllPages}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    title={language === "bn" ? "সব পেজ একসাথে প্রিন্ট করুন" : "Print all pages together"}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "সব পেজ প্রিন্ট" : "Print All"}</span>
                  </button>

                  <button
                    onClick={handleDownloadAllPagesPdf}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    title={language === "bn" ? "সব পেজ ১টি PDF-এ ডাউনলোড করুন" : "Download all as 1 PDF"}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "সব পেজ ১টি PDF" : "All as 1 PDF"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Horizontal Scrollable Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
            {savedPages.map((p, idx) => {
              const isActive = idx === activePageIndex;
              const thumbUrl =
                idx === activePageIndex && enhancedDataUrl
                  ? enhancedDataUrl
                  : p.enhancedDataUrl || p.straightenedDataUrl || p.sourceDataUrl;

              return (
                <div
                  key={p.id}
                  onClick={() => selectSavedPage(idx)}
                  className={`group relative flex-shrink-0 w-32 p-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/40 shadow-md"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="w-full h-24 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={p.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                        <span>লোড হচ্ছে...</span>
                      </div>
                    )}
                  </div>

                  {/* Page Title & Status */}
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold truncate ${isActive ? "text-sky-300" : "text-slate-200"}`}>
                        {language === "bn" ? `পেজ ${p.pageNumber}` : `Page ${p.pageNumber}`}
                      </span>
                      {p.isStraightened ? (
                        <span
                          title={language === "bn" ? "সোজা করা হয়েছে এবং সেভ আছে" : "Straightened & Saved"}
                          className="flex items-center text-[10px] text-emerald-400 font-semibold gap-0.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">মূল</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          p.isStraightened
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {p.isStraightened
                          ? language === "bn" ? "সোজা ও সেভ" : "Saved"
                          : language === "bn" ? "অরিজিনাল" : "Original"}
                      </span>

                      {savedPages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedPage(idx);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded transition-opacity cursor-pointer"
                          title={language === "bn" ? "পেজ মুছুন" : "Delete Page"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Page Card */}
            <button
              onClick={() => addMoreFilesInputRef.current?.click()}
              className="flex-shrink-0 w-28 h-[134px] rounded-xl border border-dashed border-slate-700 hover:border-sky-500 bg-slate-950/40 hover:bg-slate-900/80 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-sky-300 transition-all cursor-pointer p-2"
            >
              <Plus className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-semibold text-center leading-tight">
                {language === "bn" ? "+ আরও পেজ যোগ করুন" : "+ Add Page"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Auto-Save Toast Notification Banner */}
      {isAutoSavedNoticeVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">
            {language === "bn"
              ? `পেজ ${activePageIndex + 1} সফলভাবে সোজা ও অটোমেটিক সেভ হয়েছে!`
              : `Page ${activePageIndex + 1} straightened and auto-saved!`}
          </span>
        </div>
      )}

      {/* Main Multi-Stage Work Area */}
      {stage === "preview" ? (
        /* ================= STAGE 0: ORIGINAL PREVIEW & DIRECT UNEDITED PRINT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Preview Canvas & Sheet Frame (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">
                  {language === "bn"
                    ? "অরিজিনাল ডকুমেন্ট প্রিভিউ (কোনো ফিল্টার ছাড়া আসল রূপ)"
                    : "Original Document Preview (Unedited Natural Color)"}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {sourceDimensions.width} × {sourceDimensions.height} px
              </span>
            </div>

            {/* Virtual Paper Box Container */}
            <div className="relative w-full flex items-center justify-center p-4 min-h-[460px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-auto">
              {loadingFile ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs py-16">
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                  <span>
                    {isPdf
                      ? language === "bn" ? "PDF পেজ প্রস্তুত হচ্ছে..." : "Preparing PDF page..."
                      : language === "bn" ? "ছবি লোড হচ্ছে..." : "Loading image..."}
                  </span>
                </div>
              ) : (
                <div
                  className={`bg-white shadow-2xl transition-all flex items-center justify-center overflow-hidden ${
                    orientation === "portrait"
                      ? "w-[340px] sm:w-[380px] h-[480px] sm:h-[530px]"
                      : "w-[460px] sm:w-[520px] h-[340px] sm:h-[380px]"
                  } ${
                    paperMargin === "standard"
                      ? "p-4"
                      : paperMargin === "narrow"
                      ? "p-2"
                      : "p-0"
                  }`}
                >
                  {sourceDataUrl ? (
                    <img
                      src={sourceDataUrl}
                      alt="Original Document Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                </div>
              )}
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-3">
              <span>
                {language === "bn" ? "কাগজের সাইজ:" : "Paper:"} {paperSize} ({orientation})
              </span>
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {language === "bn" ? "প্রাকৃতিক আসল কালার রেডি" : "Natural Color Ready"}
              </span>
            </div>
          </div>

          {/* Right: Direct Print Actions & Options (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct 1-Click Print Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                {language === "bn" ? "এডিট ছাড়া ডাইরেক্ট প্রিন্ট" : "Direct Print (No Edit)"}
              </h3>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <p className="text-xs font-bold text-emerald-300">
                  {language === "bn"
                    ? "✨ কোনো ক্রপ বা এডিটের প্রয়োজন নেই!"
                    : "✨ Instant Print in Natural Colors!"}
                </p>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {language === "bn"
                    ? "আপনার ডকুমেন্টটি যেভাবে আছে ঠিক সেভাবেই কোনো কালার চেঞ্জ বা কোণ পরিবর্তন ছাড়া সরাসরি আসল রঙে A4 পেজে প্রিন্ট হবে।"
                    : "Prints the original document onto paper in full natural colors exactly as uploaded."}
                </p>
              </div>

              {/* Paper Size & Layout */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    {language === "bn" ? "কাগজের সাইজ" : "Paper Size"}
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as "A4" | "Legal" | "Letter")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    {language === "bn" ? "দিকবিন্যাস" : "Orientation"}
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-700">
                    <button
                      onClick={() => setOrientation("portrait")}
                      className={`flex-1 py-1.5 text-xs font-semibold cursor-pointer ${
                        orientation === "portrait" ? "bg-sky-600 text-white" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      লম্বা
                    </button>
                    <button
                      onClick={() => setOrientation("landscape")}
                      className={`flex-1 py-1.5 text-xs font-semibold cursor-pointer ${
                        orientation === "landscape" ? "bg-sky-600 text-white" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      আড়াআড়ি
                    </button>
                  </div>
                </div>
              </div>

              {/* Paper Margins */}
              <div>
                <label className="text-slate-400 block mb-1 text-xs font-medium">
                  {language === "bn" ? "মার্জিন" : "Paper Margin"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["standard", "narrow", "none"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaperMargin(m)}
                      className={`py-1.5 rounded-lg text-xs font-medium border capitalize cursor-pointer ${
                        paperMargin === m
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {m === "standard"
                        ? language === "bn" ? "স্বাভাবিক (১০মিমি)" : "Normal"
                        : m === "narrow"
                        ? language === "bn" ? "ছোট (৪মিমি)" : "Narrow"
                        : language === "bn" ? "ফুল পেজ (০মিমি)" : "Full Page"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleDirectPrintOriginal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {language === "bn" ? "এডিট ছাড়া ডাইরেক্ট প্রিন্ট করুন" : "Direct Print Original (1-Click)"}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadOriginalPdf}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === "bn" ? "অরিজিনাল PDF" : "Original PDF"}</span>
                  </button>

                  <button
                    onClick={handleDownloadOriginalImage}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileImage className="w-3.5 h-3.5 text-purple-400" />
                    <span>{language === "bn" ? "অরিজিনাল ছবি" : "Original Image"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transition to Edit/Straighten Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                {language === "bn" ? "ডকুমেন্ট বাঁকা বা কালচে থাকলে এডিট করুন:" : "Need to Fix or Clean?"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {language === "bn"
                  ? "মোবাইলে তোলা বাঁকা ফটো হলে ৪-কোণ টেনে সোজা করুন অথবা অন্ধকার ও ছায়া মুছে ধবধবে সাদা জেরক্স বানান।"
                  : "If the photo is crooked or has dark shadows, straighten corners or apply B&W Xerox clean."}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStage("crop")}
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "কোণ সোজা ও ক্রপ করুন" : "Straighten & Crop"}</span>
                </button>
                <button
                  onClick={applyStraighten}
                  className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "জেরক্স ক্লিন করুন" : "Xerox Clean"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : stage === "crop" ? (
        /* ================= STAGE 1: 4-CORNER PERSPECTIVE CROP & ROTATION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Visual Canvas Area (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm overflow-hidden">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">
                  {language === "bn"
                    ? "ধাপ ১: ৪টি কোণ ড্র্যাগ করে ডকুমেন্টের সীমানা নির্ধারণ করুন"
                    : "Step 1: Drag 4 corners over the document border"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStage("preview")}
                  className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title={language === "bn" ? "অরিজিনাল প্রিভিউ দেখুন" : "View Original Preview"}
                >
                  <Eye className="w-3 h-3 text-sky-400" />
                  {language === "bn" ? "প্রিভিউ" : "Preview"}
                </button>

                <button
                  onClick={handleDirectPrintOriginal}
                  className="px-2.5 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                  title={language === "bn" ? "এডিট ছাড়া আসল রঙে সরাসরি প্রিন্ট" : "Direct print without edit"}
                >
                  <Printer className="w-3 h-3" />
                  {language === "bn" ? "এডিট ছাড়া প্রিন্ট" : "Direct Print"}
                </button>

                <button
                  onClick={() => {
                    setShowGrid(!showGrid);
                    if (imageObjRef.current) {
                      renderCropEditor(imageObjRef.current, corners, fineRotation, !showGrid);
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
                    showGrid
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  {language === "bn" ? "গ্রিড লাইন" : "Grid"}
                </button>

                <button
                  onClick={handleResetCorners}
                  className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {language === "bn" ? "রিসেট কোণ" : "Reset Corners"}
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative w-full flex items-center justify-center p-2 min-h-[420px] max-h-[580px] bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-auto">
              {isDraggingOver && (
                <div className="absolute inset-0 z-30 bg-sky-950/90 border-2 border-dashed border-sky-400 rounded-xl flex flex-col items-center justify-center gap-2 p-4 text-center pointer-events-none">
                  <Upload className="w-10 h-10 text-sky-400 animate-bounce" />
                  <span className="font-bold text-sm text-sky-200">
                    {language === "bn" ? "এখানে ছবি বা PDF ফাইল ড্রপ করুন" : "Drop Image or PDF file here"}
                  </span>
                  <span className="text-[11px] text-sky-300/80 font-mono">
                    {language === "bn" ? "সমর্থিত ফরম্যাট: PDF, JPG, PNG, WebP" : "Supported: PDF, JPG, PNG, WebP"}
                  </span>
                </div>
              )}

              {loadingFile ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs py-16">
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                  <span className="font-medium text-slate-300">
                    {isPdf
                      ? language === "bn"
                        ? "PDF পেজ লোড ও রেন্ডার করা হচ্ছে..."
                        : "Rendering PDF page..."
                      : language === "bn"
                      ? "ছবি লোড হচ্ছে..."
                      : "Loading image file..."}
                  </span>
                </div>
              ) : (
                <canvas
                  ref={cropCanvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className="max-w-full max-h-[540px] object-contain rounded cursor-crosshair shadow-lg touch-none"
                />
              )}
            </div>

            {/* Bottom Tip */}
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              💡 {language === "bn"
                ? "ডকুমেন্টের চার কোণে নীল হ্যান্ডেল ৪টি বসান। বাঁকা থাকলে নিচের স্লাইডার দিয়ে সূক্ষ্ম কোণ ঘুরিয়ে নিতে পারেন।"
                : "Place the 4 blue handles exactly at the document corners. Adjust fine angle if text is skewed."}
            </p>
          </div>

          {/* Right Toolbar & Straighten Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Straighten & Auto-Deskew Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                {language === "bn" ? "অটো সোজা ও রোটেশন টুলস" : "Straighten & Rotate Tools"}
              </h3>

              {/* 1-Click Auto Deskew */}
              <button
                onClick={handleAutoDeskew}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {language === "bn" ? "১-ক্লিকে অটো সোজা (Auto Deskew)" : "1-Click Auto Straighten"}
              </button>

              {/* 90-Degree Quick Rotations */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                  {language === "bn" ? "৯০° ঘুরিয়ে সোজা করুন" : "90° Quick Rotation"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handle90Rotate("ccw")}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                    {language === "bn" ? "বামে ৯০°" : "Left 90°"}
                  </button>
                  <button
                    onClick={() => handle90Rotate("cw")}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                    {language === "bn" ? "ডানে ৯০°" : "Right 90°"}
                  </button>
                </div>
              </div>

              {/* Fine Angle Slider (-45 to +45 deg) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    {language === "bn" ? "সূক্ষ্ম কোণ সমন্বয় (Fine Angle)" : "Fine Angle Alignment"}
                  </span>
                  <span className="font-mono font-bold text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/60">
                    {fineRotation > 0 ? `+${fineRotation.toFixed(1)}°` : `${fineRotation.toFixed(1)}°`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={fineRotation}
                  onChange={(e) => handleFineRotateChange(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-45°</span>
                  <button
                    onClick={() => handleFineRotateChange(0)}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    0° (লেভেল)
                  </button>
                  <span>+45°</span>
                </div>
              </div>

              {/* Ready to Apply Straighten Button */}
              <button
                onClick={applyStraighten}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Check className="w-4 h-4" />
                {language === "bn" ? "সোজা করুন ও প্রিন্ট ক্লিনে যান" : "Straighten & Continue to Print Clean"}
              </button>

              <div className="pt-2 border-t border-slate-800 mt-2">
                <button
                  onClick={handleDirectPrintOriginal}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {language === "bn"
                    ? "এডিট ছাড়া আসল রঙে ডাইরেক্ট প্রিন্ট"
                    : "Direct Print Original Color (No Edit)"}
                </button>
              </div>
            </div>

            {/* Helpful Guide Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                {language === "bn" ? "ব্যবহারের নির্দেশিকা" : "How to Deskew Perfectly"}
              </h4>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed text-[11px]">
                <li>{language === "bn" ? "ডকুমেন্টের চার কোণে ৪টি নীল বৃত্ত ড্র্যাগ করে বসিয়ে দিন।" : "Drag 4 blue corner pins to the edges of the document."}</li>
                <li>{language === "bn" ? "টেক্সট বাঁকা থাকলে 'অটো সোজা' বাটনে ক্লিক করুন।" : "Click '1-Click Auto Straighten' if text is tilted."}</li>
                <li>{language === "bn" ? "পরবর্তী ধাপে শ্যাডো ও টেবিলের কালচে ভাব মুছে ধবধবে সাদা হবে।" : "Next step will clean table/bed shadows and whiten paper."}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STAGE 2: PRINT ENHANCEMENT & DIRECT A4 PRINT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Preview Canvas & Sheet Frame (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  {language === "bn"
                    ? "ধাপ ২: ক্লিন প্রিন্ট প্রিভিউ (সাদা ব্যাকগ্রাউন্ড ও স্পষ্ট টেক্সট)"
                    : "Step 2: Cleaned Print Preview (White Background & Sharp Text)"}
                </span>
              </div>

              {/* Compare toggle */}
              <button
                onMouseDown={() => setShowOriginalComparison(true)}
                onMouseUp={() => setShowOriginalComparison(false)}
                onTouchStart={() => setShowOriginalComparison(true)}
                onTouchEnd={() => setShowOriginalComparison(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 cursor-pointer select-none"
              >
                <Eye className="w-3 h-3 text-amber-400" />
                {language === "bn" ? "চেপে ধরে আগেরটা দেখুন" : "Hold to View Original"}
              </button>
            </div>

            {/* A4 Sheet Virtual Paper Preview Container */}
            <div className="relative w-full flex items-center justify-center p-4 min-h-[460px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-auto">
              {/* Virtual Paper Box */}
              <div
                ref={printAreaRef}
                className={`bg-white shadow-2xl transition-all flex items-center justify-center overflow-hidden ${
                  orientation === "portrait"
                    ? "w-[340px] sm:w-[380px] h-[480px] sm:h-[530px]"
                    : "w-[460px] sm:w-[520px] h-[340px] sm:h-[380px]"
                } ${
                  paperMargin === "standard"
                    ? "p-4"
                    : paperMargin === "narrow"
                    ? "p-2"
                    : "p-0"
                }`}
              >
                {showOriginalComparison && sourceDataUrl ? (
                  <img
                    src={sourceDataUrl}
                    alt="Original Crooked"
                    className="max-w-full max-h-full object-contain filter brightness-90"
                  />
                ) : enhancedDataUrl ? (
                  <img
                    src={enhancedDataUrl}
                    alt="Cleaned Document"
                    className="max-w-full max-h-full object-contain shadow-sm"
                  />
                ) : null}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-3">
              <span>
                {language === "bn" ? "সাইজ:" : "Size:"} {paperSize} ({orientation})
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {language === "bn" ? "৩০০ DPI প্রিন্ট কোয়ালিটি রেডি" : "300 DPI Print Quality Ready"}
              </span>
            </div>
          </div>

          {/* Right Enhancement Controls & 1-Click Print (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Enhancement Filter Modes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                {language === "bn" ? "ক্লিন ও জেরক্স প্রিন্ট মোড" : "Print Enhancement Modes"}
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. B&W Xerox Clean */}
                <button
                  onClick={() => updateEnhancement({ mode: "bw_xerox", backgroundWhiteness: 55, contrast: 40 })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    settings.mode === "bw_xerox"
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>📄 {language === "bn" ? "ক্লিন সাদা-কালো জেরক্স" : "B&W Xerox Clean"}</span>
                    {settings.mode === "bw_xerox" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {language === "bn" ? "ধবধবে সাদা কাগজ, শ্যাডো দূরীকরণ ও কালো লেখা" : "Pure white paper, shadow removal, black text"}
                  </p>
                </button>

                {/* 2. Magic Color Document */}
                <button
                  onClick={() => updateEnhancement({ mode: "magic_color", backgroundWhiteness: 50, contrast: 30 })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    settings.mode === "magic_color"
                      ? "bg-blue-500/15 border-blue-500 text-white shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🌈 {language === "bn" ? "কালার ডকুমেন্ট" : "Magic Color"}</span>
                    {settings.mode === "magic_color" && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {language === "bn" ? "কাগজ সাদা হবে কিন্তু সিল, স্ট্যাম্প ও সই রঙিন থাকবে" : "Whitens paper while preserving colored stamps"}
                  </p>
                </button>

                {/* 3. Photo & ID Card */}
                <button
                  onClick={() => updateEnhancement({ mode: "photo_id", backgroundWhiteness: 35, contrast: 25 })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    settings.mode === "photo_id"
                      ? "bg-purple-500/15 border-purple-500 text-white shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🪪 {language === "bn" ? "আধার/ভোটার আইডি" : "Aadhaar / ID Card"}</span>
                    {settings.mode === "photo_id" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {language === "bn" ? "ছবি ও অক্ষরের ব্যালেন্স কালার প্রিন্ট" : "Balanced photo colors & card contrast"}
                  </p>
                </button>

                {/* 4. Smooth Grayscale */}
                <button
                  onClick={() => updateEnhancement({ mode: "grayscale", backgroundWhiteness: 45, contrast: 30 })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    settings.mode === "grayscale"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🌫️ {language === "bn" ? "মসৃণ গ্রে-স্কেল" : "Smooth Grayscale"}</span>
                    {settings.mode === "grayscale" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {language === "bn" ? "লেজার প্রিন্টারের মসৃণ আউটপুট" : "Smooth laser print gradations"}
                  </p>
                </button>

                {/* 5. Original Natural Color (100% Original without filters) */}
                <button
                  onClick={() =>
                    updateEnhancement({
                      mode: "original",
                      backgroundWhiteness: 0,
                      contrast: 0,
                      brightness: 0,
                      sharpness: 0,
                    })
                  }
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer col-span-2 ${
                    settings.mode === "original"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>
                        {language === "bn"
                          ? "অরিজিনাল কালার (প্রাকৃতিক আসল রূপ - কোনো ফিল্টার ছাড়া)"
                          : "Original Natural Color (No Filters)"}
                      </span>
                    </span>
                    {settings.mode === "original" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {language === "bn"
                      ? "ডকুমেন্টের আসল কালার ও ব্যাকগ্রাউন্ড কোনো পরিবর্তন ছাড়াই অবিকল থাকবে"
                      : "Preserves 100% authentic original colors and paper background without filters"}
                  </p>
                </button>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                {/* Background Clean Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      {language === "bn" ? "কাগজ সাদা ও শ্যাডো দূরীকরণ:" : "Paper Whiteness / Shadow Clean:"}
                    </span>
                    <span className="text-slate-200 font-mono">{settings.backgroundWhiteness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.backgroundWhiteness}
                    onChange={(e) => updateEnhancement({ backgroundWhiteness: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Text Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      {language === "bn" ? "টেক্সট কন্ট্রাস্ট (লেখা স্পষ্ট):" : "Text Contrast:"}
                    </span>
                    <span className="text-slate-200 font-mono">{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={settings.contrast}
                    onChange={(e) => updateEnhancement({ contrast: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Text Sharpening */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      {language === "bn" ? "টেক্সট শার্পনেস (ধারালো লেখা):" : "Text Sharpening:"}
                    </span>
                    <span className="text-slate-200 font-mono">{settings.sharpness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={settings.sharpness}
                    onChange={(e) => updateEnhancement({ sharpness: parseInt(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Print & Paper Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                {language === "bn" ? "প্রিন্টার ও পেপার সাইজ" : "Printer & Paper Setup"}
              </h3>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {language === "bn" ? "পেপার সাইজ" : "Paper Size"}
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-200 rounded-lg p-1.5 border border-slate-700 text-xs"
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="Legal">Legal (Court/Deed)</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {language === "bn" ? "ওরিয়েন্টেশন" : "Orientation"}
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-200 rounded-lg p-1.5 border border-slate-700 text-xs"
                  >
                    <option value="portrait">{language === "bn" ? "খাড়া (Portrait)" : "Portrait"}</option>
                    <option value="landscape">{language === "bn" ? "শোয়ানো (Landscape)" : "Landscape"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {language === "bn" ? "মার্জিন" : "Margin"}
                  </label>
                  <select
                    value={paperMargin}
                    onChange={(e) => setPaperMargin(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-200 rounded-lg p-1.5 border border-slate-700 text-xs"
                  >
                    <option value="standard">{language === "bn" ? "সাধারণ (10mm)" : "Standard (10mm)"}</option>
                    <option value="narrow">{language === "bn" ? "সংকীর্ণ (4mm)" : "Narrow (4mm)"}</option>
                    <option value="none">{language === "bn" ? "জিরো মার্জিন" : "Zero Margin"}</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* 1-Click Print */}
                <button
                  onClick={handleDirectPrint}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {language === "bn" ? "১-ক্লিকে সরাসরি প্রিন্ট করুন (Print A4)" : "1-Click Direct Print (A4)"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <FileCode2 className="w-4 h-4" />
                    {language === "bn" ? "HD PDF ডাউনলোড" : "Download PDF"}
                  </button>
                  <button
                    onClick={handleDownloadJpeg}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {language === "bn" ? "ক্লিন ছবি সেভ" : "Save Clean JPEG"}
                  </button>
                </div>

                {/* Send to Print Layout Studio */}
                <button
                  onClick={() => {
                    if (enhancedDataUrl) {
                      localStorage.setItem("dsp_shared_clean_img", enhancedDataUrl);
                      setActiveSection("photo-print-layout");
                      notify(
                        language === "bn"
                          ? "ফটো প্রিন্ট লেআউটে পাঠানো হয়েছে!"
                          : "Transferred to Photo Print Layout!",
                        "success"
                      );
                    }
                  }}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-900/50 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5" />
                  {language === "bn" ? "A4 মাল্টি-কপি প্রিন্ট লেআউট এ সাজান" : "Arrange on Multi-Copy Print Sheet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
