/**
 * Enhanced Edge detection utilities for document scanning
 * Implementing CamScanner-like accuracy with Canny edge detection
 */

export interface Point {
  x: number;
  y: number;
}

export interface Corner extends Point {
  score: number;
}

/**
 * Converts RGB image data to grayscale using luminance method
 */
export function convertToGrayscale(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const grayData = new Uint8Array(width * height);
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula for better perceptual accuracy
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayData[i / 4] = gray;
  }
  
  return grayData;
}

/**
 * Applies Gaussian blur for noise reduction
 */
export function applyGaussianBlur(data: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let count = 0;
      
      // 5x5 Gaussian kernel
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const idx = (y + ky) * width + (x + kx);
          if (idx >= 0 && idx < data.length) {
            const gaussWeight = Math.exp(-(kx * kx + ky * ky) / 2);
            sum += data[idx] * gaussWeight;
            count += gaussWeight;
          }
        }
      }
      result[y * width + x] = sum / count;
    }
  }
  
  return result;
}

/**
 * Applies Sobel operator for edge detection
 */
export function applySobelOperator(data: Uint8Array, width: number, height: number): { magnitude: Float32Array, angle: Float32Array } {
  const magnitude = new Float32Array(width * height);
  const angle = new Float32Array(width * height);
  
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += data[idx] * sobelX[kernelIdx];
          gy += data[idx] * sobelY[kernelIdx];
        }
      }
      
      const mag = Math.sqrt(gx * gx + gy * gy);
      magnitude[y * width + x] = mag;
      angle[y * width + x] = Math.atan2(gy, gx);
    }
  }
  
  return { magnitude, angle };
}

/**
 * Non-maximum suppression for thinning edges
 */
export function nonMaximumSuppression(magnitude: Float32Array, angle: Float32Array, width: number, height: number): Float32Array {
  const suppressed = new Float32Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const mag = magnitude[idx];
      const ang = angle[idx];
      
      // Quantize angle to 0, 45, 90, 135 degrees
      let angleDeg = (ang * 180 / Math.PI + 180) % 180;
      if (angleDeg < 0) angleDeg += 180;
      
      let neighbor1 = 0, neighbor2 = 0;
      
      // Compare with neighbors along gradient direction
      if ((angleDeg >= 0 && angleDeg < 22.5) || (angleDeg >= 157.5 && angleDeg < 180)) {
        // Horizontal
        neighbor1 = magnitude[y * width + (x + 1)];
        neighbor2 = magnitude[y * width + (x - 1)];
      } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
        // Diagonal -45
        neighbor1 = magnitude[(y + 1) * width + (x + 1)];
        neighbor2 = magnitude[(y - 1) * width + (x - 1)];
      } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
        // Vertical
        neighbor1 = magnitude[(y + 1) * width + x];
        neighbor2 = magnitude[(y - 1) * width + x];
      } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
        // Diagonal +45
        neighbor1 = magnitude[(y - 1) * width + (x + 1)];
        neighbor2 = magnitude[(y + 1) * width + (x - 1)];
      }
      
      if (mag >= neighbor1 && mag >= neighbor2) {
        suppressed[idx] = mag;
      }
    }
  }
  
  return suppressed;
}

/**
 * Hysteresis thresholding with edge tracking
 */
export function hysteresisThreshold(suppressed: Float32Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(width * height);
  let maxVal = 0;
  
  for (let i = 0; i < suppressed.length; i++) {
    if (suppressed[i] > maxVal) maxVal = suppressed[i];
  }
  
  const highThreshold = maxVal * 0.15;
  const lowThreshold = maxVal * 0.05;
  
  // Strong edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (suppressed[idx] >= highThreshold) {
        result[idx] = 255;
      }
    }
  }
  
  // Connect weak edges to strong ones
  const visited = new Set<number>();
  
  const connectEdge = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited.has(idx) || x < 1 || x >= width - 1 || y < 1 || y >= height - 1) return;
    visited.add(idx);
    
    if (suppressed[idx] >= lowThreshold) {
      result[idx] = 255;
      
      // Check 8 neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          connectEdge(x + dx, y + dy);
        }
      }
    }
  };
  
  // Find all strong edges and track from them
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (result[idx] === 255 && !visited.has(idx)) {
        connectEdge(x, y);
      }
    }
  }
  
  return result;
}

/**
 * Find document corners using contour analysis
 */
