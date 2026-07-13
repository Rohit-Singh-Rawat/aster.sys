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

export function SliderBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <defs>
        <pattern
          id="bp-hatch-slider"
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
      </defs>

      <g>
        <rect
          x={40}
          y={68}
          width={140}
          height={4}
          rx={2}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          className={`${BP_MORPH} fill-transparent opacity-50 group-hover:fill-foreground/10 group-hover:stroke-transparent group-hover:opacity-100`}
        />

        <rect
          x={40}
          y={68}
          width={50}
          height={4}
          rx={2}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          className="fill-transparent opacity-80 origin-[40px_70px] transition-[fill,stroke,opacity,scale] delay-0 duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:fill-foreground group-hover:stroke-transparent group-hover:opacity-100 group-hover:scale-x-[1.8] group-hover:delay-[200ms] motion-reduce:transition-none"
        />
      </g>

      <g className="transition-transform delay-0 duration-(--motion-dur-slow) ease-(--motion-ease-out) group-hover:translate-x-[40px] group-hover:delay-[200ms] motion-reduce:transition-none">
        <circle
          cx={90}
          cy={70}
          r={8}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          fill="url(#bp-hatch-slider)"
          className={`${BP_MORPH} group-hover:fill-background group-hover:stroke-foreground`}
        />

        <rect
          x={76}
          y={36}
          width={28}
          height={18}
          rx={4}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          className={`${BP_MORPH} fill-transparent opacity-60 group-hover:fill-foreground group-hover:stroke-transparent group-hover:opacity-100`}
        />
        <path
          d="M86 54 l4 4 l4 -4"
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          className={`${BP_MORPH} fill-transparent opacity-60 group-hover:fill-foreground group-hover:stroke-transparent group-hover:opacity-100`}
        />

        <text
          x={90}
          y={49}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className="fill-transparent stroke-current opacity-70 transition-opacity duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:opacity-0 group-hover:delay-[250ms] motion-reduce:transition-none"
        >
          35
        </text>
        <text
          x={90}
          y={49}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className="fill-transparent stroke-current opacity-0 transition-opacity duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:fill-background group-hover:stroke-transparent group-hover:opacity-100 group-hover:delay-[250ms] motion-reduce:transition-none"
        >
          65
        </text>
      </g>

      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={40}
          y={58}
          w={140}
          h={24}
          offset={0.8}
          boxX={30}
          boxY={52}
          boxW={160}
          boxH={36}
          boxRx={8}
          clipOffset={0.8}
        />

        <PadGuide x={82} y={62} w={16} h={16} offset={0.8} />

        <Selection x={30} y={30} w={160} h={60} />

        <DimH x1={40} x2={180} y={15} label="140" />
        <DimH x1={78} x2={102} y={105} label="24" />
        <DimV x={198} y1={52} y2={88} label="36" />
      </g>
    </Blueprint>
  );
}
