import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error - Vite ?url asset import
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

// Setup worker using bundled Vite URL, same-origin public URL, or unpkg fallback
if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      pdfWorkerUrl || (window.location.origin + "/pdf.worker.min.js");
  } catch (e) {
    console.warn("Could not set pdf workerSrc directly:", e);
  }
}

export interface RenderedPdfPage {
  pageNumber: number;
  totalPages: number;
  dataUrl: string;
  width: number;
  height: number;
}

export type PdfInputSource = ArrayBuffer | Uint8Array | Blob | File;

/**
 * Safely converts any PDF input source (Blob, File, ArrayBuffer, Uint8Array)
 * into an independent, non-detached Uint8Array copy.
 * This guarantees that when pdfjs transfers the underlying ArrayBuffer to its worker,
 * the caller's original reference is NEVER detached or corrupted.
 */
async function toSafeFreshUint8Array(source: PdfInputSource): Promise<Uint8Array> {
  if (source instanceof Blob) {
    // Calling .arrayBuffer() on a Blob or File always creates a brand-new independent ArrayBuffer
    const ab = await source.arrayBuffer();
    return new Uint8Array(ab);
  }

  if (source instanceof Uint8Array) {
    // .slice() creates a brand new copy of the Uint8Array with its own ArrayBuffer
    return source.slice();
  }

  if (source instanceof ArrayBuffer) {
    // Check if buffer is already detached
    let isDetached = false;
    if ("detached" in source && (source as { detached?: boolean }).detached) {
      isDetached = true;
    } else if (source.byteLength === 0) {
      try {
        new Uint8Array(source);
      } catch {
        isDetached = true;
      }
    }

    if (isDetached) {
      throw new Error(
        "Cannot render PDF: The provided ArrayBuffer is already detached. Please pass a Blob, File, or fresh Uint8Array."
      );
    }

    // Cloning the ArrayBuffer with .slice(0) prevents the caller's buffer from being detached by the worker
    return new Uint8Array(source.slice(0));
  }

  throw new Error("Invalid PDF input source: Expected Blob, File, Uint8Array, or ArrayBuffer");
}

/**
 * Loads a PDF buffer and renders a specific page to canvas DataURL at high print quality (2.5x scale)
 */
export async function renderPdfPage(
  pdfSource: PdfInputSource,
  pageNumber: number = 1,
  scale: number = 2.0
): Promise<RenderedPdfPage> {
  const safeData = await toSafeFreshUint8Array(pdfSource);

  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const validPageNum = Math.min(Math.max(1, pageNumber), totalPages);

  const page = await pdf.getPage(validPageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context for PDF render");

  // Pure white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL("image/png");

  // Clean up to prevent worker memory leaks
  try {
    page.cleanup();
    await loadingTask.destroy();
  } catch {
    // Ignore cleanup error
  }

  return {
    pageNumber: validPageNum,
    totalPages,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Gets total page count of a PDF file
 */
export async function getPdfPageCount(pdfSource: PdfInputSource): Promise<number> {
  const safeData = await toSafeFreshUint8Array(pdfSource);

  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
  });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  try {
    await loadingTask.destroy();
  } catch {
    // Ignore cleanup error
  }
  return numPages;
}

