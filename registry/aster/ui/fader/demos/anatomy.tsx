"use client";

import { createContext, useContext, useState } from "react";
import {
  type BlueprintTheme,
  blueprintTheme,
  DimH,
  DimV,
  PadGuide,
  Selection,
} from "@/components/blueprints/parts";

// --- Context & State ---
type HoverState = string | null;

interface AnatomyContextType {
  hovered: HoverState;
  setHovered: (id: HoverState) => void;
}

const AnatomyContext = createContext<AnatomyContextType | null>(null);

function useAnatomy() {
  const context = useContext(AnatomyContext);
  if (!context)
    throw new Error("useAnatomy must be used within AnatomyProvider");
  return context;
}

// --- Hooks ---
function useSpotlight(
  partIds: string | string[],
  options?: { isInteraction?: boolean; defaultOpacity?: number },
) {
  const { hovered } = useAnatomy();
  const ids = Array.isArray(partIds) ? partIds : [partIds];

  const isHovered = hovered !== null && ids.includes(hovered);
  const isOthersHovered = hovered !== null && !isHovered;

  const defaultOp = options?.defaultOpacity ?? 60;
  const opacityClass = options?.isInteraction
    ? isHovered
      ? "opacity-100"
      : isOthersHovered
        ? "opacity-20"
        : "opacity-40"
    : isHovered
      ? "opacity-100"
      : isOthersHovered
        ? "opacity-30"
        : `opacity-${defaultOp}`;

  return {
    className: `transition-all duration-200 ease-out ${opacityClass}`,
    style: {
      filter: isOthersHovered ? "url(#spotlight-blur)" : "none",
    },
  };
}

function useSpotlightBadge(partId: string) {
  const { hovered } = useAnatomy();
  const isHovered = hovered === partId;
  const isOthersHovered = hovered !== null && !isHovered;

  return {
    isHovered,
    wrapperClassName: `transition-all duration-200 ease-out ${isOthersHovered ? "opacity-30" : "opacity-100"}`,
    wrapperStyle: { filter: isOthersHovered ? "blur(1px)" : "none" },
  };
}

