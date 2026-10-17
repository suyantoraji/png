import React, { useState, useRef, useEffect } from 'react';
import { 
  Slash, 
  Eraser, 
  Sparkles, 
  Download, 
  Upload, 
  Video, 
  RotateCcw, 
  Wand2, 
  Camera, 
  Layers, 
  FileCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Header } from './components/Header';
import { VideoPlayerViewport } from './components/VideoPlayerViewport';
import { WatermarkPanel } from './components/WatermarkPanel';
import { BackgroundPanel } from './components/BackgroundPanel';
import { EnhancementPanel } from './components/EnhancementPanel';
import { ExportModal } from './components/ExportModal';
import { SamplePickerModal } from './components/SamplePickerModal';
import { GuideModal } from './components/GuideModal';
import { ExportOptions, ExportProgress, ProcessingConfig, VideoMetadata } from './types/video';
import { detectBackgroundColor } from './utils/videoProcessor';
import { SAMPLE_VIDEOS } from './utils/sampleGenerator';
import { exportTransparentAnimation } from './utils/videoExporter';

const INITIAL_CONFIG: ProcessingConfig = {
  bgRemoval: {
    enabled: true,
    mode: 'color_key',
    keyColor: '#FFFFFF', // Initial sample has white studio background
    tolerance: 18,
    smoothness: 12,
    edgeFeather: 2,
    spillSuppression: 40,
    autoDetect: false,
  },
  watermarkRemoval: {
    enabled: true,
    removeDiagonal: true,
    diagonalAngle: -45, // Standard diagonal watermark angle
    diagonalSpacing: 120,
    diagonalBandWidth: 34,
    diagonalIntensity: 75,
    diagonalAutoDetect: true,
    removeCorners: true,
    cornerLocations: ['bottom-right'],
    cornerSize: 18,
    customBoxes: [],
    inpaintMethod: 'telea_fast',
    blendSharpness: 60,
  },
  enhancement: {
    enabled: true,
    sharpen: 45,
    contrast: 22,
    denoise: 16,
    vibrance: 15,
    upscaleFactor: 1,
  },
  preview: {
    viewMode: 'split',
    splitPosition: 50,
    backdrop: 'checkerboard_dark',
    backdropColor: '#1a1a1a',
    zoom: 1,
    showMaskOverlay: false,
  },
};

