import React from 'react';
import { X, HelpCircle, Layers, Film, FileArchive, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Panduan Transparansi & Format Ekspor
              </h3>
              <p className="text-xs text-neutral-400">
                Cara menggunakan file MOV, WEBM, dan PNG Sequence di aplikasi editing.
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

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Item 1: WEBM */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <Film className="w-4 h-4 text-cyan-400" />
              Format WEBM (VP9 Alpha)
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              WEBM dengan codec VP9 menyimpan saluran transparansi (Alpha channel). Format ini didukung langsung oleh browser modern, OBS Studio (untuk overlay streaming game), PowerPoint terbaru, dan dapat dipasang langsung pada kode HTML video di website tanpa perlu latar belakang.
            </p>
          </div>

          {/* Item 2: MOV */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <Layers className="w-4 h-4 text-cyan-400" />
              Format MOV (QuickTime Alpha / ProRes 4444)
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              MOV adalah standar ekosistem Apple (QuickTime, Final Cut Pro) serta Adobe Premiere Pro. Video berformat MOV transparan dapat langsung ditarik ke timeline video editor di atas klip latar belakang lainnya.
            </p>
          </div>

          {/* Item 3: PNG Sequence ZIP */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <FileArchive className="w-4 h-4 text-cyan-400" />
              ZIP PNG Sequence (100% Zero-Loss Alpha - Rekomendasi Industri)
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Jika Anda ingin hasil paling tajam dan kompatibel di <strong>semua software</strong> (Adobe Premiere Pro, After Effects, DaVinci Resolve, Blender, Cinema4D, Maya, Unity, Unreal Engine):
            </p>
            <ul className="list-disc list-inside text-neutral-400 text-[11px] space-y-1 mt-1 pl-1">
              <li>Ekstrak folder ZIP hasil unduhan.</li>
              <li>Di Premiere/After Effects, pilih <strong>File &gt; Import</strong> lalu klik file pertama <code>frame_0001.png</code>.</li>
              <li>Centang opsi <strong>"Image Sequence"</strong>. Software editing akan otomatis mengenali seluruh frame sebagai satu klip video transparan tunggal tanpa kompresi warna!</li>
            </ul>
          </div>

          {/* Tips Penghapusan Watermark Diagonal */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex flex-col gap-1.5 text-cyan-200">
            <div className="font-bold text-xs flex items-center gap-2 text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Tips Hapus Watermark Diagonal Maksimal
            </div>
            <p className="text-[11px] leading-relaxed text-cyan-200/90">
              Gunakan mode <strong>"Mask Watermark"</strong> di pratinjau untuk melihat apakah garis merah menutupi pola watermark dengan tepat. Sesuaikan <em>Kemiringan Sudut</em> (-45° atau +45°) dan <em>Jarak Kisi</em> agar inpainting bekerja presisi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium text-xs"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
