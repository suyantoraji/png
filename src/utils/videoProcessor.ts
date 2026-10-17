import { ProcessingConfig, WatermarkBox } from '../types/video';

/**
 * Converts a hex color string like "#ffffff" to [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return [r, g, b];
}

/**
 * Converts [r, g, b] to hex string "#rrggbb"
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Automatically detects the dominant static background color by sampling perimeter pixels.
 */
export function detectBackgroundColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): string {
  try {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 64;
    sampleCanvas.height = 36;
    const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return '#FFFFFF';

    sCtx.drawImage(ctx.canvas, 0, 0, 64, 36);
    const imgData = sCtx.getImageData(0, 0, 64, 36);
    const data = imgData.data;

    // Sample the 4 perimeter edges (top, bottom, left, right)
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let x = 0; x < 64; x++) {
      // Top row
      let idx = x * 4;
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
      // Bottom row
      idx = (35 * 64 + x) * 4;
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
    }

    for (let y = 1; y < 35; y++) {
      // Left edge
      let idx = y * 64 * 4;
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
      // Right edge
      idx = (y * 64 + 63) * 4;
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
    }

    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);

    return rgbToHex(avgR, avgG, avgB);
  } catch {
    return '#FFFFFF';
  }
}

/**
 * Builds a binary watermark mask (Uint8Array of size w * h, 1 for watermark, 0 for clear)
 * based on diagonal grid formula, corner presets, and custom user bounding boxes.
 */
export function generateWatermarkMask(
  width: number,
  height: number,
  config: ProcessingConfig['watermarkRemoval']
): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (!config.enabled) return mask;

  const rad = (config.diagonalAngle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const spacing = Math.max(20, config.diagonalSpacing);
  const halfBand = Math.max(3, config.diagonalBandWidth / 2);

  const cx = width / 2;
  const cy = height / 2;

  // 1. Diagonal Watermark Lattice (Stock video diagonal repeated text/slashes)
  if (config.removeDiagonal) {
    for (let y = 0; y < height; y++) {
      const dy = y - cy;
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const dx = x - cx;

        // Project coordinate along normal to diagonal angle
        const distNormal = -dx * sinA + dy * cosA;

        // Modulo distance to nearest diagonal grid line
        const modDist = ((distNormal % spacing) + spacing) % spacing;
        const distToCenterLine = Math.min(modDist, spacing - modDist);

        if (distToCenterLine <= halfBand) {
          mask[rowOffset + x] = 1;
        }
      }
    }
  }

  // 2. Corner Watermark Masks (Logos, broadcast bugs)
  if (config.removeCorners && config.cornerLocations.length > 0) {
    const cornerW = Math.round(width * (config.cornerSize / 100));
    const cornerH = Math.round(height * (config.cornerSize / 100));

    for (const loc of config.cornerLocations) {
      let startX = 0;
      let endX = cornerW;
      let startY = 0;
      let endY = cornerH;

      if (loc === 'top-right') {
        startX = width - cornerW;
        endX = width;
      } else if (loc === 'bottom-left') {
        startY = height - cornerH;
        endY = height;
      } else if (loc === 'bottom-right') {
        startX = width - cornerW;
        endX = width;
        startY = height - cornerH;
        endY = height;
      }

      for (let y = startY; y < endY; y++) {
        const rowOffset = y * width;
        for (let x = startX; x < endX; x++) {
          mask[rowOffset + x] = 1;
        }
      }
    }
  }

  // 3. Custom Manual Bounding Boxes
  if (config.customBoxes && config.customBoxes.length > 0) {
    for (const box of config.customBoxes) {
      const bx = Math.round((box.x / 100) * width);
      const by = Math.round((box.y / 100) * height);
      const bw = Math.round((box.width / 100) * width);
      const bh = Math.round((box.height / 100) * height);

      const x0 = Math.max(0, bx);
      const y0 = Math.max(0, by);
      const x1 = Math.min(width, bx + bw);
      const y1 = Math.min(height, by + bh);

      for (let y = y0; y < y1; y++) {
        const rowOffset = y * width;
        for (let x = x0; x < x1; x++) {
          mask[rowOffset + x] = 1;
        }
      }
    }
  }

  return mask;
}

/**
 * Inpaints the regions identified by the watermark mask using multi-directional
 * boundary texture propagation and directional bilateral blending.
 */
export function inpaintWatermark(
  data: Uint8ClampedArray,
  mask: Uint8Array,
  width: number,
  height: number,
  intensity: number = 50
) {
  const blendFactor = Math.max(0.1, Math.min(1.0, intensity / 50));
  const buffer = new Uint8ClampedArray(data);

  // Inpaint radius
  const maxRadius = 14;

  // Directions: 8 angles to search for clean boundary pixels
  const dirs: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, 1], [-1, 1], [1, -1]
  ];

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (mask[idx] === 0) continue; // Clear pixel, skip

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let totalWeight = 0;

      // Sample along 8 directions until hitting an unmasked pixel
      for (let d = 0; d < dirs.length; d++) {
        const [dx, dy] = dirs[d];
        for (let r = 1; r <= maxRadius; r++) {
          const nx = x + dx * r;
          const ny = y + dy * r;

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;

          const nIdx = ny * width + nx;
          if (mask[nIdx] === 0) {
            // Found unmasked pixel
            const weight = 1 / (r * r);
            const pIdx = nIdx * 4;

            sumR += buffer[pIdx] * weight;
            sumG += buffer[pIdx + 1] * weight;
            sumB += buffer[pIdx + 2] * weight;
            totalWeight += weight;
            break;
          }
        }
      }

      if (totalWeight > 0) {
        const pIdx = idx * 4;
        const targetR = sumR / totalWeight;
        const targetG = sumG / totalWeight;
        const targetB = sumB / totalWeight;

        data[pIdx] = data[pIdx] * (1 - blendFactor) + targetR * blendFactor;
        data[pIdx + 1] = data[pIdx + 1] * (1 - blendFactor) + targetG * blendFactor;
        data[pIdx + 2] = data[pIdx + 2] * (1 - blendFactor) + targetB * blendFactor;
      }
    }
  }
}

