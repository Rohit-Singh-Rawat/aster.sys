"use client";

import { useState } from "react";
import { Logo } from "@/components/logo/logo";
import { cn } from "@/registry/aster/lib/cn";
import { Fader } from "@/registry/aster/ui/fader/fader";

/**
 * Live, draggable OG-image composition prototypes — real <Fader> instances,
 * not a flat Satori redraw. Once a composition earns its keep here, its
 * geometry gets ported to app/og/[slug]/fader-og.tsx as static Satori JSX
 * (Satori can't render Base UI + Motion, so the shipped OG image is always a
 * redraw — but the redraw should copy a design that was actually judged at
 * full fidelity, not judged as a flat mockup from the start).
 */

// DecorFader removed in favor of CascadeCard for scattered layout

interface PatternProps {
  color?: string;
  opacity?: number;
  scale?: number;
}

export function diagonalGrid({
  color = "black",
  opacity = 0.5,
  scale = 0.5,
}: PatternProps) {
  return `data:image/svg+xml;base64,${btoa(`<svg 
xmlns="http://www.w3.org/2000/svg" 
width="${160 * scale}" 
height="${92 * scale}" 
viewBox="0 0 160 92" 
fill="none">
<g opacity="${opacity}">
<path d="M-1410 63.2812L948.89 1425.19" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1370 -6L988.89 1355.91" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1330 -75.2852L1028.89 1286.62" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1290 -144.566L1068.89 1217.34" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1250 -213.848L1108.89 1148.06" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1210 -283.129L1148.89 1078.78" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1170 -352.41L1188.89 1009.5" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1130 -421.695L1228.89 940.211" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1090 -490.977L1268.89 870.929" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1050 -560.258L1308.89 801.648" stroke="${color}" stroke-linejoin="round"/>
<path d="M-1010 -629.539L1348.89 732.367" stroke="${color}" stroke-linejoin="round"/>
<path d="M-970 -698.82L1388.89 663.086" stroke="${color}" stroke-linejoin="round"/>
<path d="M-930 -768.105L1428.89 593.8" stroke="${color}" stroke-linejoin="round"/>
<path d="M-890 -837.387L1468.89 524.519" stroke="${color}" stroke-linejoin="round"/>
<path d="M-850 -906.668L1508.89 455.238" stroke="${color}" stroke-linejoin="round"/>
<path d="M-810 -975.949L1548.89 385.957" stroke="${color}" stroke-linejoin="round"/>
<path d="M-770 -1045.23L1588.89 316.675" stroke="${color}" stroke-linejoin="round"/>
<path d="M-730 -1114.52L1628.89 247.39" stroke="${color}" stroke-linejoin="round"/>
<path d="M-690 -1183.8L1668.89 178.109" stroke="${color}" stroke-linejoin="round"/>
<path d="M-650 -1253.08L1708.89 108.828" stroke="${color}" stroke-linejoin="round"/>
<path d="M-610 -1322.36L1748.89 39.5465" stroke="${color}" stroke-linejoin="round"/>
<path d="M770.89 -1323L-1588 38.9059" stroke="${color}" stroke-linejoin="round"/>
<path d="M810.89 -1253.72L-1548 108.187" stroke="${color}" stroke-linejoin="round"/>
<path d="M850.89 -1184.44L-1508 177.468" stroke="${color}" stroke-linejoin="round"/>
<path d="M890.89 -1115.15L-1468 246.754" stroke="${color}" stroke-linejoin="round"/>
<path d="M930.89 -1045.87L-1428 316.035" stroke="${color}" stroke-linejoin="round"/>
<path d="M970.89 -976.59L-1388 385.316" stroke="${color}" stroke-linejoin="round"/>
<path d="M1010.89 -907.309L-1348 454.597" stroke="${color}" stroke-linejoin="round"/>
<path d="M1050.89 -838.027L-1308 523.879" stroke="${color}" stroke-linejoin="round"/>
<path d="M1090.89 -768.742L-1268 593.164" stroke="${color}" stroke-linejoin="round"/>
<path d="M1130.89 -699.461L-1228 662.445" stroke="${color}" stroke-linejoin="round"/>
<path d="M1170.89 -630.18L-1188 731.726" stroke="${color}" stroke-linejoin="round"/>
<path d="M1210.89 -560.898L-1148 801.007" stroke="${color}" stroke-linejoin="round"/>
<path d="M1250.89 -491.617L-1108 870.289" stroke="${color}" stroke-linejoin="round"/>
<path d="M1290.89 -422.332L-1068 939.574" stroke="${color}" stroke-linejoin="round"/>
<path d="M1330.89 -353.051L-1028 1008.86" stroke="${color}" stroke-linejoin="round"/>
<path d="M1370.89 -283.77L-988 1078.14" stroke="${color}" stroke-linejoin="round"/>
<path d="M1410.89 -214.488L-948 1147.42" stroke="${color}" stroke-linejoin="round"/>
<path d="M1450.89 -145.207L-908 1216.7" stroke="${color}" stroke-linejoin="round"/>
<path d="M1490.89 -75.9219L-868 1285.98" stroke="${color}" stroke-linejoin="round"/>
<path d="M1530.89 -6.64062L-828 1355.27" stroke="${color}" stroke-linejoin="round"/>
<path d="M1570.89 62.6406L-788 1424.55" stroke="${color}" stroke-linejoin="round"/>
</g>
</svg>`)}`;
}

