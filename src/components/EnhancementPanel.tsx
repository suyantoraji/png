import React from 'react';
import { 
  Sparkles, 
  Focus, 
  Contrast, 
  Tv, 
  Maximize, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';
import { ProcessingConfig } from '../types/video';

interface EnhancementPanelProps {
  config: ProcessingConfig;
  onConfigChange: (updater: (prev: ProcessingConfig) => ProcessingConfig) => void;
}

export const EnhancementPanel: React.FC<EnhancementPanelProps> = ({
  config,
  onConfigChange,
}) => {
  const { enhancement } = config;

  const handleToggle = (checked: boolean) => {
    onConfigChange((prev) => ({
      ...prev,
      enhancement: { ...prev.enhancement, enabled: checked },
    }));
  };

  const handleUpscale = (factor: 1 | 1.5 | 2) => {
    onConfigChange((prev) => ({
      ...prev,
      enhancement: { ...prev.enhancement, upscaleFactor: factor },
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Peningkatan Kualitas Video (HD Upscale & Filter)
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Meningkatkan ketajaman mikro, mempertegas tepi animasi, dan mengurangi bising kompresi.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enhancement.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {enhancement.enabled && (
        <div className="flex flex-col gap-5 text-xs">
          {/* Sliders Grid */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3.5">
            {/* Sharpening */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <Focus className="w-3.5 h-3.5 text-cyan-400" />
                  Ketajaman HD (Unsharp Masking):
                </span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {enhancement.sharpen}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={enhancement.sharpen}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    enhancement: { ...prev.enhancement, sharpen: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Mempertajam garis tepi animasi dan kontur tanpa membuat artefak kasar.
              </span>
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <Contrast className="w-3.5 h-3.5 text-cyan-400" />
                  Kontras Adaptif:
                </span>
                <span className="font-mono tabular-nums text-neutral-200 font-semibold">
                  {enhancement.contrast}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={2}
                value={enhancement.contrast}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    enhancement: { ...prev.enhancement, contrast: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Meningkatkan kejernihan optik dan memisahkan subjek dari area transparan.
              </span>
            </div>

            {/* Denoise */}
            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  Pembersih Bising Video (Denoise):
                </span>
                <span className="font-mono tabular-nums text-neutral-200 font-semibold">
                  {enhancement.denoise}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={2}
                value={enhancement.denoise}
                onChange={(e) =>
                  onConfigChange((prev) => ({
                    ...prev,
                    enhancement: { ...prev.enhancement, denoise: parseInt(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Menghaluskan artefak piksel hasil kompresi video sebelumnya.
              </span>
            </div>
          </div>

          {/* Upscale Resolution Options */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-2.5">
            <span className="font-semibold text-neutral-200 flex items-center gap-2">
              <Maximize className="w-3.5 h-3.5 text-cyan-400" />
              Skala Resolusi Ekspor HD
            </span>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { factor: 1, label: '1x Asli', desc: 'Sesuai resolusi video' },
                  { factor: 1.5, label: '1.5x HD', desc: 'Peningkatan sub-piksel' },
                  { factor: 2, label: '2x Ultra HD', desc: 'Super sampling 4K crisp' },
                ] as const
              ).map((option) => {
                const isSelected = enhancement.upscaleFactor === option.factor;
                return (
                  <button
                    key={option.factor}
                    onClick={() => handleUpscale(option.factor)}
                    className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-white text-xs">{option.label}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-neutral-400 leading-tight">
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
