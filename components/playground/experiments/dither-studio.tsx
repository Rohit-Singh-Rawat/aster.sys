"use client";

import { Upload04Icon } from "hugeicons-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Fader } from "@/registry/aster/ui/fader/fader";
import { useTheme } from "../theme-context";

// Precomputed 4x4 Bayer Matrix (0-255 scale) for fast integer lookups
const BAYER_PRECOMPUTED = [
  [0, 127, 31, 159],
  [191, 63, 223, 95],
  [47, 175, 15, 143],
  [239, 111, 207, 79],
];

// Hoisted stable arrays to prevent React cascade renders
const PIXEL_SCALE_POINTS = [1, 2, 4, 8];

/**
 * Custom hook to manage image loading, drag-and-drop, and file reading.
 */
function useImageLoader() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadId, setImageLoadId] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastScaleRef = useRef<number>(-1);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      lastScaleRef.current = -1; // Invalidate pixel cache
      setImageLoaded(true);
      setImageLoadId((id) => id + 1);
    };
  }, [imageSrc]);

  return {
    imageSrc,
    imageLoaded,
    imageLoadId,
    imgRef,
    fileInputRef,
    isDragging,
    lastScaleRef,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Custom hook to manage the highly optimized canvas dithering engine.
 */
function useDitherEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imgRef: React.RefObject<HTMLImageElement | null>,
  imageLoaded: boolean,
  imageLoadId: number,
  lastScaleRef: React.MutableRefObject<number>,
  threshold: number,
  contrast: number,
  pixelSize: number,
) {
  const deferredThreshold = useDeferredValue(threshold);
  const deferredContrast = useDeferredValue(contrast);
  const deferredPixelSize = useDeferredValue(pixelSize);

  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceDataRef = useRef<Uint8ClampedArray | null>(null);
  const currentRunRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: imageLoadId isn't read in the effect body, but it's kept as an explicit re-render trigger decoupled from the imageLoaded boolean so a future change to the load state machine can't silently make image swaps stop redrawing
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const H = 800;
    const imgRatio = imgRef.current.width / imgRef.current.height;
    const W = Math.floor(H * imgRatio);

    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    const scale = Math.max(1, Math.floor(deferredPixelSize));
    const renderW = Math.floor(W / scale);
    const renderH = Math.floor(H / scale);

    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement("canvas");
    }
    const tempCanvas = tempCanvasRef.current;
    const tCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tCtx) return;

    if (lastScaleRef.current !== scale || !sourceDataRef.current) {
      tempCanvas.width = renderW;
      tempCanvas.height = renderH;
      tCtx.drawImage(imgRef.current, 0, 0, renderW, renderH);
      const initialImgData = tCtx.getImageData(0, 0, renderW, renderH);
      sourceDataRef.current = new Uint8ClampedArray(initialImgData.data);
      lastScaleRef.current = scale;
    }

    const sourceData = sourceDataRef.current;
    const imgData = new ImageData(renderW, renderH);
    const data = imgData.data;

    const c = (deferredContrast - 50) * 5.1;
    const factor = (259 * (c + 255)) / (255 * (259 - c));
    const tBias = (deferredThreshold - 50) * -2.55;

    const runId = ++currentRunRef.current;
    let currentY = 0;
    const CHUNK_SIZE = 40; // rows per frame

    function processChunk() {
      if (currentRunRef.current !== runId) return;
      if (!ctx || !tCtx) return;

      const maxY = Math.min(renderH, currentY + CHUNK_SIZE);
      for (let y = currentY; y < maxY; y++) {
        for (let x = 0; x < renderW; x++) {
          const i = (y * renderW + x) * 4;

          let r = sourceData[i];
          let g = sourceData[i + 1];
          let b = sourceData[i + 2];

          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;

          let lum = 0.299 * r + 0.587 * g + 0.114 * b;
          lum += tBias;

          const bayerVal = BAYER_PRECOMPUTED[y % 4][x % 4];
          const finalVal = lum > bayerVal ? 255 : 0;

          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
          data[i + 3] = 255;
        }
      }

      currentY = maxY;
      if (currentY < renderH) {
        requestAnimationFrame(processChunk);
      } else {
        tCtx.putImageData(imgData, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, renderW, renderH, 0, 0, W, H);
      }
    }

    processChunk();
  }, [
    imageLoaded,
    imageLoadId,
    deferredThreshold,
    deferredContrast,
    deferredPixelSize,
    imgRef,
    canvasRef,
    lastScaleRef,
  ]);
}

export function DitherStudio() {
  const [threshold, setThreshold] = useState(50);
  const [contrast, setContrast] = useState(55);
  const [pixelSize, setPixelSize] = useState(2);

  const { accent, tone, size } = useTheme();

  const {
    imageSrc,
    imageLoaded,
    imageLoadId,
    imgRef,
    fileInputRef,
    isDragging,
    lastScaleRef,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useImageLoader();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useDitherEngine(
    canvasRef,
    imgRef,
    imageLoaded,
    imageLoadId,
    lastScaleRef,
    threshold,
    contrast,
    pixelSize,
  );

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the upload click
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "dither-export.png";
    a.click();
  };

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white p-4 transition-colors duration-500 dark:border-white/20 dark:bg-zinc-950"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* 1. Photo Frame / Upload Area - Top */}
      <input
        id="image-upload"
        type="file"
        ref={fileInputRef}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        accept="image/*"
        onChange={(e) => {
          handleImageUpload(e);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label="Upload an image to dither"
        className={`group relative mb-8 flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors focus-ring dark:bg-white/5 dark:hover:bg-white/10 ${isDragging ? "border-foreground bg-black/15 dark:border-white dark:bg-white/20" : "border-black/20 bg-black/5 hover:bg-black/10 dark:border-white/20"}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!imageSrc ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform group-hover:scale-105 group-active:scale-95">
            <Upload04Icon size={24} />
            <span className="font-medium tracking-tight text-sm">
              Upload Image to Dither
            </span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium tracking-widest text-muted-foreground animate-pulse">
                PROCESSING...
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-contain mix-blend-darken rounded-2xl dark:mix-blend-screen"
            />
            {/* Hover overlay to let users know they can click to swap the image */}
            <div className="absolute inset-0 flex items-center justify-center gap-4 rounded-2xl bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <span className="text-sm font-medium tracking-tight text-white">
                Click or Drag to Swap
              </span>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95"
              >
                Export PNG
              </button>
            </div>
          </>
        )}
      </button>

      {/* 2. Photo Studio Controls - Bottom Grid */}
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 px-4 pb-4 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Fader
            label="Dither Threshold"
            value={threshold}
            onValueChange={setThreshold}
            min={0}
            max={100}
            unit="%"
            bordered
            disabled={!imageLoaded}
            tone={tone}
            size={size}
          />
          <Fader
            label="Contrast"
            value={contrast}
            onValueChange={setContrast}
            min={0}
            max={100}
            unit="%"
            bordered
            disabled={!imageLoaded}
            tone={tone}
            size={size}
          />
        </div>

        <div className="flex flex-col gap-8">
          <Fader
            label="Pixel Scale"
            value={pixelSize}
            onValueChange={setPixelSize}
            min={1}
            max={8}
            unit="x"
            points={PIXEL_SCALE_POINTS}
            bordered
            disabled={!imageLoaded}
            tone={tone}
            size={size}
          />
          <Fader
            label="Saturation (Disabled)"
            value={100}
            onValueChange={() => {}}
            min={0}
            max={200}
            unit="%"
            disabled
            bordered
            tone={tone}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}
