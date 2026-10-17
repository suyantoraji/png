import React from 'react';
import { X, Video, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_VIDEOS, SampleVideoOption } from '../utils/sampleGenerator';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sampleId: string) => void;
  currentSampleId: string;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  currentSampleId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pilih Sampel Animasi Demo
              </h3>
              <p className="text-xs text-neutral-400">
                Uji coba penghapusan background dan watermark diagonal langsung dengan 1 klik.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Samples */}
        <div className="p-6 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
          {SAMPLE_VIDEOS.map((sample) => {
            const isSelected = sample.id === currentSampleId;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-left flex items-start justify-between gap-4 transition-all ${
                  isSelected
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{sample.title}</span>
                    {isSelected && (
                      <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                        (Aktif)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {sample.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono mt-1">
                    <span>Durasi: {sample.duration}s</span>
                    <span>·</span>
                    <span>{sample.width}×{sample.height}</span>
                    <span>·</span>
                    <span>Latar: {sample.defaultBgColor}</span>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white">
                      <Play className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Anda juga dapat mengunggah video sendiri kapan saja (.mp4, .webm, .mov).</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
