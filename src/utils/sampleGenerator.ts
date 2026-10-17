/**
 * Generates realistic synthetic animation videos directly in the browser
 * with customizable backgrounds and diagonal/corner watermarks.
 * Users can also upload their own video files!
 */

export interface SampleVideoOption {
  id: string;
  title: string;
  description: string;
  defaultBgColor: string;
  hasDiagonalWatermark: boolean;
  hasCornerWatermark: boolean;
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
}

export const SAMPLE_VIDEOS: SampleVideoOption[] = [
  {
    id: 'badge_3d',
    title: 'Animasi Badge 3D & Watermark Diagonal',
    description: 'Emblem geometris 3D berputar dengan grid watermark diagonal "PREVIEW • STOCK" & latar putih studio diam.',
    defaultBgColor: '#FFFFFF',
    hasDiagonalWatermark: true,
    hasCornerWatermark: true,
    duration: 3,
    width: 640,
    height: 360,
    fps: 30,
  },
  {
    id: 'mascot_robot',
    title: 'Maskot Robotik Lucu & Watermark Diagonal',
    description: 'Karakter robot animasi melompat dan melambaikan tangan dengan watermark diagonal tebal pada latar abu-abu diam.',
    defaultBgColor: '#E2E8F0',
    hasDiagonalWatermark: true,
    hasCornerWatermark: false,
    duration: 3,
    width: 640,
    height: 360,
    fps: 30,
  },
  {
    id: 'kinetic_badge',
    title: 'Logo Hologram Neon & Multi Watermark',
    description: 'Animasi logo cincin hologram bercahaya dengan watermark diagonal ganda & cap hak cipta pojok pada latar hitam studio.',
    defaultBgColor: '#000000',
    hasDiagonalWatermark: true,
    hasCornerWatermark: true,
    duration: 3,
    width: 640,
    height: 360,
    fps: 30,
  },
];

/**
 * Draws a synthetic frame for a given sample video at time `t` (in seconds).
 */
export function drawSampleFrame(
  ctx: CanvasRenderingContext2D,
  sampleId: string,
  t: number,
  width: number,
  height: number
) {
  const sample = SAMPLE_VIDEOS.find((s) => s.id === sampleId) || SAMPLE_VIDEOS[0];

  // 1. Draw static background
  ctx.fillStyle = sample.defaultBgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw animated subject
  if (sampleId === 'badge_3d') {
    draw3DBadgeSubject(ctx, t, width, height);
  } else if (sampleId === 'mascot_robot') {
    drawRobotMascotSubject(ctx, t, width, height);
  } else {
    drawHologramLogoSubject(ctx, t, width, height);
  }

  // 3. Draw diagonal watermark grid (Stock video style)
  if (sample.hasDiagonalWatermark) {
    drawDiagonalWatermarks(ctx, width, height, t);
  }

  // 4. Draw corner watermark
  if (sample.hasCornerWatermark) {
    drawCornerWatermark(ctx, width, height);
  }
}

