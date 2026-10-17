import React from 'react';
import { 
  Eraser, 
  Pipette, 
  Wand2, 
  Palette, 
  Sliders, 
  CheckCircle 
} from 'lucide-react';
import { ProcessingConfig } from '../types/video';

interface BackgroundPanelProps {
  config: ProcessingConfig;
  onConfigChange: (updater: (prev: ProcessingConfig) => ProcessingConfig) => void;
  onAutoDetectBg: () => void;
}

const COLOR_PRESETS = [
  { label: 'Putih Studio', color: '#FFFFFF', bg: 'bg-white text-neutral-900' },
  { label: 'Abu-Abu Studio', color: '#E2E8F0', bg: 'bg-slate-200 text-neutral-900' },
  { label: 'Hitam Pekat', color: '#000000', bg: 'bg-black text-white border border-neutral-700' },
  { label: 'Green Screen', color: '#00FF00', bg: 'bg-[#00FF00] text-black font-semibold' },
  { label: 'Biru Chroma', color: '#0044FF', bg: 'bg-[#0044FF] text-white' },
];

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  config,
  onConfigChange,
  onAutoDetectBg,
}) => {
  const { bgRemoval } = config;

  const handleToggle = (checked: boolean) => {
    onConfigChange((prev) => ({
      ...prev,
      bgRemoval: { ...prev.bgRemoval, enabled: checked },
    }));
  };

  const handleSetColor = (color: string) => {
    onConfigChange((prev) => ({
      ...prev,
      bgRemoval: { ...prev.bgRemoval, keyColor: color },
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eraser className="w-4 h-4 text-cyan-400" />
            Penghapus Background Video Diam (Transparansi)
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Menjadikan latar belakang video diam transparan (RGBA Alpha) untuk animasi bersih.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={bgRemoval.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {bgRemoval.enabled && (
        <div className="flex flex-col gap-5 text-xs">
          {/* Section: Background Color Target */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Warna Background Target
              </span>
              <button
                onClick={onAutoDetectBg}
                className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                title="Pindai tepian video untuk mengenali warna latar secara otomatis"
              >
                <Wand2 className="w-3 h-3 text-cyan-400" />
                Deteksi Otomatis
              </button>
            </div>

            {/* Color Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = bgRemoval.keyColor.toUpperCase() === preset.color.toUpperCase();
                return (
                  <button
                    key={preset.color}
                    onClick={() => handleSetColor(preset.color)}
                    className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-600 shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-neutral-300 font-medium text-[11px] truncate">
                        {preset.label}
                      </span>
                    </div>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-800/60">
              <span className="text-neutral-400 text-[11px]">Warna Kustom:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgRemoval.keyColor}
                  onChange={(e) => handleSetColor(e.target.value)}
                  className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bgRemoval.keyColor.toUpperCase()}
                  onChange={(e) => handleSetColor(e.target.value)}
                  className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-200 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Section: Refinement Sliders */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3.5">
            <span className="font-semibold text-neutral-200 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Penyesuaian Ketepatan & Tepi Halus
            </span>

            {/* Tolerance */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span>Toleransi Warna (Threshold):</span>
                <span className="font-mono tabular-nums text-neutral-200 font-semibold">
                  {bgRemoval.tolerance}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={90}
                step={1}
                value={bgRemoval.tolerance}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    bgRemoval: { ...prev.bgRemoval, tolerance: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Tingkatkan jika masih ada sisa warna latar di sekitar subjek.
              </span>
            </div>

            {/* Smoothness */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span>Kehalusan Tepi (Edge Anti-Aliasing):</span>
                <span className="font-mono tabular-nums text-neutral-200 font-semibold">
                  {bgRemoval.smoothness}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={bgRemoval.smoothness}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    bgRemoval: { ...prev.bgRemoval, smoothness: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Menghindari pinggiran bergerigi dan menghasilkan transparansi natural.
              </span>
            </div>

            {/* Spill Suppression */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span>Pembersih Pantulan Latar (Spill Suppression):</span>
                <span className="font-mono tabular-nums text-neutral-200 font-semibold">
                  {bgRemoval.spillSuppression}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={bgRemoval.spillSuppression}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    bgRemoval: { ...prev.bgRemoval, spillSuppression: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Menghilangkan pantulan warna latar pada tepi subjek (anti halo tint).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
