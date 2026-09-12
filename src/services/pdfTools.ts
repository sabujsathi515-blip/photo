import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export type PdfSource = ArrayBuffer | Uint8Array | Blob;

/**
 * Safely converts any PDF input source to Uint8Array while preventing detached ArrayBuffer issues
 */
async function toSafePdfBytes(source: PdfSource): Promise<Uint8Array> {
  if (source instanceof Blob) {
    const ab = await source.arrayBuffer();
    return new Uint8Array(ab);
  }
  if (source instanceof Uint8Array) {
    return source.slice();
  }
  if (source instanceof ArrayBuffer) {
    if (source.byteLength === 0) {
      throw new Error("Cannot process PDF: ArrayBuffer is empty or detached.");
    }
    return new Uint8Array(source.slice(0));
  }
  throw new Error("Invalid PDF source");
}

/**
 * Merge multiple PDF files into one single PDF
 */
export async function mergePdfs(pdfBuffers: PdfSource[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const bytes = await toSafePdfBytes(buffer);
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

/**
 * Split PDF - extracts specific page indices (0-based) into a new PDF
 */
export async function extractPdfPages(pdfBuffer: PdfSource, pageIndices: number[]): Promise<Uint8Array> {
  const bytes = await toSafePdfBytes(pdfBuffer);
  const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const validIndices = pageIndices.filter((idx) => idx >= 0 && idx < sourcePdf.getPageCount());
  const copiedPages = await newPdf.copyPages(sourcePdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

/**
 * Rotate all or selected pages in PDF by angle (90, 180, 270)
 */
export async function rotatePdfPages(
  pdfBuffer: PdfSource,
  angle: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const bytes = await toSafePdfBytes(pdfBuffer);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const targetIndices = pageIndices || Array.from({ length: totalPages }, (_, i) => i);

  for (const idx of targetIndices) {
    if (idx >= 0 && idx < totalPages) {
      const page = pdfDoc.getPage(idx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angle) % 360));
    }
  }

  return pdfDoc.save();
}

/**
 * Add Watermark Text to all pages in a PDF
 */
export async function addWatermarkToPdf(
  pdfBuffer: PdfSource,
  watermarkText: string,
  opacity = 0.25,
  fontSize = 42
): Promise<Uint8Array> {
  const bytes = await toSafePdfBytes(pdfBuffer);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = helveticaFont.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
      opacity: opacity,
      rotate: degrees(45),
    });
  }

  return pdfDoc.save();
}

/**
 * Add Page Numbers (e.g. "Page 1 of 5") to all pages
 */
export async function addPageNumbersToPdf(pdfBuffer: PdfSource, position: "bottom-center" | "bottom-right" = "bottom-center"): Promise<Uint8Array> {
  const bytes = await toSafePdfBytes(pdfBuffer);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const pageText = `Page ${i + 1} of ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(pageText, 10);

    const x = position === "bottom-center" ? width / 2 - textWidth / 2 : width - textWidth - 30;

    page.drawText(pageText, {
      x,
      y: 20,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return pdfDoc.save();
}

/**
 * Converts multiple Images (Data URLs) to a single PDF document
 */
export async function imagesToPdf(imageDataUrls: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const dataUrl of imageDataUrls) {
    let image;
    if (dataUrl.startsWith("data:image/png")) {
      const bytes = dataUrlToUint8Array(dataUrl);
      image = await pdfDoc.embedPng(bytes);
    } else {
      const bytes = dataUrlToUint8Array(dataUrl);
      image = await pdfDoc.embedJpg(bytes);
    }

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (72 DPI)
    const { width, height } = page.getSize();

    // Scale image proportionally to fit inside A4 margins
    const margin = 20;
    const availWidth = width - margin * 2;
    const availHeight = height - margin * 2;

    const imgRatio = image.width / image.height;
    let drawWidth = availWidth;
    let drawHeight = availWidth / imgRatio;

    if (drawHeight > availHeight) {
      drawHeight = availHeight;
      drawWidth = availHeight * imgRatio;
    }

    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return pdfDoc.save();
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Trigger browser file download from Uint8Array
 */
export function downloadUint8Array(data: Uint8Array, filename: string, mimeType = "application/pdf") {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
