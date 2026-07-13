import {
  Blueprint,
  BP_HIDE_ON_MORPH,
  BP_MORPH,
  blueprintTheme,
  DimH,
  DimLabel,
  Selection,
} from "./parts";

/**
 * Switch, per the owner's mockup: hatched thumb sitting INSIDE the track,
 * tight construction (selection + hugging dims only). On hover the drawing
 * morphs into the implementation | track fills solid, hatching resolves to
 * a clean thumb | while the thumb flicks across.
 */
export function SwitchBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <defs>
        <pattern
          id="bp-hatch-switch"
          width={4}
          height={4}
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={4}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.45}
          />
        </pattern>
      </defs>
      <rect
        x={75}
        y={53}
        width={70}
        height={34}
        rx={17}
        stroke="currentColor"
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent group-hover:fill-foreground`}
      />
      <g className={BP_HIDE_ON_MORPH}>
        <DimLabel x={57} y={73} anchor="middle">
          On
        </DimLabel>
        <DimLabel x={163} y={73} anchor="start">
          Off
        </DimLabel>
      </g>
      <g className="transition-transform duration-(--motion-dur-slow) ease-(--motion-ease-in-out) group-hover:-translate-x-[36px] motion-reduce:transition-none">
        <circle cx={128} cy={70} r={13} fill="var(--background)" />
        <circle
          cx={128}
          cy={70}
          r={13}
          fill="url(#bp-hatch-switch)"
          className={`${BP_MORPH} group-hover:opacity-0`}
        />
        <circle
          cx={128}
          cy={70}
          r={13}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} group-hover:opacity-0`}
        />
      </g>
      <g className={BP_HIDE_ON_MORPH}>
        <Selection x={75} y={53} w={70} h={34} />
        <DimH x1={75} x2={145} y={39} label="70" />
      </g>
    </Blueprint>
  );
}
