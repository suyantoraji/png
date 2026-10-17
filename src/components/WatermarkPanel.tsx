import React from 'react';
import { 
  Sparkles, 
  Slash, 
  Square, 
  Plus, 
  Trash2, 
  Compass, 
  Sliders, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { ProcessingConfig, WatermarkBox } from '../types/video';

interface WatermarkPanelProps {
  config: ProcessingConfig;
  onConfigChange: (updater: (prev: ProcessingConfig) => ProcessingConfig) => void;
}

export const WatermarkPanel: React.FC<WatermarkPanelProps> = ({ config, onConfigChange }) => {
  const { watermarkRemoval } = config;

  const handleToggleWatermark = (checked: boolean) => {
    onConfigChange((prev) => ({
      ...prev,
      watermarkRemoval: { ...prev.watermarkRemoval, enabled: checked },
    }));
  };

  const handleToggleDiagonal = (checked: boolean) => {
    onConfigChange((prev) => ({
      ...prev,
      watermarkRemoval: { ...prev.watermarkRemoval, removeDiagonal: checked },
    }));
  };

  const handleAngleChange = (angle: number) => {
    onConfigChange((prev) => ({
      ...prev,
      watermarkRemoval: { ...prev.watermarkRemoval, diagonalAngle: angle },
    }));
  };

  const handleToggleCorner = (loc: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    onConfigChange((prev) => {
      const current = prev.watermarkRemoval.cornerLocations;
      const next = current.includes(loc)
        ? current.filter((l) => l !== loc)
        : [...current, loc];
      return {
        ...prev,
        watermarkRemoval: {
          ...prev.watermarkRemoval,
          cornerLocations: next,
          removeCorners: next.length > 0,
        },
      };
    });
  };

  const handleAddCustomBox = () => {
    const newBox: WatermarkBox = {
      id: `box_${Date.now()}`,
      x: 35,
      y: 35,
      width: 30,
      height: 15,
      label: `Area Watermark ${watermarkRemoval.customBoxes.length + 1}`,
    };

    onConfigChange((prev) => ({
      ...prev,
      watermarkRemoval: {
        ...prev.watermarkRemoval,
        customBoxes: [...prev.watermarkRemoval.customBoxes, newBox],
      },
    }));
  };

  const handleRemoveCustomBox = (id: string) => {
    onConfigChange((prev) => ({
      ...prev,
      watermarkRemoval: {
        ...prev.watermarkRemoval,
        customBoxes: prev.watermarkRemoval.customBoxes.filter((b) => b.id !== id),
      },
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
      {/* Header & Master Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Slash className="w-4 h-4 text-cyan-400" />
            Penghapus Watermark & Watermark Diagonal
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Menghapus teks berulang diagonal dan logo tanpa merusak subjek animasi.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={watermarkRemoval.enabled}
            onChange={(e) => handleToggleWatermark(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {watermarkRemoval.enabled && (
        <div className="flex flex-col gap-5 text-xs">
          {/* Section 1: Watermark Diagonal Otomatis */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Watermark Diagonal (Pola Kisi Berulang)
              </span>
              <input
                type="checkbox"
                checked={watermarkRemoval.removeDiagonal}
                onChange={(e) => handleToggleDiagonal(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-neutral-800 border-neutral-700 focus:ring-cyan-500"
              />
            </div>

            {watermarkRemoval.removeDiagonal && (
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/60">
                {/* Angle Preset & Slider */}
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span>Kemiringan Sudut Diagonal:</span>
                    <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                      {watermarkRemoval.diagonalAngle}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => handleAngleChange(-45)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        watermarkRemoval.diagonalAngle === -45
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      -45° (Umum)
                    </button>
                    <button
                      onClick={() => handleAngleChange(45)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        watermarkRemoval.diagonalAngle === 45
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      +45° (Terbalik)
                    </button>
                    <button
                      onClick={() => handleAngleChange(0)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        watermarkRemoval.diagonalAngle === 0
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      0° (Horizontal)
                    </button>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    step={1}
                    value={watermarkRemoval.diagonalAngle}
                    onChange={(e) => handleAngleChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Spacing Slider */}
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span>Jarak Garis Kisi Watermark:</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      {watermarkRemoval.diagonalSpacing} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={5}
                    value={watermarkRemoval.diagonalSpacing}
                    onChange={(e) =>
                      onConfigChange((prev) => ({
                        ...prev,
                        watermarkRemoval: {
                          ...prev.watermarkRemoval,
                          diagonalSpacing: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Band Width Slider */}
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span>Lebar Jalur Watermark:</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      {watermarkRemoval.diagonalBandWidth} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={70}
                    step={2}
                    value={watermarkRemoval.diagonalBandWidth}
                    onChange={(e) =>
                      onConfigChange((prev) => ({
                        ...prev,
                        watermarkRemoval: {
                          ...prev.watermarkRemoval,
                          diagonalBandWidth: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Inpainting Healing Intensity */}
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span>Kekuatan Rekonstruksi (Inpainting):</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      {watermarkRemoval.diagonalIntensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={watermarkRemoval.diagonalIntensity}
                    onChange={(e) =>
                      onConfigChange((prev) => ({
                        ...prev,
                        watermarkRemoval: {
                          ...prev.watermarkRemoval,
                          diagonalIntensity: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Watermark Sudut / Pojok (Corner Logos) */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3">
            <span className="font-semibold text-neutral-200 flex items-center gap-2">
              <Square className="w-3.5 h-3.5 text-cyan-400" />
              Watermark Logo Pojok
            </span>

            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'top-left', label: 'Kiri Atas' },
                  { id: 'top-right', label: 'Kanan Atas' },
                  { id: 'bottom-left', label: 'Kiri Bawah' },
                  { id: 'bottom-right', label: 'Kanan Bawah (Umum)' },
                ] as const
              ).map((corner) => {
                const active = watermarkRemoval.cornerLocations.includes(corner.id);
                return (
                  <button
                    key={corner.id}
                    onClick={() => handleToggleCorner(corner.id)}
                    className={`px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 font-medium'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>{corner.label}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {watermarkRemoval.cornerLocations.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span>Ukuran Radius Pojok:</span>
                  <span className="font-mono tabular-nums text-neutral-200">
                    {watermarkRemoval.cornerSize}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={watermarkRemoval.cornerSize}
                  onChange={(e) =>
                    onConfigChange((prev) => ({
                      ...prev,
                      watermarkRemoval: {
                        ...prev.watermarkRemoval,
                        cornerSize: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Section 3: Custom Manual Watermark Boxes */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Area Watermark Tambahan
              </span>
              <button
                onClick={handleAddCustomBox}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1 transition-colors text-[11px]"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                Tambah Area
              </button>
            </div>

            {watermarkRemoval.customBoxes.length === 0 ? (
              <p className="text-[11px] text-neutral-500 italic">
                Belum ada area manual. Gunakan tombol di atas jika ada logo atau teks spesifik yang ingin dihilangkan.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {watermarkRemoval.customBoxes.map((box, index) => (
                  <div
                    key={box.id}
                    className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-medium text-neutral-300">
                        Area #{index + 1}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({box.width}% × {box.height}%)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomBox(box.id)}
                      className="p-1 hover:text-red-400 text-neutral-500 transition-colors"
                      title="Hapus area ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