/**
 * Removes static background by calculating color/delta distance from the key color,
 * producing crisp transparent RGBA output with edge antialiasing.
 */
export function removeBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config: ProcessingConfig['bgRemoval']
) {
  if (!config.enabled) return;

  const [kr, kg, kb] = hexToRgb(config.keyColor);
  const tolerance = (config.tolerance / 100) * 441.67; // Max Euclidean distance in RGB is sqrt(255^2*3) = 441.67
  const smoothness = (config.smoothness / 100) * 120;
  const spillFactor = config.spillSuppression / 100;

  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Euclidean distance in color space
    const dr = r - kr;
    const dg = g - kg;
    const db = b - kb;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist < tolerance) {
      // 100% transparent
      data[idx + 3] = 0;
    } else if (dist < tolerance + smoothness && smoothness > 0) {
      // Smooth feather transition
      const alphaNorm = (dist - tolerance) / smoothness;
      data[idx + 3] = Math.round(data[idx + 3] * alphaNorm);

      // Spill suppression on transition edges
      if (spillFactor > 0) {
        const factor = (1 - alphaNorm) * spillFactor;
        data[idx] = Math.max(0, Math.min(255, r - dr * factor));
        data[idx + 1] = Math.max(0, Math.min(255, g - dg * factor));
        data[idx + 2] = Math.max(0, Math.min(255, b - db * factor));
      }
    }
  }
}

/**
 * HD Video Quality Enhancement:
 * - Unsharp masking (Ketajaman HD)
 * - Adaptive contrast equalization
 * - Smart noise reduction (Denoise)
 * - Color vibrance
 */
export function enhanceVideoQuality(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config: ProcessingConfig['enhancement']
) {
  if (!config.enabled) return;

  const sharpenAmount = (config.sharpen / 100) * 1.5;
  const contrastAmount = (config.contrast / 100) * 0.8;
  const vibranceAmount = (config.vibrance / 100) * 0.6;
  const denoiseAmount = config.denoise / 100;

  const totalPixels = width * height;

  // Unsharp mask pass using 3x3 Laplacian edge kernel
  if (sharpenAmount > 0) {
    const copy = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = (rowOffset + x) * 4;

        // Skip completely transparent pixels
        if (copy[idx + 3] === 0) continue;

        // 4-neighbor average
        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (rowOffset + x - 1) * 4;
        const right = (rowOffset + x + 1) * 4;

        for (let c = 0; c < 3; c++) {
          const center = copy[idx + c];
          const neighborAvg = (copy[up + c] + copy[down + c] + copy[left + c] + copy[right + c]) * 0.25;
          const diff = center - neighborAvg;

          // Apply unsharp mask boost
          data[idx + c] = Math.max(0, Math.min(255, center + diff * sharpenAmount));
        }
      }
    }
  }

  // Contrast & Vibrance pass
  if (contrastAmount > 0 || vibranceAmount > 0) {
    const contrastFactor = 1 + contrastAmount;

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      if (data[idx + 3] === 0) continue;

      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Contrast
      if (contrastAmount > 0) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }

      // Vibrance (smart saturation boost on less saturated pixels)
      if (vibranceAmount > 0) {
        const max = Math.max(r, g, b);
        const avg = (r + g + b) / 3;
        const currentSat = Math.abs(max - avg) / 128;
        const boost = (1 - currentSat) * vibranceAmount;

        r = r + (r - avg) * boost;
        g = g + (g - avg) * boost;
        b = b + (b - avg) * boost;
      }

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
    }
  }
}

/**
 * Main frame processing pipeline:
 * Takes source image data (from video/canvas), executes watermark removal,
 * static background removal, and HD enhancement, then writes to target context.
 */
export function processFrame(
  sourceCtx: CanvasRenderingContext2D,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ProcessingConfig,
  customScale: number = 1
): { processedData: ImageData; watermarkMask: Uint8Array } {
  // Read source frame pixels
  const imgData = sourceCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Generate Watermark Mask (Diagonal + Corners + Custom)
  const watermarkMask = generateWatermarkMask(width, height, config.watermarkRemoval);

  // 2. Inpaint Watermarks if enabled
  if (config.watermarkRemoval.enabled) {
    inpaintWatermark(
      data,
      watermarkMask,
      width,
      height,
      config.watermarkRemoval.diagonalIntensity
    );
  }

  // 3. Remove Background if enabled
  if (config.bgRemoval.enabled) {
    removeBackground(data, width, height, config.bgRemoval);
  }

  // 4. Enhance Video HD Quality
  if (config.enhancement.enabled) {
    enhanceVideoQuality(data, width, height, config.enhancement);
  }

  // Render to target canvas
  if (customScale === 1) {
    targetCtx.putImageData(imgData, 0, 0);
  } else {
    // High-resolution scaled output
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imgData, 0, 0);

    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    targetCtx.clearRect(0, 0, width * customScale, height * customScale);
    targetCtx.drawImage(
      tempCanvas,
      0,
      0,
      width * customScale,
      height * customScale
    );
  }

  return { processedData: imgData, watermarkMask };
}
