export interface ImageFilterOptions {
  brightness: number; // 50 to 150 (default 100)
  contrast: number; // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  sharpness: number; // 0 to 100 (default 0)
  blur: number; // 0 to 20 (default 0)
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  bgColor?: string; // e.g. '#ffffff', '#3b82f6', '#ef4444', '#9ca3af'
  borderWidth?: number; // 0 to 20 px
  borderColor?: string;
}

export const defaultImageFilters: ImageFilterOptions = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  blur: 0,
  rotate: 0,
  flipH: false,
  flipV: false,
  bgColor: undefined,
  borderWidth: 0,
  borderColor: "#000000",
};

/**
 * Loads an image from a Data URL or File into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders filtered image onto a fresh HTMLCanvasElement
 */
export async function renderFilteredCanvas(
  imageSrc: string,
  filters: ImageFilterOptions
): Promise<HTMLCanvasElement> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas 2D context not available");

  const is90or270 = filters.rotate % 180 !== 0;
  canvas.width = is90or270 ? img.height : img.width;
  canvas.height = is90or270 ? img.width : img.height;

  // Background color fill if requested
  if (filters.bgColor) {
    ctx.fillStyle = filters.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  // Center translation for rotation and flipping
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((filters.rotate * Math.PI) / 180);
  ctx.scale(filters.flipH ? -1 : 1, filters.flipV ? -1 : 1);

  // CSS Filter string
  const filterStrings = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    filters.blur > 0 ? `blur(${filters.blur}px)` : "",
  ].filter(Boolean);

  ctx.filter = filterStrings.join(" ") || "none";

  ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
  ctx.restore();

  // Apply optional sharpness filter using convolution if sharpness > 0
  if (filters.sharpness > 0) {
    applySharpness(ctx, canvas.width, canvas.height, filters.sharpness / 100);
  }

  // Draw border if requested
  if (filters.borderWidth && filters.borderWidth > 0 && filters.borderColor) {
    ctx.strokeStyle = filters.borderColor;
    ctx.lineWidth = filters.borderWidth * 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

/**
 * Convolution filter for image sharpening
 */
function applySharpness(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // 3x3 Laplacian sharpening kernel
    // [  0, -a,  0 ]
    // [ -a, 1+4a, -a ]
    // [  0, -a,  0 ]
    const a = amount * 0.75;
    const center = 1 + 4 * a;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            copy[idx + c] * center -
            (copy[up + c] + copy[down + c] + copy[left + c] + copy[right + c]) * a;
          data[idx + c] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn("Sharpness convolution skipped:", e);
  }
}

/**
 * Intelligent background color replacement (Color Flood Fill on Corner Edges)
 */
export async function replaceStudioBackground(
  imageSrc: string,
  targetBgColor: string,
  tolerance = 38
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return imageSrc;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner pixel color (assumed background)
  const cornerR = data[0];
  const cornerG = data[1];
  const cornerB = data[2];

  // Parse target hex
  const targetR = parseInt(targetBgColor.slice(1, 3), 16) || 255;
  const targetG = parseInt(targetBgColor.slice(3, 5), 16) || 255;
  const targetB = parseInt(targetBgColor.slice(5, 7), 16) || 255;

  const w = canvas.width;
  const h = canvas.height;
  const visited = new Uint8Array(w * h);
  const queue: [number, number][] = [];

  // Seed with all 4 corners and borders
  for (let x = 0; x < w; x += 4) {
    queue.push([x, 0]);
    queue.push([x, h - 1]);
  }
  for (let y = 0; y < h; y += 4) {
    queue.push([0, y]);
    queue.push([w - 1, y]);
  }

  function colorDiff(r: number, g: number, b: number, cr: number, cg: number, cb: number) {
    return Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const idx = pos * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (colorDiff(r, g, b, cornerR, cornerG, cornerB) <= tolerance) {
      data[idx] = targetR;
      data[idx + 1] = targetG;
      data[idx + 2] = targetB;

      // push neighbors
      if (x > 0 && !visited[pos - 1]) queue.push([x - 1, y]);
      if (x < w - 1 && !visited[pos + 1]) queue.push([x + 1, y]);
      if (y > 0 && !visited[pos - w]) queue.push([x, y - 1]);
      if (y < h - 1 && !visited[pos + w]) queue.push([x, y + 1]);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.95);
}

/**
 * Reduce image to specific target KB size (e.g., target 20KB for signatures, 50KB for Aadhaar/PAN)
 */
export async function compressToTargetKB(
  imageSrc: string,
  targetKB: number,
  format: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<{ dataUrl: string; actualKB: number; width: number; height: number }> {
  const img = await loadImage(imageSrc);
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  let quality = 0.95;
  let dataUrl = canvas.toDataURL(format, quality);
  let sizeKB = (dataUrl.length * 3) / 4 / 1024;

  let iterations = 0;
  // If size is still larger than target, adjust dimensions and quality iteratively
  while (sizeKB > targetKB && iterations < 12) {
    iterations++;
    if (quality > 0.3) {
      quality -= 0.1;
    } else {
      // Scale down canvas dimensions
      const scale = 0.85;
      const newCanvas = document.createElement("canvas");
      newCanvas.width = Math.max(80, Math.floor(canvas.width * scale));
      newCanvas.height = Math.max(80, Math.floor(canvas.height * scale));
      const newCtx = newCanvas.getContext("2d")!;
      newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
      canvas = newCanvas;
      ctx = newCtx;
      quality = 0.8;
    }
    dataUrl = canvas.toDataURL(format, quality);
    sizeKB = (dataUrl.length * 3) / 4 / 1024;
  }

  return {
    dataUrl,
    actualKB: Math.round(sizeKB * 10) / 10,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Resize image to exact mm/cm at target DPI (standard: 300 DPI for high-res photo print, 200 DPI for web upload)
 */
export async function resizeToDimensions(
  imageSrc: string,
  widthMm: number,
  heightMm: number,
  dpi = 300
): Promise<string> {
  const mmToInches = 1 / 25.4;
  const targetPxWidth = Math.round(widthMm * mmToInches * dpi);
  const targetPxHeight = Math.round(heightMm * mmToInches * dpi);

  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = targetPxWidth;
  canvas.height = targetPxHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  // Center & crop fit
  const imgRatio = img.width / img.height;
  const targetRatio = targetPxWidth / targetPxHeight;

  let renderWidth = targetPxWidth;
  let renderHeight = targetPxHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderWidth = targetPxHeight * imgRatio;
    offsetX = -(renderWidth - targetPxWidth) / 2;
  } else {
    renderHeight = targetPxWidth / imgRatio;
    offsetY = -(renderHeight - targetPxHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  return canvas.toDataURL("image/jpeg", 0.98);
}