// --- Components ---
function Badge({
  part,
  label,
  isAccent = false,
  className,
}: {
  part: string;
  label: string;
  isAccent?: boolean;
  className?: string;
}) {
  const { setHovered } = useAnatomy();
  const { isHovered, wrapperClassName, wrapperStyle } = useSpotlightBadge(part);

  return (
    <div
      className={`flex h-full w-full pointer-events-none ${wrapperClassName} ${className}`}
      style={wrapperStyle}
    >
      <button
        type="button"
        onMouseEnter={() => setHovered(part)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(part)}
        onBlur={() => setHovered(null)}
        style={{ pointerEvents: "all" }}
        className={`rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap cursor-pointer transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isHovered
            ? "bg-foreground text-background border-foreground shadow-sm"
            : isAccent
              ? "bg-accent/10 text-accent border-accent/20"
              : "bg-muted text-muted-foreground border-border"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

function AnatomyTrack({ theme }: { theme: BlueprintTheme }) {
  const { hovered, setHovered } = useAnatomy();
  const spotlight = useSpotlight(["root", "track"]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: illustrative anatomy overlay, not an interactive control
    <rect
      x={10}
      y={50}
      width={200}
      height={38}
      rx={8}
      stroke="currentColor"
      strokeWidth={hovered === "root" ? 2 : theme.wireframe.strokeWidth}
      fill={
        hovered === "root" || hovered === "track"
          ? "currentColor"
          : "transparent"
      }
      fillOpacity={hovered === "root" ? 0.03 : hovered === "track" ? 0.1 : 0}
      className={`cursor-pointer ${spotlight.className}`}
      style={{ ...spotlight.style, pointerEvents: "all" }}
      onMouseEnter={() => setHovered("track")}
      onMouseLeave={() => setHovered(null)}
    />
  );
}

function AnatomyIndicator() {
  const { hovered, setHovered } = useAnatomy();
  const spotlight = useSpotlight("indicator");

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: illustrative anatomy overlay, not an interactive control
    <rect
      x={10}
      y={50}
      height={38}
      width={100}
      rx={8}
      stroke="currentColor"
      strokeWidth={1}
      fill={hovered === "indicator" ? "currentColor" : "url(#bp-anatomy-hatch)"}
      className={`cursor-pointer ${hovered === "indicator" ? "text-foreground" : ""} ${spotlight.className}`}
      style={{ ...spotlight.style, pointerEvents: "all" }}
      onMouseEnter={() => setHovered("indicator")}
      onMouseLeave={() => setHovered(null)}
    />
  );
}

function AnatomyThumb({ theme }: { theme: BlueprintTheme }) {
  const { hovered, setHovered } = useAnatomy();
  const spotlight = useSpotlight("thumb");

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: illustrative anatomy overlay, not an interactive control
    <g
      onMouseEnter={() => setHovered("thumb")}
      onMouseLeave={() => setHovered(null)}
      className="cursor-pointer"
      style={{ pointerEvents: "all", filter: spotlight.style.filter }}
    >
      <rect x={90} y={50} width={24} height={38} fill="transparent" />
      <rect
        x={100}
        y={60}
        width={4}
        height={18}
        rx={2}
        stroke="currentColor"
        strokeWidth={hovered === "thumb" ? 1 : theme.wireframe.strokeWidth}
        fill={hovered === "thumb" ? "currentColor" : "transparent"}
        className={`${hovered === "thumb" ? "text-foreground" : ""} ${spotlight.className}`}
      />
    </g>
  );
}

function AnatomyTexts() {
  const { hovered } = useAnatomy();
  const indSpotlight = useSpotlight("indicator", { defaultOpacity: 70 });
  const trkSpotlight = useSpotlight("track", { defaultOpacity: 70 });

  return (
    <>
      <text
        x={24}
        y={73.5}
        textAnchor="start"
        fontSize={14}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        style={{ pointerEvents: "none", ...indSpotlight.style }}
        className={`${hovered === "indicator" ? "fill-background" : "fill-current"} ${indSpotlight.className}`}
      >
        Compact
      </text>
      <text
        x={196}
        y={73.5}
        textAnchor="end"
        fontSize={14}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        style={{ pointerEvents: "none", ...trkSpotlight.style }}
        className={`${hovered === "track" ? "fill-foreground" : "fill-current"} ${trkSpotlight.className}`}
      >
        30
      </text>
    </>
  );
}

function AnatomyBackground() {
  const { hovered } = useAnatomy();
  const isOthersHovered = hovered !== null;

  return (
    <g
      style={{
        pointerEvents: "none",
        filter: isOthersHovered ? "url(#spotlight-blur)" : "none",
      }}
      className={`transition-all duration-200 ease-out ${isOthersHovered ? "opacity-30" : "opacity-100"}`}
    >
      <PadGuide
        x={24}
        y={60}
        w={172}
        h={18}
        offset={0.8}
        boxX={10}
        boxY={50}
        boxW={200}
        boxH={38}
        boxRx={8}
        clipOffset={0.8}
      />
      <g
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.5}
      >
        <text x={17} y={72}>
          14
        </text>
        <text x={203} y={72}>
          14
        </text>
        <text x={130} y={57.5}>
          10
        </text>
        <text x={130} y={86.5}>
          10
        </text>
      </g>
      <text
        x={10}
        y={43}
        fontSize={10}
        fontFamily="var(--font-mono)"
        fill="currentColor"
        opacity={0.5}
        fontWeight={500}
      >
        r8
      </text>
      <Selection x={10} y={50} w={200} h={38} />
      <DimH x1={10} x2={210} y={35} label="200" />
      <DimV
        x={225}
        y1={50}
        y2={88}
        label="38"
        labelXOffset={5}
        labelAnchor="start"
      />
    </g>
  );
}

function OverlayLine({
  id,
  x1,
  y1,
  x2,
  y2,
}: {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const { hovered } = useAnatomy();
  const spotlight = useSpotlight(id, { defaultOpacity: 80 });
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={`${hovered === id ? "stroke-foreground" : "stroke-border"} ${spotlight.className}`}
      style={spotlight.style}
    />
  );
}

function AnatomyOverlayLines() {
  return (
    <g strokeWidth="1" className="pointer-events-none">
      <OverlayLine id="root" x1={70} y1={65} x2={70} y2={90} />
      <OverlayLine id="indicator" x1={120} y1={40} x2={120} y2={90} />
      <OverlayLine id="thumb" x1={162} y1={145} x2={162} y2={128} />
      <OverlayLine id="track" x1={220} y1={175} x2={220} y2={128} />
    </g>
  );
}

function AnatomyInteractionZone() {
  const { hovered, setHovered } = useAnatomy();
  const spotlight = useSpotlight("interaction", { isInteraction: true });

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: illustrative anatomy overlay, not an interactive control */}
      <rect
        x={140}
        y={87}
        width={44}
        height={44}
        rx={8}
        strokeWidth={1}
        strokeDasharray={hovered === "interaction" ? "none" : "2 2"}
        className={`cursor-pointer stroke-accent ${hovered === "interaction" ? "fill-accent" : "fill-transparent"} ${spotlight.className}`}
        style={{
          pointerEvents: "all",
          fillOpacity: hovered === "interaction" ? 0.1 : 0,
          ...spotlight.style,
        }}
        onMouseEnter={() => setHovered("interaction")}
        onMouseLeave={() => setHovered(null)}
      />
      <line
        x1={184}
        y1={109}
        x2={310}
        y2={109}
        strokeWidth={1}
        strokeDasharray={hovered === "interaction" ? "none" : "2 2"}
        className={`pointer-events-none stroke-accent ${spotlight.className}`}
        style={spotlight.style}
      />
    </>
  );
}

function AnatomyBadges() {
  return (
    <>
      <foreignObject
        x={70}
        y={45}
        width={100}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <Badge
          part="root"
          label="Slider.Root"
          className="items-end justify-start"
        />
      </foreignObject>
      <foreignObject
        x={70}
        y={20}
        width={100}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <Badge
          part="indicator"
          label="Slider.Indicator"
          className="items-end justify-center"
        />
      </foreignObject>
      <foreignObject
        x={112}
        y={145}
        width={100}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <Badge
          part="thumb"
          label="Slider.Thumb"
          className="items-start justify-center"
        />
      </foreignObject>
      <foreignObject
        x={220}
        y={175}
        width={100}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <Badge
          part="track"
          label="Slider.Track"
          className="items-start justify-start"
        />
      </foreignObject>
      <foreignObject
        x={310}
        y={99}
        width={160}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <Badge
          part="interaction"
          label="Interaction Zone (&ge;44px)"
          isAccent
          className="items-center justify-start"
        />
      </foreignObject>
    </>
  );
}

// --- Main Component ---
export function Component() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <AnatomyContext.Provider value={{ hovered, setHovered }}>
      <div className="flex w-full items-center justify-center overflow-visible py-10">
        <svg
          aria-hidden="true"
          viewBox="0 0 500 220"
          fill="none"
          className="w-full max-w-[600px] overflow-visible text-foreground/80 font-mono text-xs"
        >
          <defs>
            <pattern
              id="bp-anatomy-hatch"
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="4" className="fill-background" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="currentColor"
                strokeWidth="0.75"
                className="opacity-40"
              />
            </pattern>
            <filter id="spotlight-blur">
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>

          <g transform="translate(60, 40)">
            <AnatomyTrack theme={blueprintTheme} />
            <AnatomyIndicator />
            <AnatomyThumb theme={blueprintTheme} />
            <AnatomyTexts />
            <AnatomyBackground />
          </g>

          <AnatomyOverlayLines />
          <AnatomyInteractionZone />
          <AnatomyBadges />
        </svg>
      </div>
    </AnatomyContext.Provider>
  );
}
