import {
  Blueprint,
  BP_HIDE_ON_MORPH,
  BP_MORPH,
  blueprintTheme,
  DimH,
  DimV,
  PadGuide,
  Selection,
} from "./parts";

/**
 * Drawn to the real Fader's anatomy, not a generic slider: a full-width
 * track with the label and value living INSIDE it (not a floating
 * tooltip), a fill growing from the left, and a thin bar riding the
 * fill's edge as the grab signifier — never a round thumb. The bar is the
 * one element that visibly reacts on hover (grows taller, per the real
 * component's grabbed-state feedback), since it's the part that makes a
 * Fader a Fader rather than a generic range input.
 */
// (unused constant removed)
export function FaderBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <defs>
        <pattern
          id="bp-hatch-fader"
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
        <style>
          {`
            .fader-progress {
              transition: fill 0.15s, stroke 0.15s, opacity 0.15s, width var(--motion-dur-slow) var(--motion-ease-out) 0s;
            }
            .group:hover .fader-progress {
              transition: fill 0.15s, stroke 0.15s, opacity 0.15s, width var(--motion-dur-slow) var(--motion-ease-out) 200ms;
            }
          `}
        </style>
      </defs>

      <g>
        <rect
          x={10}
          y={50}
          width={180}
          height={40}
          rx={8}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent group-hover:fill-foreground/5 group-hover:stroke-transparent`}
        />

        <rect
          x={10}
          y={50}
          height={40}
          rx={8}
          stroke="currentColor"
          strokeWidth={1}
          fill="url(#bp-hatch-fader)"
          className="fader-progress opacity-60 w-[90px] group-hover:w-[120px] group-hover:fill-foreground/15 group-hover:stroke-transparent group-hover:opacity-100 motion-reduce:transition-none"
        />

        <g className="transition-transform delay-0 duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:translate-x-[30px] group-hover:delay-[200ms] motion-reduce:transition-none">
          <rect
            x={90}
            y={60}
            width={4}
            height={20}
            rx={2}
            stroke="currentColor"
            strokeWidth={theme.wireframe.strokeWidth}
            className={`${BP_MORPH} fill-transparent opacity-60 group-hover:fill-foreground/80 group-hover:stroke-transparent group-hover:opacity-100 group-hover:scale-y-125 motion-reduce:transition-none`}
            style={{ transformOrigin: "92px 70px" }}
          />
        </g>

        <text
          x={24}
          y={74.5}
          textAnchor="start"
          fontSize={14}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100`}
        >
          Compact
        </text>

        <text
          x={176}
          y={74.5}
          textAnchor="end"
          fontSize={14}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className="fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-0 motion-reduce:transition-none"
          style={{ transition: "fill 0.15s, stroke 0.15s, opacity 0.25s 0.2s" }}
        >
          30
        </text>
        <text
          x={176}
          y={74.5}
          textAnchor="end"
          fontSize={14}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className="fill-transparent stroke-current opacity-0 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100 motion-reduce:transition-none"
          style={{ transition: "fill 0.15s, stroke 0.15s, opacity 0.25s 0.2s" }}
        >
          85
        </text>
      </g>

      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={24}
          y={60}
          w={152}
          h={20}
          offset={0.8}
          boxX={10}
          boxY={50}
          boxW={180}
          boxH={40}
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
          {/* horizontal padding */}
          <text x={17} y={73}>
            14
          </text>
          <text x={183} y={73}>
            14
          </text>
          {/* vertical padding */}
          <text x={110} y={58.5}>
            10
          </text>
          <text x={110} y={88.5}>
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

        <Selection x={10} y={50} w={180} h={40} />

        <DimH x1={10} x2={190} y={35} label="180" />
        <DimV
          x={205}
          y1={50}
          y2={90}
          label="40"
          labelXOffset={5}
          labelAnchor="start"
        />
      </g>
    </Blueprint>
  );
}
