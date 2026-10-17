import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Eye, 
  Maximize2, 
  Grid, 
  Layers, 
  SlidersHorizontal,
  Split,
  Columns
} from 'lucide-react';
import { BackdropType, ProcessingConfig, ViewMode } from '../types/video';
import { processFrame } from '../utils/videoProcessor';
import { drawSampleFrame } from '../utils/sampleGenerator';

interface VideoPlayerViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isSample: boolean;
  sampleId: string;
  config: ProcessingConfig;
  onConfigChange: (updater: (prev: ProcessingConfig) => ProcessingConfig) => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  width: number;
  height: number;
  fps: number;
}

export const VideoPlayerViewport: React.FC<VideoPlayerViewportProps> = ({
  videoRef,
  isSample,
  sampleId,
  config,
  onConfigChange,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  width,
  height,
  fps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Split slider state
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Initialize offline processing canvases
  useEffect(() => {
    if (!sourceCanvasRef.current) {
      sourceCanvasRef.current = document.createElement('canvas');
    }
    if (!processedCanvasRef.current) {
      processedCanvasRef.current = document.createElement('canvas');
    }
    sourceCanvasRef.current.width = width;
    sourceCanvasRef.current.height = height;
    processedCanvasRef.current.width = width;
    processedCanvasRef.current.height = height;
  }, [width, height]);

  // Main render function for current frame
  const renderCurrentFrame = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas || !sourceCanvasRef.current || !processedCanvasRef.current) return;

    const sourceCtx = sourceCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const procCtx = processedCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const dispCtx = displayCanvas.getContext('2d');
    if (!sourceCtx || !procCtx || !dispCtx) return;

    // 1. Grab original frame
    sourceCtx.clearRect(0, 0, width, height);
    if (isSample) {
      drawSampleFrame(sourceCtx, sampleId, currentTime, width, height);
    } else if (videoRef.current && videoRef.current.readyState >= 2) {
      sourceCtx.drawImage(videoRef.current, 0, 0, width, height);
    }

    // 2. Process frame (Watermark removal + Background removal + HD enhancement)
    procCtx.clearRect(0, 0, width, height);
    const { watermarkMask } = processFrame(sourceCtx, procCtx, width, height, config, 1);

    // 3. Render to main display canvas according to ViewMode
    displayCanvas.width = width;
    displayCanvas.height = height;
    dispCtx.clearRect(0, 0, width, height);

    const mode = config.preview.viewMode;

    if (mode === 'original') {
      // Show pure original source
      dispCtx.drawImage(sourceCanvasRef.current, 0, 0);
    } else if (mode === 'processed') {
      // Show fully processed transparent result
      dispCtx.drawImage(processedCanvasRef.current, 0, 0);
    } else if (mode === 'mask') {
      // Visualize binary watermark mask
      const maskImg = dispCtx.createImageData(width, height);
      for (let i = 0; i < width * height; i++) {
        const isMasked = watermarkMask[i] === 1;
        const idx = i * 4;
        maskImg.data[idx] = isMasked ? 244 : 20;     // R
        maskImg.data[idx + 1] = isMasked ? 63 : 24;  // G
        maskImg.data[idx + 2] = isMasked ? 94 : 32;  // B
        maskImg.data[idx + 3] = 255;
      }
      dispCtx.putImageData(maskImg, 0, 0);
    } else if (mode === 'split') {
      // Split view: Left = Original with background & watermark, Right = Processed transparent HD!
      const splitX = Math.round((splitPos / 100) * width);

      // Draw original left half
      dispCtx.save();
      dispCtx.beginPath();
      dispCtx.rect(0, 0, splitX, height);
      dispCtx.clip();
      dispCtx.drawImage(sourceCanvasRef.current, 0, 0);
      dispCtx.restore();

      // Draw processed right half
      dispCtx.save();
      dispCtx.beginPath();
      dispCtx.rect(splitX, 0, width - splitX, height);
      dispCtx.clip();
      dispCtx.drawImage(processedCanvasRef.current, 0, 0);
      dispCtx.restore();

      // Draw split divider line
      dispCtx.strokeStyle = '#38BDF8';
      dispCtx.lineWidth = 2;
      dispCtx.beginPath();
      dispCtx.moveTo(splitX, 0);
      dispCtx.lineTo(splitX, height);
      dispCtx.stroke();
    }
  }, [width, height, isSample, sampleId, currentTime, videoRef, config, splitPos]);

  // Trigger frame render whenever dependencies change or video plays
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCurrentFrame();
      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCurrentFrame, isPlaying]);

  // Handle split dragging
  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplit(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newPos = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
      setSplitPos(newPos);
    };

    const handleMouseUp = () => {
      if (isDraggingSplit) setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Backdrop CSS class
  const getBackdropClass = () => {
    switch (config.preview.backdrop) {
      case 'checkerboard_dark':
        return 'bg-checkerboard';
      case 'checkerboard_light':
        return 'bg-checkerboard-light';
      case 'black':
        return 'bg-neutral-950';
      case 'white':
        return 'bg-white';
      case 'neon_green':
        return 'bg-[#00FF00]';
      case 'custom_color':
        return '';
      default:
        return 'bg-checkerboard';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const currentFrameNumber = Math.floor(currentTime * fps) + 1;
  const totalFrames = Math.max(1, Math.floor(duration * fps));

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Viewport Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, viewMode: 'split' } }))}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              config.preview.viewMode === 'split' ? 'bg-cyan-500 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
            title="Bandingkan Sebelum (Asli) dan Sesudah (Transparan HD)"
          >
            <Split className="w-3.5 h-3.5" />
            Bandingkan Split
          </button>
          <button
            onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, viewMode: 'processed' } }))}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              config.preview.viewMode === 'processed' ? 'bg-cyan-500 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
            title="Lihat Hasil Bersih Transparan Tanpa Watermark"
          >
            <Layers className="w-3.5 h-3.5" />
            Transparan HD
          </button>
          <button
            onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, viewMode: 'original' } }))}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              config.preview.viewMode === 'original' ? 'bg-cyan-500 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
            title="Lihat Video Asli Dengan Watermark & Background"
          >
            <Eye className="w-3.5 h-3.5" />
            Video Asli
          </button>
          <button
            onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, viewMode: 'mask' } }))}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              config.preview.viewMode === 'mask' ? 'bg-cyan-500 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
            title="Lihat Mask Area Watermark yang Dihapus"
          >
            <Grid className="w-3.5 h-3.5" />
            Mask Watermark
          </button>
        </div>

        {/* Backdrop Selector for Testing Transparency */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[11px] whitespace-nowrap">Latar Pratinjau:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, backdrop: 'checkerboard_dark' } }))}
              className={`w-6 h-6 rounded border transition-all ${
                config.preview.backdrop === 'checkerboard_dark' ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-neutral-700 opacity-60 hover:opacity-100'
              } bg-checkerboard`}
              title="Papan Catur Gelap (Transparansi Gelap)"
            />
            <button
              onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, backdrop: 'checkerboard_light' } }))}
              className={`w-6 h-6 rounded border transition-all ${
                config.preview.backdrop === 'checkerboard_light' ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-neutral-700 opacity-60 hover:opacity-100'
              } bg-checkerboard-light`}
              title="Papan Catur Terang (Transparansi Terang)"
            />
            <button
              onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, backdrop: 'black' } }))}
              className={`w-6 h-6 rounded border bg-black transition-all ${
                config.preview.backdrop === 'black' ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-neutral-700 opacity-60 hover:opacity-100'
              }`}
              title="Latar Hitam Pekat"
            />
            <button
              onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, backdrop: 'white' } }))}
              className={`w-6 h-6 rounded border bg-white transition-all ${
                config.preview.backdrop === 'white' ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-neutral-700 opacity-60 hover:opacity-100'
              }`}
              title="Latar Putih"
            />
            <button
              onClick={() => onConfigChange((prev) => ({ ...prev, preview: { ...prev.preview, backdrop: 'neon_green' } }))}
              className={`w-6 h-6 rounded border bg-[#00FF00] transition-all ${
                config.preview.backdrop === 'neon_green' ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-neutral-700 opacity-60 hover:opacity-100'
              }`}
              title="Latar Hijau Green Screen"
            />
          </div>
        </div>
      </div>

      {/* Main Video Viewport Canvas with Checkerboard */}
      <div 
        ref={containerRef}
        className={`relative w-full aspect-video flex items-center justify-center overflow-hidden select-none ${getBackdropClass()}`}
        style={config.preview.backdrop === 'custom_color' ? { backgroundColor: config.preview.backdropColor } : undefined}
      >
        <canvas
          ref={displayCanvasRef}
          className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md"
        />

        {/* Split Mode Labels & Draggable Divider */}
        {config.preview.viewMode === 'split' && (
          <>
            {/* Left Label: Asli */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-900/80 backdrop-blur border border-neutral-700 rounded text-[11px] font-mono font-medium text-neutral-300 pointer-events-none">
              ASLI (Ada Watermark & Background)
            </div>

            {/* Right Label: Hasil Bersih */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-cyan-950/80 backdrop-blur border border-cyan-500/50 rounded text-[11px] font-mono font-semibold text-cyan-300 pointer-events-none">
              HASIL (Transparan & Watermark Dihapus)
            </div>

            {/* Draggable Divider Handle */}
            <div
              onMouseDown={handleSplitMouseDown}
              style={{ left: `${splitPos}%` }}
              className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize group z-20"
            >
              <div className="w-0.5 h-full bg-cyan-400 group-hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute w-7 h-7 rounded-full bg-cyan-500 text-neutral-950 shadow-lg flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timeline Controls & Scrubber */}
      <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex flex-col gap-2.5">
        {/* Scrubber Bar */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={1 / fps}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Playback Action Strip */}
        <div className="flex items-center justify-between text-xs">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayPause}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onSeek(Math.max(0, currentTime - 1 / fps))}
              className="p-2 bg-neutral-800/60 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
              title="Mundur 1 Frame"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSeek(Math.min(duration, currentTime + 1 / fps))}
              className="p-2 bg-neutral-800/60 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
              title="Maju 1 Frame"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSeek(0)}
              className="p-2 bg-neutral-800/60 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
              title="Ulangi dari Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timecode with tabular numbers */}
            <div className="ml-2 font-mono text-xs tabular-nums text-neutral-300">
              <span className="text-cyan-400 font-semibold">{formatTime(currentTime)}</span>
              <span className="text-neutral-600 mx-1.5">/</span>
              <span className="text-neutral-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Resolution & Frame Metrics */}
          <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono tabular-nums">
            <span>
              Frame: <strong className="text-neutral-200">{currentFrameNumber}</strong> / {totalFrames}
            </span>
            <span className="text-neutral-700" aria-hidden="true">·</span>
            <span>
              Dimensi: <strong className="text-neutral-200">{width}×{height}</strong>
            </span>
            <span className="text-neutral-700" aria-hidden="true">·</span>
            <span>
              FPS: <strong className="text-neutral-200">{fps}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
