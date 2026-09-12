/**
 * Advanced Document Deskew, Perspective Correction & Print Enhancement Service
 * Specifically crafted for Cyber Cafes processing crooked, dark, or distorted
 * WhatsApp photos & PDFs of Aadhaar cards, marksheets, receipts, and letters.
 */

export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export type EnhancementMode = "bw_xerox" | "magic_color" | "photo_id" | "grayscale" | "original";

export interface EnhancementSettings {
  mode: EnhancementMode;
  brightness: number; // -50 to 50 (default 0)
  contrast: number; // 0 to 100 (default 25)
  backgroundWhiteness: number; // 0 to 100 (default 50)
  sharpness: number; // 0 to 100 (default 30)
  rotation: number; // -45 to 45 (fine angle)
  straightenAngle: number; // accumulated rotation
}

export const defaultEnhancementSettings: EnhancementSettings = {
  mode: "bw_xerox",
  brightness: 5,
  contrast: 35,
  backgroundWhiteness: 55,
  sharpness: 30,
  rotation: 0,
  straightenAngle: 0,
};

/**
 * Computes 3x3 perspective transformation matrix from source quad to destination rectangle
 */
export function getPerspectiveTransform(src: QuadCorners, dstWidth: number, dstHeight: number): number[] {
  const dst: QuadCorners = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: dstWidth, y: 0 },
    bottomRight: { x: dstWidth, y: dstHeight },
    bottomLeft: { x: 0, y: dstHeight },
  };

  // Solve for 8 coefficients of homography matrix H: [h00, h01, h02, h10, h11, h12, h20, h21, 1]
  // Mapping destination coordinates back to source coordinates (Inverse Homography for backward sampling)
  return solveHomography(dst, src);
}

/**
 * Solves homography mapping from quad1 to quad2
 */
function solveHomography(from: QuadCorners, to: QuadCorners): number[] {
  const p1 = [from.topLeft, from.topRight, from.bottomRight, from.bottomLeft];
  const p2 = [to.topLeft, to.topRight, to.bottomRight, to.bottomLeft];

  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const { x, y } = p1[i];
    const { x: u, y: v } = p2[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }

  const h = solve8x8(A, b);
  return [...h, 1];
}

/**
 * Gaussian elimination solver for 8x8 system
 */
function solve8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-10) continue;

    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Applies perspective transform to an image or canvas, returning a warped high-resolution canvas
 */
export function warpPerspective(
  sourceCanvas: HTMLCanvasElement,
  corners: QuadCorners,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  // Determine realistic width and height based on quad edge lengths
  const topW = Math.hypot(corners.topRight.x - corners.topLeft.x, corners.topRight.y - corners.topLeft.y);
  const bottomW = Math.hypot(corners.bottomRight.x - corners.bottomLeft.x, corners.bottomRight.y - corners.bottomLeft.y);
  const leftH = Math.hypot(corners.bottomLeft.x - corners.topLeft.x, corners.bottomLeft.y - corners.topLeft.y);
  const rightH = Math.hypot(corners.bottomRight.x - corners.topRight.x, corners.bottomRight.y - corners.topRight.y);

  const avgW = Math.round(Math.max(topW, bottomW));
  const avgH = Math.round(Math.max(leftH, rightH));

  const outW = targetWidth || Math.max(100, avgW);
  const outH = targetHeight || Math.max(100, avgH);

  const H = getPerspectiveTransform(corners, outW, outH);

  const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!srcCtx) throw new Error("Could not get source 2d context");

  const srcImgData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const srcData = srcImgData.data;
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Could not get output 2d context");

  const outImgData = outCtx.createImageData(outW, outH);
  const outData = outImgData.data;

  // Bilinear backward mapping
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = H;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const z = h6 * x + h7 * y + h8;
      const invZ = z !== 0 ? 1 / z : 1;
      const srcX = (h0 * x + h1 * y + h2) * invZ;
      const srcY = (h3 * x + h4 * y + h5) * invZ;

      const outIdx = (y * outW + x) * 4;

      if (srcX >= 0 && srcX < srcW - 1 && srcY >= 0 && srcY < srcH - 1) {
        // Bilinear interpolation
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const wx = srcX - x0;
        const wy = srcY - y0;
        const w00 = (1 - wx) * (1 - wy);
        const w10 = wx * (1 - wy);
        const w01 = (1 - wx) * wy;
        const w11 = wx * wy;

        const idx00 = (y0 * srcW + x0) * 4;
        const idx10 = (y0 * srcW + x1) * 4;
        const idx01 = (y1 * srcW + x0) * 4;
        const idx11 = (y1 * srcW + x1) * 4;

        outData[outIdx] = Math.round(
          srcData[idx00] * w00 + srcData[idx10] * w10 + srcData[idx01] * w01 + srcData[idx11] * w11
        );
        outData[outIdx + 1] = Math.round(
          srcData[idx00 + 1] * w00 + srcData[idx10 + 1] * w10 + srcData[idx01 + 1] * w01 + srcData[idx11 + 1] * w11
        );
        outData[outIdx + 2] = Math.round(
          srcData[idx00 + 2] * w00 + srcData[idx10 + 2] * w10 + srcData[idx01 + 2] * w01 + srcData[idx11 + 2] * w11
        );
        outData[outIdx + 3] = 255;
      } else {
        // Outside bounds: pure clean white
        outData[outIdx] = 255;
        outData[outIdx + 1] = 255;
        outData[outIdx + 2] = 255;
        outData[outIdx + 3] = 255;
      }
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outCanvas;
}

