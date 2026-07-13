import { Blueprint, BP_MORPH, blueprintTheme, DimH, PadGuide } from "./parts";

/**
 * Checkbox: box + label wrapped by a dashed boundary around the whole unit
 * (no selection frame | nothing crosses the text). Morph sequence on hover:
 * 1. construction (dashed boundary + dims) fades out quickly,
 * 2. the box fills solid,
 * 3. then the tick draws itself in, in the implementation's ink.
 */

const HIDE_FIRST =
  "transition-opacity duration-(--motion-dur-slow) ease-(--motion-ease-in-out) group-hover:opacity-0 group-focus-visible:opacity-0";

export function CheckboxBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <rect
        x={62}
        y={56}
        width={26}
        height={26}
        rx={4.5}
        stroke="currentColor"
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent group-hover:fill-foreground`}
      />
      <path
        d="M66 69 l6 6 l12 -14"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={theme.wireframe.strokeOpacity}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
        className={`${BP_MORPH} stroke-current group-hover:animate-[bp-check-draw_400ms_var(--motion-ease-out)_400ms_both] group-hover:stroke-background motion-reduce:animate-none`}
      />
      <text
        x={100}
        y={76}
        fontSize={20}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        strokeWidth={theme.wireframe.textStrokeWidth}
        strokeOpacity={theme.wireframe.textOpacity}
        className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100`}
      >
        Checkbox
      </text>
      <g className={HIDE_FIRST}>
        <PadGuide
          x={61}
          y={55}
          w={28}
          h={28}
          boxX={40}
          boxY={45}
          boxW={160}
          boxH={48}
          boxRx={8}
        />
        <DimH x1={62} x2={88} y={41} label="26" />
        <DimH x1={88} x2={100} y={95} label="12" />
      </g>
    </Blueprint>
  );
}