function draw3DBadgeSubject(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const angle = t * Math.PI * 0.8;
  const scale = 1 + Math.sin(t * 3) * 0.05;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Floating shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 110, 80 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw 3D multifaceted diamond/shield
  const radius = 80;
  const numPoints = 6;
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const a = angle + (i * Math.PI * 2) / numPoints;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * (radius * 0.75);
    points.push([px, py]);
  }

  // Draw 3D faces with gradient
  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const faceGrad = ctx.createLinearGradient(0, -60, 0, 60);

    const hue = (t * 40 + i * 45) % 360;
    faceGrad.addColorStop(0, `hsl(${hue}, 85%, 55%)`);
    faceGrad.addColorStop(1, `hsl(${(hue + 40) % 360}, 90%, 40%)`);

    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Center crystal core
  const coreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 35);
  coreGrad.addColorStop(0, '#FFFFFF');
  coreGrad.addColorStop(0.4, '#38BDF8');
  coreGrad.addColorStop(1, '#0284C7');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Dynamic gleam highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  const gleamX = Math.cos(angle * 2) * 16;
  const gleamY = Math.sin(angle * 2) * 16;
  ctx.arc(gleamX - 6, gleamY - 6, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRobotMascotSubject(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const cx = w / 2;
  const bounceY = Math.abs(Math.sin(t * 4)) * 25;
  const cy = h / 2 + 10 - bounceY;

  ctx.save();
  ctx.translate(cx, cy);

  // Shadow on floor
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  const shadowScale = 1 - bounceY / 80;
  ctx.ellipse(0, 110 + bounceY, 70 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Robot Body (Chubby rounded capsule)
  const bodyGrad = ctx.createLinearGradient(0, -60, 0, 80);
  bodyGrad.addColorStop(0, '#06B6D4');
  bodyGrad.addColorStop(1, '#0E7490');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#083344';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(-55, -45, 110, 115, [40, 40, 30, 30]);
  ctx.fill();
  ctx.stroke();

  // Screen Face
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(-42, -32, 84, 52, 16);
  ctx.fill();

  // Eyes (Expressive blinking)
  const isBlink = Math.sin(t * 3) > 0.95;
  ctx.fillStyle = '#22D3EE';
  if (isBlink) {
    ctx.fillRect(-26, -10, 18, 4);
    ctx.fillRect(8, -10, 18, 4);
  } else {
    ctx.beginPath();
    ctx.arc(-17, -8, 8, 0, Math.PI * 2);
    ctx.arc(17, -8, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Antenna
  ctx.strokeStyle = '#083344';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(0, -75);
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -78, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Waving Arm
  const armWave = Math.sin(t * 8) * 0.4;
  ctx.save();
  ctx.translate(55, 0);
  ctx.rotate(-0.5 + armWave);
  ctx.fillStyle = '#06B6D4';
  ctx.beginPath();
  ctx.roundRect(0, -10, 42, 20, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Left Arm
  ctx.save();
  ctx.translate(-55, 0);
  ctx.rotate(0.3);
  ctx.fillStyle = '#06B6D4';
  ctx.beginPath();
  ctx.roundRect(-42, -10, 42, 20, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawHologramLogoSubject(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Concentric neon rings rotating in opposite directions
  const numRings = 3;
  for (let r = 0; r < numRings; r++) {
    const dir = r % 2 === 0 ? 1 : -1;
    const ringAngle = t * 1.5 * dir;
    const radius = 45 + r * 28;

    ctx.save();
    ctx.rotate(ringAngle);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    ctx.strokeStyle = r === 0 ? '#EC4899' : r === 1 ? '#8B5CF6' : '#3B82F6';
    ctx.lineWidth = 6 - r;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Node satellites
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(radius, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Glowing center emblem
  const pulse = Math.sin(t * 4) * 0.2 + 1;
  ctx.fillStyle = '#A855F7';
  ctx.beginPath();
  ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', 0, 2);

  ctx.restore();
}

/**
 * Draws diagonal repeating watermark lattice (the classic stock footage watermark)
 */
function drawDiagonalWatermarks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4); // -45 degrees diagonal angle

  const spacing = 120;
  const extent = Math.max(w, h) * 1.5;

  ctx.font = 'bold 15px "Plus Jakarta Sans", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw diagonal text rows
  for (let y = -extent; y <= extent; y += spacing) {
    // Subtle translucent watermark line
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-extent, y);
    ctx.lineTo(extent, y);
    ctx.stroke();

    // Repeating watermark text
    for (let x = -extent; x <= extent; x += 180) {
      // White text with subtle dark shadow/emboss
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText('PREVIEW • KROMACLEAR • SAMPLE', x, y - 10);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillText('PREVIEW • KROMACLEAR • SAMPLE', x + 1, y - 9);
    }
  }

  ctx.restore();
}

/**
 * Draws corner badge / watermark
 */
function drawCornerWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  // Bottom Right corner box
  const pad = 24;
  const boxW = 110;
  const boxH = 32;
  const x = w - boxW - pad;
  const y = h - boxH - pad;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, boxW, boxH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WATERMARK ©', x + boxW / 2, y + boxH / 2);

  ctx.restore();
}

/**
 * Records a synthetic sample canvas animation into a downloadable WebM Blob
 * so it behaves 100% identically to an uploaded video file!
 */
export async function generateSampleVideoBlob(
  sampleId: string,
  onProgress?: (ratio: number) => void
): Promise<{ blob: Blob; url: string; metadata: { duration: number; width: number; height: number; fps: number } }> {
  const sample = SAMPLE_VIDEOS.find((s) => s.id === sampleId) || SAMPLE_VIDEOS[0];
  const { width, height, fps, duration } = sample;
  const totalFrames = Math.floor(fps * duration);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const stream = canvas.captureStream(fps);
  
  // Prefer vp9/vp8 WebM
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 4000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      resolve({
        blob,
        url,
        metadata: {
          duration,
          width,
          height,
          fps,
        },
      });
    };

    recorder.onerror = (err) => reject(err);

    recorder.start();

    let frame = 0;
    const intervalMs = 1000 / fps;

    const renderLoop = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(renderLoop);
        recorder.stop();
        return;
      }

      const t = frame / fps;
      drawSampleFrame(ctx, sampleId, t, width, height);

      frame++;
      if (onProgress) {
        onProgress(frame / totalFrames);
      }
    }, intervalMs);
  });
}