/**
 * Rotates a canvas by any angle in degrees
 */
export function rotateCanvas(sourceCanvas: HTMLCanvasElement, angleDegrees: number): HTMLCanvasElement {
  if (angleDegrees % 360 === 0) return sourceCanvas;

  const rad = (angleDegrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const newW = Math.round(sourceCanvas.width * cos + sourceCanvas.height * sin);
  const newH = Math.round(sourceCanvas.width * sin + sourceCanvas.height * cos);

  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  // Pure white canvas background for clean document printing
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, newW, newH);

  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);

  return canvas;
}

/**
 * Fast Auto-Deskew Angle Estimator
 * Detects tilt of text lines between -20° and +20° by testing projection profile variance
 */
export function detectDeskewAngle(canvas: HTMLCanvasElement): number {
  try {
    // Create smaller thumbnail for fast analysis
    const thumbW = 300;
    const thumbH = Math.round((canvas.height / canvas.width) * thumbW);
    const thumb = document.createElement("canvas");
    thumb.width = thumbW;
    thumb.height = thumbH;
    const tCtx = thumb.getContext("2d");
    if (!tCtx) return 0;

    tCtx.drawImage(canvas, 0, 0, thumbW, thumbH);
    const imgData = tCtx.getImageData(0, 0, thumbW, thumbH);
    const data = imgData.data;

    // Convert to grayscale edge map
    const gray = new Float32Array(thumbW * thumbH);
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Horizontal edge differences
    const edges = new Float32Array(thumbW * thumbH);
    for (let y = 1; y < thumbH - 1; y++) {
      for (let x = 0; x < thumbW; x++) {
        const top = gray[(y - 1) * thumbW + x];
        const bot = gray[(y + 1) * thumbW + x];
        edges[y * thumbW + x] = Math.abs(bot - top);
      }
    }

    let bestAngle = 0;
    let maxVariance = -1;

    // Search angles from -15 to +15 in 0.5 degree steps
    for (let a = -15; a <= 15; a += 0.5) {
      const rad = (a * Math.PI) / 180;
      const tan = Math.tan(rad);
      const bins = new Float32Array(thumbH);
      const counts = new Uint16Array(thumbH);

      for (let y = 0; y < thumbH; y++) {
        for (let x = 0; x < thumbW; x++) {
          const shiftedY = Math.round(y + (x - thumbW / 2) * tan);
          if (shiftedY >= 0 && shiftedY < thumbH) {
            bins[shiftedY] += edges[y * thumbW + x];
            counts[shiftedY]++;
          }
        }
      }

      // Calculate variance of projected edge intensities
      let sum = 0;
      let count = 0;
      for (let y = 0; y < thumbH; y++) {
        if (counts[y] > 10) {
          sum += bins[y];
          count++;
        }
      }
      if (count === 0) continue;
      const mean = sum / count;

      let variance = 0;
      for (let y = 0; y < thumbH; y++) {
        if (counts[y] > 10) {
          const diff = bins[y] - mean;
          variance += diff * diff;
        }
      }

      if (variance > maxVariance) {
        maxVariance = variance;
        bestAngle = a;
      }
    }

    // Returns angle to rotate by to straighten
    return -bestAngle;
  } catch (err) {
    console.error("Auto deskew error:", err);
    return 0;
  }
}

/**
 * Applies document print enhancement filters:
 * - B&W Xerox Clean: Removes shadows, sets paper to pure white, deepens text
 * - Magic Color: Whitens paper background while preserving stamps, logos, and signatures
 * - Photo ID: Balanced brightness, saturation, and contrast for identity cards
 * - Grayscale: Smooth grayscale output
 */