export function Canvas({
  children,
  scattered = false,
  className,
}: {
  children: React.ReactNode;
  scattered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[630px] w-[1200px] shrink-0 overflow-hidden bg-white border-2 border-slate-200",
        className,
      )}
    >
      {scattered && (
        <>
          <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
            <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[70%] rounded-[100%] bg-cyan-200/50 mix-blend-multiply blur-[120px]" />
            <div className="absolute bottom-[0%] -left-[10%] w-[60%] h-[70%] rounded-[100%] bg-teal-300/50 mix-blend-multiply blur-[120px]" />
            <div className="absolute -top-[10%] right-[0%] w-[60%] h-[70%] rounded-[100%] bg-fuchsia-300/40 mix-blend-multiply blur-[120px]" />
            <div className="absolute -bottom-[10%] right-[10%] w-[60%] h-[70%] rounded-[100%] bg-yellow-200/50 mix-blend-multiply blur-[120px]" />
          </div>
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}
      {!scattered && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            display: "flex",
            backgroundImage: `url(${diagonalGrid({ color: "#e2e8f0", opacity: 0.8, scale: 0.5 })})`,
            backgroundRepeat: "repeat",
            WebkitMaskImage:
              "radial-gradient(ellipse at 90% 90%, black 0%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse at 90% 90%, black 0%, transparent 70%)",
          }}
        />
      )}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

const SCATTERED_CARDS: CascadeCardSpec[] = [
  {
    label: "Blend",
    initial: 20,
    unit: "%",
    left: 680,
    top: 100,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(59,130,246,0.1)",
    barColor: "#3b82f6",
  },
  {
    label: "Drive",
    initial: 60,
    unit: "%",
    left: 240,
    top: 220,
    width: 260,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 16,
    fillColor: "rgba(37,99,235,0.15)",
    barColor: "#2563eb",
    cursor: "black",
  },
  {
    label: "Phase",
    initial: 45,
    unit: "°",
    left: 650,
    top: 220,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(168,85,247,0.15)",
    barColor: "#a855f7",
    cursor: "orange",
  },
  {
    label: "Warmth",
    initial: 85,
    unit: "%",
    left: 120,
    top: 350,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(236,72,153,0.15)",
    barColor: "#ec4899",
  },
  {
    label: "Rate",
    initial: 40,
    unit: "Hz",
    left: 420,
    top: 350,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(16,185,129,0.15)",
    barColor: "#10b981",
  },
  {
    label: "Amount",
    initial: 60,
    left: 720,
    top: 350,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(249,115,22,0.15)",
    barColor: "#f97316",
  },
  {
    label: "Glow",
    initial: 75,
    unit: "%",
    left: 280,
    top: 480,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(234,179,8,0.15)",
    barColor: "#eab308",
    cursor: "blue",
  },
  {
    label: "Depth",
    initial: 50,
    unit: "%",
    left: 580,
    top: 480,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(6,182,212,0.15)",
    barColor: "#06b6d4",
  },
  {
    label: "Pan",
    initial: 0,
    unit: "C",
    left: 450,
    top: 600,
    width: 240,
    size: "lg",
    trackBg: "#ffffff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(15,23,42,0.1)",
    barColor: "#0f172a",
  },
];

