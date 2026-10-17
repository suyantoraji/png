import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Film, 
  Layers, 
  FileArchive, 
  Image, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Info
} from 'lucide-react';
import { ExportOptions, ExportProgress, ProcessingConfig } from '../types/video';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (options: ExportOptions) => void;
  exportProgress: ExportProgress;
  width: number;
  height: number;
  fps: number;
  duration: number;
  config: ProcessingConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onStartExport,
  exportProgress,
  width,
  height,
  fps,
  duration,
  config,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('webm');
  const [selectedScale, setSelectedScale] = useState<1 | 1.5 | 2>(config.enhancement.upscaleFactor || 1);
  const [selectedFps, setSelectedFps] = useState<number>(fps || 30);

  if (!isOpen) return null;

  const outWidth = Math.round(width * selectedScale);
  const outHeight = Math.round(height * selectedScale);
  const totalFrames = Math.max(1, Math.floor(duration * selectedFps));

  const handleExport = () => {
    onStartExport({
      format: selectedFormat,
      scale: selectedScale,
      fps: selectedFps,
      quality: 1.0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ekspor Animasi Video Transparan
              </h3>
              <p className="text-xs text-neutral-400">
                Pilih format video atau deretan frame dengan saluran transparansi (RGBA Alpha).
              </p>
            </div>
          </div>
          {!exportProgress.isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Format Selection */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-neutral-200">Pilih Format Transparansi:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WEBM */}
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setSelectedFormat('webm')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === 'webm'
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">WEBM (Alpha Transparan)</span>
                  </div>
                  {selectedFormat === 'webm' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                  Format video modern dengan transparansi VP9/VP8. Sangat ringan, didukung browser, OBS, dan website.
                </p>
              </button>

              {/* MOV */}
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setSelectedFormat('mov')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === 'mov'
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">MOV (QuickTime Transparan)</span>
                  </div>
                  {selectedFormat === 'mov' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                  Format QuickTime video transparansi untuk macOS, Final Cut Pro, dan Adobe Premiere Pro.
                </p>
              </button>

              {/* PNG SEQUENCE (ZIP) */}
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setSelectedFormat('png_sequence')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === 'png_sequence'
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">ZIP PNG Sequence HD</span>
                  </div>
                  {selectedFormat === 'png_sequence' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                  Standar industri broadcast! Kumpulan frame PNG 32-bit tanpa kompresi rugi (Lossless Alpha) untuk Premiere Pro, After Effects, DaVinci.
                </p>
              </button>

              {/* SINGLE PNG FRAME */}
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setSelectedFormat('single_png')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === 'single_png'
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">Frame PNG Transparan</span>
                  </div>
                  {selectedFormat === 'single_png' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                  Ekspor 1 foto snapshot frame saat ini dengan background transparan dan watermark yang telah dibersihkan.
                </p>
              </button>
            </div>
          </div>

          {/* Resolution & FPS Settings */}
          {selectedFormat !== 'single_png' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl">
              <div>
                <span className="text-neutral-400 block mb-1">Skala Resolusi Output:</span>
                <div className="flex items-center gap-1.5">
                  {([1, 1.5, 2] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      disabled={exportProgress.isExporting}
                      onClick={() => setSelectedScale(sc)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center border transition-colors ${
                        selectedScale === sc
                          ? 'bg-neutral-800 border-cyan-400 text-cyan-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {sc}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1">Kecepatan Frame:</span>
                <div className="flex items-center gap-1.5">
                  {[24, 30, 60].map((f) => (
                    <button
                      key={f}
                      type="button"
                      disabled={exportProgress.isExporting}
                      onClick={() => setSelectedFps(f)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center border transition-colors ${
                        selectedFps === f
                          ? 'bg-neutral-800 border-cyan-400 text-cyan-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {f} fps
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between font-mono text-[11px] tabular-nums text-neutral-300">
            <span>Resolusi Akhir: <strong className="text-white">{outWidth}×{outHeight} px</strong></span>
            <span className="text-neutral-700">·</span>
            <span>Durasi: <strong className="text-white">{duration.toFixed(1)}s</strong></span>
            <span className="text-neutral-700">·</span>
            <span>Total: <strong className="text-cyan-400">{selectedFormat === 'single_png' ? 1 : totalFrames} frame</strong></span>
          </div>

          {/* Export Progress UI */}
          {exportProgress.isExporting && (
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {exportProgress.statusText}
                </span>
                <span className="font-mono tabular-nums text-cyan-400 font-bold">
                  {exportProgress.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono tabular-nums">
                <span>Memproses frame: {exportProgress.currentFrame} / {exportProgress.totalFrames}</span>
                <span>Resolusi: {outWidth}×{outHeight}</span>
              </div>
            </div>
          )}

          {/* Success Download Ready */}
          {exportProgress.downloadUrl && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Render Selesai! File transparan HD siap diunduh.
              </div>
              <a
                href={exportProgress.downloadUrl}
                download={exportProgress.downloadFilename}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold rounded-lg text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-xs"
              >
                <Download className="w-4 h-4" />
                Unduh {exportProgress.downloadFilename}
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/60">
          <button
            type="button"
            disabled={exportProgress.isExporting}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white transition-colors disabled:opacity-40"
          >
            Tutup
          </button>
          {!exportProgress.downloadUrl && (
            <button
              type="button"
              disabled={exportProgress.isExporting}
              onClick={handleExport}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all text-xs"
            >
              {exportProgress.isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sedang Merender...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Mulai Ekspor Sekarang
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