export function applyDocumentEnhancement(
  sourceCanvas: HTMLCanvasElement,
  settings: EnhancementSettings
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);

  if (settings.mode === "original" && settings.brightness === 0 && settings.contrast === 0 && settings.sharpness === 0) {
    return canvas;
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  const brightnessFactor = (settings.brightness / 100) * 255;
  const contrastFactor = (settings.contrast + 100) / 100;
  const whiteThreshold = 255 - (settings.backgroundWhiteness / 100) * 110; // 145 to 255

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Compute luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Saturation calculation for color preservation
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

    if (settings.mode === "bw_xerox") {
      // B&W Xerox Clean Mode:
      // If luminance is high (paper background), snap to pure 255 white.
      // If luminance is dark (text / lines), boost contrast to crisp deep black.
      let val = lum + brightnessFactor;
      if (val >= whiteThreshold) {
        // Pure crisp white background - saves printer toner/ink!
        r = 255;
        g = 255;
        b = 255;
      } else {
        // High contrast text darkening
        const normalized = (val / whiteThreshold); // 0 to 1
        // S-curve contrast boost
        const highContrast = Math.pow(normalized, 1.4 + (settings.contrast / 60)) * 255;
        const finalVal = Math.min(255, Math.max(0, highContrast));
        r = finalVal;
        g = finalVal;
        b = finalVal;
      }
    } else if (settings.mode === "magic_color") {
      // Magic Color Document Mode:
      // If pixel is low saturation and high luminance -> paper background -> whiten
      // If pixel has color (seal/stamp/signature/photo) -> enhance color and keep
      if (sat < 0.18 && lum >= whiteThreshold) {
        r = 255;
        g = 255;
        b = 255;
      } else {
        // Apply brightness & contrast
        r = ((r - 128) * contrastFactor + 128) + brightnessFactor;
        g = ((g - 128) * contrastFactor + 128) + brightnessFactor;
        b = ((b - 128) * contrastFactor + 128) + brightnessFactor;

        // Saturate colored parts (stamps, signatures)
        if (sat > 0.2) {
          const avg = (r + g + b) / 3;
          r = avg + (r - avg) * 1.35;
          g = avg + (g - avg) * 1.35;
          b = avg + (b - avg) * 1.35;
        }

        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
      }
    } else if (settings.mode === "photo_id") {
      // Photo ID / Aadhaar Mode:
      // Mild shadow cleanup with balanced portrait skin tones & holographic protection
      r = ((r - 128) * (1 + settings.contrast / 150) + 128) + brightnessFactor;
      g = ((g - 128) * (1 + settings.contrast / 150) + 128) + brightnessFactor;
      b = ((b - 128) * (1 + settings.contrast / 150) + 128) + brightnessFactor;

      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
    } else if (settings.mode === "grayscale") {
      // Grayscale Mode:
      let val = lum + brightnessFactor;
      val = (val - 128) * contrastFactor + 128;
      if (val >= whiteThreshold) {
        val = 255;
      }
      val = Math.min(255, Math.max(0, val));
      r = val;
      g = val;
      b = val;
    } else {
      // Original with optional sliders
      r = ((r - 128) * contrastFactor + 128) + brightnessFactor;
      g = ((g - 128) * contrastFactor + 128) + brightnessFactor;
      b = ((b - 128) * contrastFactor + 128) + brightnessFactor;
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply Sharpness if requested
  if (settings.sharpness > 0) {
    applyUnsharpMask(ctx, canvas.width, canvas.height, settings.sharpness / 100);
  }

  return canvas;
}

/**
 * 3x3 Convolution Sharpening Kernel for text clarity
 */
function applyUnsharpMask(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  // Kernel: [0, -1, 0, -1, 4 + 1/strength, -1, 0, -1, 0]
  const k = strength * 0.8;
  const center = 1 + 4 * k;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * w + x) * 4 + c];
        const bot = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];
        const mid = src[idx + c];

        const val = mid * center - k * (top + bot + left + right);
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Default corner positions inset by 5% from edges
 */
export function getDefaultCorners(width: number, height: number): QuadCorners {
  const insetX = width * 0.05;
  const insetY = height * 0.05;
  return {
    topLeft: { x: Math.round(insetX), y: Math.round(insetY) },
    topRight: { x: Math.round(width - insetX), y: Math.round(insetY) },
    bottomRight: { x: Math.round(width - insetX), y: Math.round(height - insetY) },
    bottomLeft: { x: Math.round(insetX), y: Math.round(height - insetY) },
  };
}