export function ScatteredOgPreview() {
  return (
    <Canvas scattered>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3.5 rounded-[28px] border border-black/5 bg-white/85 px-18 py-12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] backdrop-blur-sm z-0">
          <span className="font-mono text-[13px] text-slate-500 uppercase tracking-[0.16em]">
            aster · component
          </span>
          <h2 className="font-medium text-[64px] text-slate-900 tracking-tight">
            Fader
          </h2>
        </div>
      </div>
      <div className="absolute inset-0 z-10">
        {SCATTERED_CARDS.map((card) => (
          <CascadeCard key={card.label} {...card} />
        ))}
      </div>
    </Canvas>
  );
}

interface CascadeCardSpec {
  label: string;
  initial: number;
  unit?: string;
  left: number;
  top: number;
  width: number;
  size: "sm" | "md" | "lg";
  trackBg: string;
  trackBorder?: string;
  trackRadius: number;
  fillColor: string;
  fillBorder?: string;
  barColor: string;
  disabled?: boolean;
  cursor?: "black" | "orange" | "blue";
  points?: number[];
}

const CASCADE_CARDS: CascadeCardSpec[] = [
  // Row 1 (y: 40, height: 40)
  {
    label: "Opacity",
    initial: 30,
    unit: "%",
    left: 560,
    top: 40,
    width: 200,
    size: "md",
    trackBg: "#faf5ff",
    trackBorder: "1px solid rgba(0,0,0,0.05)",
    trackRadius: 999,
    fillColor: "rgba(168,85,247,0.15)",
    barColor: "#a855f7",
  },
  {
    label: "Tone",
    initial: 32,
    unit: "%",
    left: 780,
    top: 40,
    width: 200,
    size: "md",
    trackBg: "#eff6ff",
    trackRadius: 999,
    fillColor: "rgba(59,130,246,0.15)",
    barColor: "#3b82f6",
  },
  {
    label: "Phase",
    initial: 50,
    unit: "°",
    left: 1000,
    top: 40,
    width: 220,
    size: "md",
    trackBg: "#fdf2f8",
    trackRadius: 16,
    fillColor: "rgba(236,72,153,0.15)",
    barColor: "#ec4899",
  },
  {
    label: "Rate",
    initial: 40,
    unit: "Hz",
    left: 1240,
    top: 40,
    width: 200,
    size: "md",
    trackBg: "#ecfdf5",
    trackRadius: 999,
    fillColor: "rgba(16,185,129,0.15)",
    barColor: "#10b981",
  },

  // Row 2 (y: 110, height: 48)
  {
    label: "Scale",
    initial: 78,
    left: 600,
    top: 110,
    width: 240,
    size: "lg",
    trackBg: "#eff6ff",
    trackBorder: "1px solid #bfdbfe",
    trackRadius: 16,
    fillColor: "rgba(59,130,246,0.15)",
    barColor: "#3b82f6",
    cursor: "black",
  },
  {
    label: "Radius",
    initial: 30,
    unit: "px",
    left: 860,
    top: 110,
    width: 240,
    size: "lg",
    trackBg: "#fdf2f8",
    trackRadius: 999,
    fillColor: "rgba(236,72,153,0.15)",
    barColor: "#ec4899",
    cursor: "orange",
  },
  {
    label: "Force",
    initial: 90,
    unit: "%",
    left: 1120,
    top: 110,
    width: 260,
    size: "lg",
    trackBg: "#fef2f2",
    trackBorder: "1px solid #fecaca",
    trackRadius: 16,
    fillColor: "rgba(239,68,68,0.15)",
    barColor: "#ef4444",
  },

  // Row 3 (y: 180, height: 32)
  {
    label: "Blur",
    initial: 20,
    unit: "px",
    left: 480,
    top: 180,
    width: 180,
    size: "sm",
    trackBg: "#fef2f2",
    trackRadius: 999,
    fillColor: "transparent",
    barColor: "#ef4444",
    points: [0, 20, 40],
  },
  {
    label: "Spread",
    initial: 45,
    unit: "px",
    left: 680,
    top: 180,
    width: 180,
    size: "sm",
    trackBg: "#ecfdf5",
    trackRadius: 999,
    fillColor: "rgba(16,185,129,0.15)",
    barColor: "#10b981",
  },
  {
    label: "Glow",
    initial: 80,
    unit: "%",
    left: 880,
    top: 180,
    width: 200,
    size: "sm",
    trackBg: "#fff7ed",
    trackRadius: 999,
    fillColor: "rgba(249,115,22,0.15)",
    barColor: "#f97316",
  },
  {
    label: "Width",
    initial: 100,
    unit: "%",
    left: 1100,
    top: 180,
    width: 200,
    size: "sm",
    trackBg: "#faf5ff",
    trackRadius: 12,
    fillColor: "rgba(168,85,247,0.15)",
    barColor: "#a855f7",
  },
  {
    label: "Height",
    initial: 50,
    unit: "%",
    left: 1320,
    top: 180,
    width: 180,
    size: "sm",
    trackBg: "#ecfeff",
    trackRadius: 999,
    fillColor: "rgba(6,182,212,0.15)",
    barColor: "#06b6d4",
  },

  // Row 4 (y: 240, height: 40)
  {
    label: "Mix",
    initial: 50,
    unit: "%",
    left: 560,
    top: 240,
    width: 220,
    size: "md",
    trackBg: "#fefce8",
    trackRadius: 999,
    fillColor: "rgba(234,179,8,0.15)",
    barColor: "#eab308",
  },
  {
    label: "Depth",
    initial: 60,
    unit: "%",
    left: 800,
    top: 240,
    width: 220,
    size: "md",
    trackBg: "#ecfeff",
    trackRadius: 999,
    fillColor: "transparent",
    barColor: "#06b6d4",
    points: [0, 50, 100],
  },
  {
    label: "Pan",
    initial: 0,
    unit: "C",
    left: 1040,
    top: 240,
    width: 220,
    size: "md",
    trackBg: "#f8fafc",
    trackRadius: 16,
    fillColor: "transparent",
    barColor: "#64748b",
    points: [-100, 0, 100],
  },
  {
    label: "Pitch",
    initial: 2,
    unit: "+",
    left: 1280,
    top: 240,
    width: 200,
    size: "md",
    trackBg: "#fdf2f8",
    trackRadius: 999,
    fillColor: "rgba(236,72,153,0.15)",
    barColor: "#ec4899",
  },

  // Row 5 (y: 310, height: 48)
  {
    label: "Fade",
    initial: 45,
    unit: "%",
    left: 700,
    top: 310,
    width: 240,
    size: "lg",
    trackBg: "#f8fafc",
    trackBorder: "1px solid rgba(100,116,139,0.15)",
    trackRadius: 999,
    fillColor: "transparent",
    barColor: "#64748b",
    disabled: true,
    cursor: "blue",
  },
  {
    label: "Drive",
    initial: 85,
    unit: "%",
    left: 960,
    top: 310,
    width: 260,
    size: "lg",
    trackBg: "#fff7ed",
    trackBorder: "1px solid #ffedd5",
    trackRadius: 16,
    fillColor: "rgba(249,115,22,0.15)",
    barColor: "#f97316",
  },
  {
    label: "Delay",
    initial: 40,
    unit: "ms",
    left: 1240,
    top: 310,
    width: 240,
    size: "lg",
    trackBg: "#eff6ff",
    trackRadius: 999,
    fillColor: "rgba(59,130,246,0.15)",
    barColor: "#3b82f6",
  },

  // Row 6 (y: 380, height: 40)
  {
    label: "Space",
    initial: 30,
    unit: "%",
    left: 640,
    top: 380,
    width: 220,
    size: "md",
    trackBg: "#eff6ff",
    trackRadius: 16,
    fillColor: "rgba(59,130,246,0.15)",
    barColor: "#3b82f6",
  },
  {
    label: "Warmth",
    initial: 70,
    unit: "%",
    left: 880,
    top: 380,
    width: 220,
    size: "md",
    trackBg: "#fff7ed",
    trackRadius: 999,
    fillColor: "transparent",
    barColor: "#f97316",
    points: [0, 25, 50, 75, 100],
  },
  {
    label: "Air",
    initial: 55,
    unit: "%",
    left: 1120,
    top: 380,
    width: 220,
    size: "md",
    trackBg: "#ecfdf5",
    trackRadius: 999,
    fillColor: "rgba(16,185,129,0.15)",
    barColor: "#10b981",
  },

  // Row 7 (y: 450, height: 32)
  {
    label: "Bite",
    initial: 15,
    unit: "%",
    left: 820,
    top: 450,
    width: 200,
    size: "sm",
    trackBg: "#fef2f2",
    trackRadius: 999,
    fillColor: "rgba(239,68,68,0.15)",
    barColor: "#ef4444",
  },
  {
    label: "Shine",
    initial: 85,
    unit: "%",
    left: 1040,
    top: 450,
    width: 200,
    size: "sm",
    trackBg: "#fefce8",
    trackRadius: 12,
    fillColor: "rgba(234,179,8,0.15)",
    barColor: "#eab308",
  },
  {
    label: "Grit",
    initial: 45,
    unit: "%",
    left: 1260,
    top: 450,
    width: 200,
    size: "sm",
    trackBg: "#f8fafc",
    trackRadius: 999,
    fillColor: "transparent",
    barColor: "#64748b",
    points: [0, 50, 100],
  },

  // Row 8 (y: 510, height: 48)
  {
    label: "Amount",
    initial: 100,
    left: 940,
    top: 510,
    width: 240,
    size: "lg",
    trackBg: "#faf5ff",
    trackRadius: 999,
    fillColor: "rgba(168,85,247,0.15)",
    barColor: "#a855f7",
  },
  {
    label: "Size",
    initial: 75,
    unit: "L",
    left: 1200,
    top: 510,
    width: 240,
    size: "lg",
    trackBg: "#ecfeff",
    trackRadius: 16,
    fillColor: "rgba(6,182,212,0.15)",
    barColor: "#06b6d4",
  },

  // Row 9 (y: 580, height: 40)
  {
    label: "Speed",
    initial: 90,
    unit: "ms",
    left: 1080,
    top: 580,
    width: 240,
    size: "md",
    trackBg: "#fdf2f8",
    trackRadius: 999,
    fillColor: "rgba(236,72,153,0.15)",
    barColor: "#ec4899",
  },
];

