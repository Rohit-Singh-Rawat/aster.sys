import {
  Blueprint,
  BP_HIDE_ON_MORPH,
  BP_MORPH,
  blueprintTheme,
  DimH,
  DimLabel,
  DimV,
  PadGuide,
  Selection,
} from "./parts";

/**
 * Drawn to the real Button's metrics (variant "solid", size "md"):
 * 40px tall (h-10), 20px horizontal padding, 20px radius (rounded-full),
 * 14px medium label | box 108×40 centered at (110, 70).
 *
 * The morph: this is ONE component, not two layers. At rest it is a
 * wireframe | hollow outline text, dashed padding lines, selection handles
 * touching the bounds. On hover/focus the construction fades away while the
 * same rect fills to the solid button and the hollow text fills to its
 * label: the drawing becomes the implementation.
 */

export function ButtonBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <rect
        x={56}
        y={50}
        width={108}
        height={40}
        rx={20}
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent stroke-current group-hover:fill-foreground group-hover:stroke-transparent group-focus-visible:fill-foreground group-focus-visible:stroke-transparent`}
      />
      <text
        x={110}
        y={75}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fontFamily="var(--font-sans)"
        strokeWidth={theme.wireframe.textStrokeWidth}
        strokeOpacity={theme.wireframe.textOpacity}
        className={`${BP_MORPH} fill-transparent stroke-current group-hover:fill-background group-hover:stroke-transparent group-focus-visible:fill-background group-focus-visible:stroke-transparent`}
      >
        Button
      </text>
      <g className={BP_HIDE_ON_MORPH}>
        <Selection x={56} y={50} w={108} h={40} />
        <PadGuide
          x={76}
          y={60}
          w={68}
          h={20}
          boxX={56}
          boxY={50}
          boxW={108}
          boxH={40}
          boxRx={20}
        />
        <DimLabel x={66} y={72.5}>
          20
        </DimLabel>
        <DimLabel x={154} y={72.5}>
          20
        </DimLabel>
        <DimLabel x={110} y={57}>
          10
        </DimLabel>
        <DimLabel x={110} y={88}>
          10
        </DimLabel>
        <DimV x={42} y1={50} y2={90} label="40" />
        <DimH x1={56} x2={164} y={104} label="108" />
        <DimLabel x={56} y={44} anchor="start">
          r20
        </DimLabel>
      </g>
    </Blueprint>
  );
}
