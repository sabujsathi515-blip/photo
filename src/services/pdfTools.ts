import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

/**
 * Merge multiple PDF files into one single PDF
 */
export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

/**
 * Split PDF - extracts specific page indices (0-based) into a new PDF
 */
export async function extractPdfPages(pdfBuffer: ArrayBuffer, pageIndices: number[]): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
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
  pdfBuffer: ArrayBuffer,
  angle: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
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
  pdfBuffer: ArrayBuffer,
  watermarkText: string,
  opacity = 0.25,
  fontSize = 42
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
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
export async function addPageNumbersToPdf(pdfBuffer: ArrayBuffer, position: "bottom-center" | "bottom-right" = "bottom-center"): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
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
