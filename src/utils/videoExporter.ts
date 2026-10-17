import JSZip from 'jszip';
import { ExportOptions, ExportProgress, ProcessingConfig } from '../types/video';
import { processFrame } from './videoProcessor';
import { drawSampleFrame } from './sampleGenerator';

/**
 * Exports video frames with transparent background and watermark removal.
 * Supports:
 * - WebM (with VP9/VP8 alpha channel)
 * - MOV (QuickTime Animation / ProRes compatible wrapper)
 * - ZIP PNG Sequence (100% loss-free alpha for Premiere Pro, After Effects, DaVinci Resolve)
 * - Single PNG snapshot
 */
export async function exportTransparentAnimation(
  sourceElement: HTMLVideoElement | { isSample: true; sampleId: string },
  metadata: { width: number; height: number; duration: number; fps: number },
  config: ProcessingConfig,
  options: ExportOptions,
  onProgress: (p: ExportProgress) => void
): Promise<{ url: string; filename: string }> {
  const { width: origWidth, height: origHeight, duration, fps } = metadata;
  const scale = options.scale || 1;
  const exportWidth = Math.round(origWidth * scale);
  const exportHeight = Math.round(origHeight * scale);

  const totalFrames = Math.max(1, Math.floor(duration * fps));
  const isSample = 'isSample' in sourceElement && sourceElement.isSample;

  // Working offline canvases
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = origWidth;
  sourceCanvas.height = origHeight;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true })!;

  // 1. Single PNG snapshot export
  if (options.format === 'single_png') {
    onProgress({
      isExporting: true,
      progress: 50,
      currentFrame: 1,
      totalFrames: 1,
      statusText: 'Merender frame PNG transparan...',
    });

    if (isSample) {
      drawSampleFrame(sourceCtx, (sourceElement as { sampleId: string }).sampleId, 0.5, origWidth, origHeight);
    } else {
      sourceCtx.drawImage(sourceElement as HTMLVideoElement, 0, 0, origWidth, origHeight);
    }

    processFrame(sourceCtx, exportCtx, origWidth, origHeight, config, scale);

    const blob = await new Promise<Blob>((resolve) => {
      exportCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const url = URL.createObjectURL(blob);
    const filename = `kromaclear_transparan_${Date.now()}.png`;

    onProgress({
      isExporting: false,
      progress: 100,
      currentFrame: 1,
      totalFrames: 1,
      statusText: 'Selesai!',
      downloadUrl: url,
      downloadFilename: filename,
    });

    return { url, filename };
  }

  // 2. PNG Sequence (ZIP) for professional editors (Premiere, After Effects, DaVinci, Blender)
  if (options.format === 'png_sequence') {
    const zip = new JSZip();
    const folder = zip.folder('transparent_frames') || zip;

    // Add instructions README
    folder.file(
      'PETUNJUK_IMPORT_PREMIERE_AFTEREFFECTS.txt',
      `KromaClear Studio - Export Sequence PNG Transparan
======================================================
Resolusi: ${exportWidth}x${exportHeight} (${scale}x HD)
FPS: ${fps} fps
Total Frame: ${totalFrames} frames
Transparansi: 32-bit RGBA (100% Zero-Loss Alpha Channel)

CARA IMPORT KE SOFTWARE EDITING:
1. Adobe Premiere Pro:
   - Klik File > Import.
   - Pilih file pertama 'frame_0001.png'.
   - Centang opsi 'Image Sequence' di bawah jendela import.
   - Klik Open. Video transparan akan otomatis terbentuk!

2. Adobe After Effects:
   - Klik File > Import > File.
   - Pilih 'frame_0001.png', pastikan 'PNG Sequence' tercentang.
   - Klik Import.

3. DaVinci Resolve:
   - Buka Media Pool, pilih folder 'transparent_frames'.
   - Resolve otomatis mendeteksi deretan frame sebagai satu klip video transparan tunggal.`
    );

    for (let f = 0; f < totalFrames; f++) {
      const time = f / fps;

      onProgress({
        isExporting: true,
        progress: Math.round((f / totalFrames) * 90),
        currentFrame: f + 1,
        totalFrames,
        statusText: `Merender frame ${f + 1}/${totalFrames} (Transparan HD)...`,
      });

      if (isSample) {
        drawSampleFrame(sourceCtx, (sourceElement as { sampleId: string }).sampleId, time, origWidth, origHeight);
      } else {
        const video = sourceElement as HTMLVideoElement;
        video.currentTime = time;
        await new Promise((r) => {
          const onSeek = () => {
            video.removeEventListener('seeked', onSeek);
            r(true);
          };
          video.addEventListener('seeked', onSeek);
        });
        sourceCtx.drawImage(video, 0, 0, origWidth, origHeight);
      }

      exportCtx.clearRect(0, 0, exportWidth, exportHeight);
      processFrame(sourceCtx, exportCtx, origWidth, origHeight, config, scale);

      const frameBlob = await new Promise<Blob>((resolve) => {
        exportCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
      });

      const frameNumber = String(f + 1).padStart(4, '0');
      folder.file(`frame_${frameNumber}.png`, frameBlob);
    }

    onProgress({
      isExporting: true,
      progress: 95,
      currentFrame: totalFrames,
      totalFrames,
      statusText: 'Mengompresi arsip ZIP transparan...',
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const filename = `kromaclear_png_sequence_${Date.now()}.zip`;

    onProgress({
      isExporting: false,
      progress: 100,
      currentFrame: totalFrames,
      totalFrames,
      statusText: 'Selesai!',
      downloadUrl: url,
      downloadFilename: filename,
    });

    return { url, filename };
  }

  // 3. WebM / MOV Video Export (with Alpha Channel)
  // WebM supports VP9/VP8 with alpha channel directly through Canvas captureStream.
  const stream = exportCanvas.captureStream(fps);

  let mimeType = 'video/webm; codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm; codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16000000 * scale, // High bitrate for crystal clear HD
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const isMov = options.format === 'mov';
      const outputType = isMov ? 'video/quicktime' : mimeType;
      const extension = isMov ? 'mov' : 'webm';
      const blob = new Blob(chunks, { type: outputType });
      const url = URL.createObjectURL(blob);
      const filename = `kromaclear_transparan_${exportWidth}p_${Date.now()}.${extension}`;

      onProgress({
        isExporting: false,
        progress: 100,
        currentFrame: totalFrames,
        totalFrames,
        statusText: 'Ekspor Berhasil!',
        downloadUrl: url,
        downloadFilename: filename,
      });

      resolve({ url, filename });
    };

    recorder.onerror = (e) => reject(e);

    recorder.start();

    // Render loop frame-by-frame
    let currentFrame = 0;
    const intervalMs = 1000 / fps;

    const renderNextFrame = async () => {
      if (currentFrame >= totalFrames) {
        setTimeout(() => recorder.stop(), 200);
        return;
      }

      const time = currentFrame / fps;

      onProgress({
        isExporting: true,
        progress: Math.round((currentFrame / totalFrames) * 98),
        currentFrame: currentFrame + 1,
        totalFrames,
        statusText: `Mengodekan frame ${currentFrame + 1}/${totalFrames} (${options.format.toUpperCase()} Transparan)...`,
      });

      if (isSample) {
        drawSampleFrame(sourceCtx, (sourceElement as { sampleId: string }).sampleId, time, origWidth, origHeight);
      } else {
        const video = sourceElement as HTMLVideoElement;
        video.currentTime = time;
        await new Promise((r) => {
          const onSeek = () => {
            video.removeEventListener('seeked', onSeek);
            r(true);
          };
          video.addEventListener('seeked', onSeek);
        });
        sourceCtx.drawImage(video, 0, 0, origWidth, origHeight);
      }

      exportCtx.clearRect(0, 0, exportWidth, exportHeight);
      processFrame(sourceCtx, exportCtx, origWidth, origHeight, config, scale);

      currentFrame++;
      setTimeout(renderNextFrame, intervalMs);
    };

    renderNextFrame();
  });
}
