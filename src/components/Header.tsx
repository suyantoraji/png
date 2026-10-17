import React from 'react';
import { Sparkles, Upload, Download, Video, Info } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onOpenSampleModal: () => void;
  onOpenExportModal: () => void;
  onOpenGuideModal: () => void;
  hasVideo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onOpenSampleModal,
  onOpenExportModal,
  onOpenGuideModal,
  hasVideo,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
          K
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            KromaClear <span className="text-cyan-400 font-normal">Studio</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-mono tracking-tight -mt-0.5">
            Transparent Video & Watermark Remover
          </span>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line text navigation / action links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
        <button
          onClick={onOpenSampleModal}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5 text-neutral-400" />
          Pilih Video Demo
        </button>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <button
          onClick={onUploadClick}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-400" />
          Unggah Video Sendiri
        </button>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <button
          onClick={onOpenGuideModal}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          Panduan MOV & WebM
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExportModal}
          disabled={!hasVideo}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Ekspor Animasi Transparan
        </button>
      </div>
    </header>
  );
};