function CursorIcon({
  color = "#0f172a",
  x,
  y,
}: {
  color?: string;
  x: number;
  y: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute drop-shadow-md z-10"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <path
        d="M7.921 2.3C6.936 1.532 5.5 2.234 5.5 3.482v17.009c0 1.422 1.795 2.046 2.677.93l4.19-5.3a1.65 1.65 0 0 1 1.295-.626h6.852c1.428 0 2.049-1.808.921-2.684z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const faderOverrideClass = `
  [&_.squircle]:![background-color:var(--track-bg)]
  [&_.squircle]:![border:var(--track-border)]
  [&_.squircle]:![border-radius:var(--track-radius)]
  [&_.rounded-r-md]:![background-color:var(--fill-bg)]
  [&_.rounded-r-md]:![border:var(--fill-border)]
  [&_.w-1]:![background-color:var(--bar-bg)]
`;

function CascadeCard({
  label,
  initial,
  unit,
  left,
  top,
  width,
  size,
  trackBg,
  trackBorder,
  trackRadius,
  fillColor,
  fillBorder,
  barColor,
  disabled,
  cursor,
  points,
}: CascadeCardSpec) {
  const [value, setValue] = useState(initial);
  return (
    <div
      className="absolute shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06),0_2px_4px_-2px_rgba(0,0,0,0.02)]"
      style={
        {
          left,
          top,
          width,
          borderRadius: trackRadius === 999 ? "9999px" : `${trackRadius}px`,
          "--track-bg": trackBg,
          "--track-border": trackBorder || "none",
          "--track-radius": trackRadius === 999 ? "9999px" : `${trackRadius}px`,
          "--fill-bg": fillColor,
          "--fill-border": fillBorder || "none",
          "--bar-bg": barColor,
        } as React.CSSProperties
      }
    >
      <Fader
        label={label}
        value={value}
        onValueChange={setValue}
        unit={unit}
        size={size}
        disabled={disabled}
        points={points}
        className={cn(faderOverrideClass, disabled && "opacity-50")}
      />
      {cursor && (
        <CursorIcon
          color={
            cursor === "black"
              ? "#0f172a"
              : cursor === "orange"
                ? "#f97316"
                : "#6366f1"
          }
          x={width - 16}
          y={20}
        />
      )}
    </div>
  );
}

export function CascadeOgPreview() {
  return (
    <Canvas>
      <div className="absolute top-[140px] left-[80px] flex w-[480px] flex-col">
        <div className="mb-8 flex items-center gap-4">
          <Logo className="h-9 w-auto" />
        </div>
        <h2 className="mb-6 font-sans font-medium text-[92px] text-black leading-none tracking-tight">
          Fader
        </h2>
        <p className="font-sans text-[28px] text-slate-500/70 leading-[1.4]">
          A parameter control whose track doubles as the value display.
        </p>
      </div>
      {CASCADE_CARDS.map((card) => (
        <CascadeCard key={card.label} {...card} />
      ))}
    </Canvas>
  );
}
