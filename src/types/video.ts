export type BackgroundMode = 'color_key' | 'static_delta' | 'luminance_chroma';

export type InpaintMethod = 'telea_fast' | 'bilateral_patch' | 'temporal_median';

export type ViewMode = 'split' | 'side_by_side' | 'processed' | 'original' | 'mask';

export type BackdropType = 
  | 'checkerboard_dark' 
  | 'checkerboard_light' 
  | 'black' 
  | 'white' 
  | 'neon_green' 
  | 'custom_color';

export interface WatermarkBox {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
  label?: string;
}

export interface ProcessingConfig {
  // Background removal
  bgRemoval: {
    enabled: boolean;
    mode: BackgroundMode;
    keyColor: string; // Hex color e.g. '#ffffff'
    tolerance: number; // 0 - 100
    smoothness: number; // 0 - 100
    edgeFeather: number; // 0 - 10
    spillSuppression: number; // 0 - 100
    autoDetect: boolean;
  };

  // Watermark removal
  watermarkRemoval: {
    enabled: boolean;
    // Diagonal watermark pattern (stock video grids)
    removeDiagonal: boolean;
    diagonalAngle: number; // -60 to 60 degrees, standard is 45 or -45
    diagonalSpacing: number; // 30 - 200 px
    diagonalBandWidth: number; // 10 - 70 px
    diagonalIntensity: number; // 10 - 100%
    diagonalAutoDetect: boolean;
    // Corner watermarks (logos, broadcast bugs)
    removeCorners: boolean;
    cornerLocations: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
    cornerSize: number; // percentage 5 - 25%
    // Custom manual boxes
    customBoxes: WatermarkBox[];
    // Inpainting algorithm
    inpaintMethod: InpaintMethod;
    blendSharpness: number; // 0 - 100
  };

  // HD Enhancement
  enhancement: {
    enabled: boolean;
    sharpen: number; // 0 - 100
    contrast: number; // 0 - 100
    denoise: number; // 0 - 100
    vibrance: number; // 0 - 100
    upscaleFactor: 1 | 1.5 | 2;
  };

  // Viewport & Preview
  preview: {
    viewMode: ViewMode;
    splitPosition: number; // 0 - 100
    backdrop: BackdropType;
    backdropColor: string;
    zoom: number; // 0.5 - 3
    showMaskOverlay: boolean;
  };
}

export interface VideoMetadata {
  name: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  aspectRatio: number;
  url: string;
}

export interface ExportOptions {
  format: 'webm' | 'mov' | 'png_sequence' | 'apng' | 'single_png';
  fps: number;
  scale: 1 | 1.5 | 2;
  quality: number; // 0.1 - 1.0
  startFrame?: number;
  endFrame?: number;
}

export interface ExportProgress {
  isExporting: boolean;
  progress: number; // 0 - 100
  currentFrame: number;
  totalFrames: number;
  statusText: string;
  downloadUrl?: string;
  downloadFilename?: string;
  error?: string;
}
