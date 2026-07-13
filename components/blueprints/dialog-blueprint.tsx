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
 * Dialog: titled panel with real body text and an actions bar. On hover the
 * drawing morphs into the implementation | panel becomes a solid surface,
 * the primary action fills | while the whole dialog lifts gently.
 */
export function DialogBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <g className="origin-[110px_70px] transition-transform delay-0 duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:-translate-y-[6px] group-hover:scale-[1.03] group-hover:delay-[250ms] motion-reduce:transition-none">
        <rect
          x={35}
          y={15}
          width={150}
          height={110}
          rx={8}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent group-hover:fill-background`}
        />
        <g>
          <svg
            aria-hidden="true"
            x={50}
            y={30}
            width={18}
            height={18}
            viewBox="0 0 24 24"
            className={`${BP_MORPH} opacity-50 group-hover:opacity-100`}
          >
            <circle
              cx="12"
              cy="6"
              r="4"
              stroke="currentColor"
              strokeWidth={1.5}
              className={`${BP_MORPH} fill-transparent group-hover:fill-current group-hover:stroke-transparent`}
            />
            <ellipse
              cx="12"
              cy="17"
              rx="7"
              ry="4"
              stroke="currentColor"
              strokeWidth={1.5}
              className={`${BP_MORPH} fill-transparent group-hover:fill-current group-hover:stroke-transparent opacity-60 group-hover:opacity-50`}
            />
          </svg>
          <text
            x={76}
            y={43}
            fontSize={10}
            fontWeight={500}
            fontFamily="var(--font-sans)"
            fill="currentColor"
            className={`${BP_MORPH} opacity-60 group-hover:opacity-100`}
          >
            User profile
          </text>
        </g>
        <g
          fontSize={10}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          fill="currentColor"
          className={`${BP_MORPH} opacity-60 group-hover:opacity-100`}
        >
          <text x={51} y={66}>
            Manage your account
          </text>
          <text x={51} y={80}>
            preferences here.
          </text>
        </g>
        <g className="origin-[145px_101px] transition-transform delay-0 duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:scale-[0.93] group-hover:delay-[400ms] motion-reduce:transition-none">
          <rect
            x={120}
            y={92}
            width={50}
            height={18}
            rx={4}
            stroke="currentColor"
            strokeWidth={theme.wireframe.strokeWidth}
            strokeOpacity={theme.wireframe.strokeOpacity}
            className={`${BP_MORPH} fill-transparent group-hover:fill-foreground group-hover:stroke-transparent`}
          />
          <text
            x={145}
            y={104}
            textAnchor="middle"
            fontSize={9}
            fontWeight={500}
            fontFamily="var(--font-sans)"
            fill="currentColor"
            className={`${BP_MORPH} opacity-70 group-hover:fill-background group-hover:opacity-100`}
          >
            Save
          </text>
        </g>
      </g>
      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={50}
          y={30}
          w={120}
          h={80}
          offset={0.8}
          boxX={35}
          boxY={15}
          boxW={150}
          boxH={110}
          boxRx={8}
          clipOffset={0.8}
        />
        <Selection x={35} y={15} w={150} h={110} />
        <DimH x1={35} x2={185} y={134} label="150" />
        <DimV x={22} y1={15} y2={125} label="110" />
      </g>
    </Blueprint>
  );
}
