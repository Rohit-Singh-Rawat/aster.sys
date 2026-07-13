import { useId } from "react";
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

export function RadioBlueprint() {
  const theme = blueprintTheme;
  const patternId = useId();
  return (
    <Blueprint>
      <defs>
        <pattern
          id={`bp-hatch-radio-${patternId}`}
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
        <circle
          cx={70}
          cy={50}
          r={9}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent group-hover:fill-transparent group-hover:stroke-foreground/20`}
        />
        <circle
          cx={70}
          cy={50}
          r={6.5}
          stroke="currentColor"
          strokeWidth={1}
          fill={`url(#bp-hatch-radio-${patternId})`}
          className="opacity-60 origin-[70px_50px] transition-[fill,stroke,opacity,scale] duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-0 group-hover:scale-[0.5] group-hover:delay-[300ms] motion-reduce:transition-none"
        />
        <text
          x={95}
          y={54.5}
          fontSize={13}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100`}
        >
          Standard
        </text>
      </g>

      <g>
        <circle
          cx={70}
          cy={90}
          r={9}
          stroke="currentColor"
          strokeWidth={theme.wireframe.strokeWidth}
          strokeOpacity={theme.wireframe.strokeOpacity}
          className={`${BP_MORPH} fill-transparent group-hover:fill-transparent group-hover:stroke-foreground`}
        />
        <circle
          cx={70}
          cy={90}
          r={6.5}
          stroke="currentColor"
          strokeWidth={1}
          fill={`url(#bp-hatch-radio-${patternId})`}
          className="opacity-0 origin-[70px_90px] scale-[0.5] transition-[fill,stroke,opacity,scale] duration-(--motion-dur-base) ease-(--motion-ease-out) group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100 group-hover:scale-[1] group-hover:delay-[300ms] motion-reduce:transition-none"
        />
        <text
          x={95}
          y={94.5}
          fontSize={13}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          strokeWidth={theme.wireframe.textStrokeWidth}
          strokeOpacity={theme.wireframe.textOpacity}
          className={`${BP_MORPH} fill-transparent stroke-current opacity-70 group-hover:fill-current group-hover:stroke-transparent group-hover:opacity-100`}
        >
          Express
        </text>
      </g>

      <g className={BP_HIDE_ON_MORPH}>
        <PadGuide
          x={61}
          y={41}
          w={18}
          h={18}
          offset={0.8}
          boxX={50}
          boxY={30}
          boxW={120}
          boxH={40}
          boxRx={6}
          clipOffset={0.8}
        />
        <PadGuide
          x={61}
          y={81}
          w={18}
          h={18}
          offset={0.8}
          boxX={50}
          boxY={70}
          boxW={120}
          boxH={40}
          boxRx={6}
          clipOffset={0.8}
        />
        <Selection x={50} y={30} w={120} h={80} />

        <DimV x={185} y1={50} y2={90} label="40" labelXOffset={8} />

        <DimH x1={50} x2={170} y={15} label="120" />
        <DimV
          x={35}
          y1={30}
          y2={70}
          label="40"
          labelAnchor="end"
          labelXOffset={-6}
        />
      </g>
    </Blueprint>
  );
}
