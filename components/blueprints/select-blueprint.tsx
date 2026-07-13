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
 * Select: trigger with a boxed chevron, open menu with real option text and
 * a highlight bar. On hover the drawing morphs into the implementation |
 * surfaces fill, text sharpens | while the highlight steps to the next
 * option and the chevron flips.
 */
export function SelectBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <rect
        x={50}
        y={16}
        width={120}
        height={28}
        rx={6}
        stroke="currentColor"
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent group-hover:fill-background`}
      />
      <text
        x={60}
        y={34}
        fontSize={10}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        fill="currentColor"
        className={`${BP_MORPH} opacity-70 group-hover:opacity-100`}
      >
        Select
      </text>
      <svg
        aria-hidden="true"
        x={148}
        y={24}
        width={12}
        height={12}
        viewBox="0 0 24 24"
        overflow="visible"
      >
        <g
          style={{ transformOrigin: "12px 12px" }}
          className="transition-transform duration-(--motion-dur-base) ease-(--motion-ease-in-out) group-hover:rotate-180 motion-reduce:transition-none"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m19 9l-7 6l-7-6"
            opacity={0.75}
          />
        </g>
      </svg>
      <rect
        x={50}
        y={52}
        width={120}
        height={70}
        rx={6}
        stroke="currentColor"
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent group-hover:fill-foreground group-hover:stroke-foreground`}
      />
      <g className="transition-transform delay-0 duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:translate-y-[20px] group-hover:delay-[150ms] motion-reduce:transition-none">
        <rect
          x={56}
          y={58}
          width={108}
          height={18}
          rx={4}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          className={`${BP_MORPH} fill-transparent opacity-10 group-hover:fill-background group-hover:stroke-transparent group-hover:opacity-[0.15]`}
        />
      </g>
      <g
        fontSize={9}
        fontWeight={500}
        fontFamily="var(--font-sans)"
        fill="currentColor"
        className={`${BP_MORPH} opacity-60 group-hover:fill-background group-hover:opacity-90`}
      >
        <text x={62} y={71}>
          Option 1
        </text>
        <text x={62} y={91}>
          Option 2
        </text>
        <text x={62} y={111}>
          Option 3
        </text>
      </g>
      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={60}
          y={22}
          w={100}
          h={16}
          offset={0.8}
          boxX={50}
          boxY={16}
          boxW={120}
          boxH={28}
          boxRx={6}
          clipOffset={0.8}
        />
        <PadGuide
          x={56}
          y={58}
          w={108}
          h={58}
          offset={0.8}
          boxX={50}
          boxY={52}
          boxW={120}
          boxH={70}
          boxRx={6}
          clipOffset={0.8}
        />
        <Selection x={50} y={16} w={120} h={28} />
        <DimH x1={50} x2={170} y={8} label="120" />
        <DimV
          x={182}
          y1={16}
          y2={44}
          label="28"
          labelXOffset={5}
          labelAnchor="start"
        />
        <DimH x1={50} x2={170} y={130} label="120" labelYOffset={9} />
      </g>
    </Blueprint>
  );
}
