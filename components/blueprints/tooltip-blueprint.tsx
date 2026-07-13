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
 * Tooltip: pointing bubble anchored to a button. On hover the drawing
 * morphs into the implementation | the bubble fills solid like a real
 * tooltip, the button becomes a surface | while the bubble floats up.
 */
export function TooltipBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <g className="origin-[110px_100px] transition-transform duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:scale-[0.93] motion-reduce:transition-none">
        <circle
          cx={110}
          cy={100}
          r={12}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent group-hover:fill-background`}
        />
        <text
          x={110}
          y={104.5}
          textAnchor="middle"
          fontSize={13}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100`}
        >
          i
        </text>
      </g>

      <g className="transition-transform duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:-translate-y-[6px] group-hover:delay-200 motion-reduce:transition-none">
        <rect
          x={45}
          y={32}
          width={130}
          height={36}
          rx={6}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent opacity-70 group-hover:fill-foreground group-hover:stroke-transparent group-hover:opacity-100`}
        />
        <path
          d="M104 68 l6 8 l6 -8"
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent opacity-70 group-hover:fill-foreground group-hover:stroke-transparent group-hover:opacity-100`}
        />
        <text
          x={110}
          y={55}
          textAnchor="middle"
          fontSize={13}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-background group-hover:stroke-transparent group-hover:opacity-100`}
        >
          Tooltip
        </text>
      </g>

      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={102}
          y={92}
          w={16}
          h={16}
          boxX={98}
          boxY={88}
          boxW={24}
          boxH={24}
          boxRx={12}
        />
        <PadGuide
          x={57}
          y={38}
          w={106}
          h={24}
          boxX={45.5}
          boxY={32.5}
          boxW={129}
          boxH={35}
          boxRx={5.5}
        />
        <Selection x={45} y={32} w={130} h={44} />
        <DimH x1={45} x2={175} y={16} label="130" />
        <DimV x={125} y1={76} y2={88} label="12" labelXOffset={8} />
      </g>
    </Blueprint>
  );
}