export default function App() {
  const [config, setConfig] = useState<ProcessingConfig>(INITIAL_CONFIG);

  // Video State
  const [isSample, setIsSample] = useState<boolean>(true);
  const [currentSampleId, setCurrentSampleId] = useState<string>('badge_3d');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<VideoMetadata>({
    name: 'Animasi Badge 3D (Demo)',
    duration: 3,
    width: 640,
    height: 360,
    fps: 30,
    totalFrames: 90,
    aspectRatio: 16 / 9,
    url: '',
  });

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Active Control Tab
  const [activeTab, setActiveTab] = useState<'watermark' | 'background' | 'enhancement'>('watermark');

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Export progress
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentFrame: 0,
    totalFrames: 0,
    statusText: '',
  });

  // Video element reference
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample animation playback loop
  useEffect(() => {
    if (!isSample) return;

    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= metadata.duration) {
            return 0; // loop
          }
          return next;
        });
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isSample, isPlaying, metadata.duration]);

  // Handle uploaded video metadata loading
  const handleVideoLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    const duration = video.duration || 3;
    const fps = 30; // standard estimation

    setMetadata((prev) => ({
      ...prev,
      width,
      height,
      duration,
      fps,
      totalFrames: Math.floor(duration * fps),
      aspectRatio: width / height,
    }));
  };

  const handleVideoTimeUpdate = () => {
    if (isSample || !videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (isSample) {
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Seek time
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (!isSample && videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Switch Sample
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_VIDEOS.find((s) => s.id === sampleId);
    if (!sample) return;

    setIsSample(true);
    setCurrentSampleId(sampleId);
    setMetadata({
      name: sample.title,
      duration: sample.duration,
      width: sample.width,
      height: sample.height,
      fps: sample.fps,
      totalFrames: Math.floor(sample.duration * sample.fps),
      aspectRatio: sample.width / sample.height,
      url: '',
    });

    // Auto set appropriate background color for this sample
    setConfig((prev) => ({
      ...prev,
      bgRemoval: {
        ...prev.bgRemoval,
        keyColor: sample.defaultBgColor,
      },
    }));

    setCurrentTime(0);
    setIsPlaying(true);
  };

  // File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setIsSample(false);

    setMetadata((prev) => ({
      ...prev,
      name: file.name,
      url,
    }));

    setCurrentTime(0);
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  // Auto detect background from current frame
  const handleAutoDetectBg = () => {
    const canvas = document.createElement('canvas');
    canvas.width = metadata.width;
    canvas.height = metadata.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isSample) {
      const sample = SAMPLE_VIDEOS.find((s) => s.id === currentSampleId);
      if (sample) {
        setConfig((prev) => ({
          ...prev,
          bgRemoval: {
            ...prev.bgRemoval,
            keyColor: sample.defaultBgColor,
          },
        }));
        return;
      }
    } else if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, metadata.width, metadata.height);
      const detectedColor = detectBackgroundColor(ctx, metadata.width, metadata.height);
      setConfig((prev) => ({
        ...prev,
        bgRemoval: {
          ...prev.bgRemoval,
          keyColor: detectedColor,
        },
      }));
    }
  };

  // Trigger video export
  const handleStartExport = async (options: ExportOptions) => {
    try {
      const source = isSample
        ? { isSample: true as const, sampleId: currentSampleId }
        : videoRef.current!;

      await exportTransparentAnimation(
        source,
        metadata,
        config,
        options,
        (progress) => {
          setExportProgress(progress);
        }
      );
    } catch (err: any) {
      setExportProgress((prev) => ({
        ...prev,
        isExporting: false,
        statusText: 'Terjadi kesalahan saat mengekspor: ' + (err.message || 'Error tidak diketahui'),
      }));
    }
  };

  // Snapshot frame current
  const handleSnapshotFrame = async () => {
    setIsExportModalOpen(true);
    handleStartExport({
      format: 'single_png',
      fps: metadata.fps,
      scale: config.enhancement.upscaleFactor,
      quality: 1.0,
    });
  };

  // Reset Configuration
  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        hasVideo={true}
      />

      {/* Hidden File Input for video upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/mov,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden HTML Video element for uploaded videos */}
      <video
        ref={videoRef}
        src={videoSrc || undefined}
        playsInline
        muted
        loop
        onLoadedMetadata={handleVideoLoadedMetadata}
        onTimeUpdate={handleVideoTimeUpdate}
        className="hidden"
      />

      {/* Main Studio Canvas & Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Video Viewport & Player (Dominant Visual Anchor) */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Active File Banner / Status */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <span className="font-semibold text-white truncate">{metadata.name}</span>
              <span className="text-neutral-500 font-mono text-[11px] shrink-0">
                ({metadata.width}×{metadata.height} · {metadata.duration.toFixed(1)}s)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSnapshotFrame}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors text-[11px]"
                title="Ambil snapshot 1 frame transparan resolusi tinggi"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Snapshot Frame PNG
              </button>
              <button
                onClick={() => setIsSampleModalOpen(true)}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                Ganti Demo
              </button>
            </div>
          </div>

          {/* Interactive Player Viewport with Split slider */}
          <VideoPlayerViewport
            videoRef={videoRef}
            isSample={isSample}
            sampleId={currentSampleId}
            config={config}
            onConfigChange={setConfig}
            currentTime={currentTime}
            duration={metadata.duration}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            width={metadata.width}
            height={metadata.height}
            fps={metadata.fps}
          />

          {/* Quick Info & Feature Callout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                <Slash className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Auto Watermark Diagonal</span>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Menghapus watermark diagonal berulang dan logo watermark pojok secara otomatis dengan inpainting tekstur halus.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                <Eraser className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Background Video Diam</span>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Menghapus latar belakang solid statis (putih studio, abu-abu, green screen) menghasilkan animasi alpha transparan.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Ekspor Transparan MOV & WEBM</span>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Didukung format WebM (VP9 alpha), MOV QuickTime, dan ZIP PNG Sequence HD tanpa kompresi rugi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Processing Controls & Tabs */}
        <aside className="w-full lg:w-[460px] flex flex-col gap-4 shrink-0">
          {/* Navigation Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('watermark')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'watermark'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Slash className="w-3.5 h-3.5 text-cyan-400" />
              Hapus Watermark
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'background'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5 text-cyan-400" />
              Hapus Background
            </button>
            <button
              onClick={() => setActiveTab('enhancement')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'enhancement'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Kualitas HD
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="flex-1">
            {activeTab === 'watermark' && (
              <WatermarkPanel config={config} onConfigChange={setConfig} />
            )}

            {activeTab === 'background' && (
              <BackgroundPanel
                config={config}
                onConfigChange={setConfig}
                onAutoDetectBg={handleAutoDetectBg}
              />
            )}

            {activeTab === 'enhancement' && (
              <EnhancementPanel config={config} onConfigChange={setConfig} />
            )}
          </div>

          {/* Bottom Primary Action Bar */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Kembalikan semua slider ke pengaturan awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              Ekspor Video Transparan (MOV / WebM)
            </button>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportProgress({
            isExporting: false,
            progress: 0,
            currentFrame: 0,
            totalFrames: 0,
            statusText: '',
          });
        }}
        onStartExport={handleStartExport}
        exportProgress={exportProgress}
        width={metadata.width}
        height={metadata.height}
        fps={metadata.fps}
        duration={metadata.duration}
        config={config}
      />

      <SamplePickerModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
        currentSampleId={currentSampleId}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