export function findDocumentCorners(edgeData: Uint8Array, width: number, height: number): Point[] {
  const corners: Point[] = [];
  const visited = new Set<number>();
  
  // Find longest continuous edges (document boundaries)
  const contours: Point[][] = [];
  
  const getNeighbors = (x: number, y: number): Point[] => {
    const neighbors: Point[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (!visited.has(idx) && edgeData[idx] > 128) {
            neighbors.push({ x: nx, y: ny });
          }
        }
      }
    }
    return neighbors;
  };
  
  // Trace contours
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (edgeData[idx] > 128 && !visited.has(idx)) {
        const contour: Point[] = [];
        let current: Point | null = { x, y };
        
        while (current) {
          visited.add(current.y * width + current.x);
          contour.push(current);
          const neighbors = getNeighbors(current.x, current.y);
          current = neighbors[0] || null;
        }
        
        if (contour.length > 50) { // Filter small contours
          contours.push(contour);
        }
      }
    }
  }
  
  if (contours.length === 0) return [];
  
  // Find the largest contour (the document)
  const largestContour = contours.reduce((max, contour) => 
    contour.length > max.length ? contour : max
  );
  
  // Find corner points using Douglas-Peucker algorithm or similar
  // For simplicity, we'll find extreme points
  const reduced = douglasPeucker(largestContour, 0.02);
  
  if (reduced.length >= 4) {
    // Sort points to get corners
    const sorted = sortPointsToQuadrilateral(reduced);
    return sorted.slice(0, 4);
  }
  
  // Fallback: use bounding box corners
  let minX = width, maxX = 0, minY = height, maxY = 0;
  largestContour.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });
  
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY }
  ];
}

/**
 * Douglas-Peucker algorithm for contour simplification
 */
function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  
  const [start, end] = [points[0], points[points.length - 1]];
  
  let maxDist = 0;
  let maxIdx = 0;
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = pointToLineDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  
  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [start, end];
}

function pointToLineDistance(p: Point, lineStart: Point, lineEnd: Point): number {
  const A = p.x - lineStart.x;
  const B = p.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;
  
  const xx = param < 0 ? lineStart.x : param > 1 ? lineEnd.x : (lineStart.x + param * C);
  const yy = param < 0 ? lineStart.y : param > 1 ? lineEnd.y : (lineStart.y + param * D);
  
  const dx = p.x - xx;
  const dy = p.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Sort points to form a quadrilateral (TL, TR, BR, BL)
 */
function sortPointsToQuadrilateral(points: Point[]): Point[] {
  if (points.length < 4) return points;
  
  // Find centroid
  const centroid = points.reduce((acc, p) => ({
    x: acc.x + p.x,
    y: acc.y + p.y
  }), { x: 0, y: 0 });
  centroid.x /= points.length;
  centroid.y /= points.length;
  
  // Sort by angle from centroid
  const sorted = [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });
  
  // Ensure we have exactly 4 corners
  if (sorted.length > 4) {
    const step = sorted.length / 4;
    return [
      sorted[0],
      sorted[Math.floor(step)],
      sorted[Math.floor(step * 2)],
      sorted[Math.floor(step * 3)]
    ];
  }
  
  return sorted;
}

/**
 * Complete Canny-like edge detection
 */
export function detectDocumentEdges(imageData: ImageData): Point[] {
  const { width, height } = imageData;
  
  // 1. Convert to grayscale
  const gray = convertToGrayscale(imageData);
  
  // 2. Apply Gaussian blur
  const blurred = applyGaussianBlur(gray, width, height);
  
  // 3. Apply Sobel operator
  const { magnitude, angle } = applySobelOperator(blurred, width, height);
  
  // 4. Non-maximum suppression
  const suppressed = nonMaximumSuppression(magnitude, angle, width, height);
  
  // 5. Hysteresis thresholding
  const edges = hysteresisThreshold(suppressed, width, height);
  
  // 6. Find document corners
  const corners = findDocumentCorners(edges, width, height);
  
  return corners;
}

/**
 * Apply perspective correction
 */
export function applyPerspectiveCorrection(
  sourceCanvas: HTMLCanvasElement,
  corners: Point[]
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx || corners.length !== 4) return sourceCanvas;
  
  // Calculate destination dimensions
  const width = Math.max(
    Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y),
    Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)
  );
  const height = Math.max(
    Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y),
    Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y)
  );
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw corrected image
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  ctx.lineTo(corners[1].x, corners[1].y);
  ctx.lineTo(corners[2].x, corners[2].y);
  ctx.lineTo(corners[3].x, corners[3].y);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();
  
  return canvas;
}