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
 * Drawn to a standard Input's metrics:
 * 36px tall, 18px horizontal padding, 18px radius (rounded-full),
 * 14px placeholder text | box 200x36.
 */

export function InputBlueprint() {
  const theme = blueprintTheme;
  return (
    <Blueprint>
      <rect
        x={10}
        y={52}
        width={200}
        height={36}
        rx={18}
        strokeWidth={theme.wireframe.strokeWidth}
        strokeOpacity={theme.wireframe.strokeOpacity}
        className={`${BP_MORPH} fill-transparent stroke-current group-hover:fill-background group-hover:stroke-border group-focus-visible:fill-background group-focus-visible:stroke-border`}
      />

      <text
        x={28}
        y={74.5}
        textAnchor="start"
        fontSize={14}
        fontWeight={400}
        fontFamily="var(--font-sans)"
        className="fill-foreground stroke-transparent"
      >
        <tspan className="opacity-0 transition-opacity duration-700 delay-0 group-hover:opacity-100 group-hover:duration-0 group-hover:delay-500 group-focus-visible:opacity-100 group-focus-visible:duration-0 group-focus-visible:delay-500">
          m
        </tspan>
        <tspan className="opacity-0 transition-opacity duration-700 delay-0 group-hover:opacity-100 group-hover:duration-0 group-hover:delay-700 group-focus-visible:opacity-100 group-focus-visible:duration-0 group-focus-visible:delay-700">
          e
        </tspan>
        <tspan className="opacity-0 transition-opacity duration-700 delay-0 group-hover:opacity-100 group-hover:duration-0 group-hover:delay-1000 group-focus-visible:opacity-100 group-focus-visible:duration-0 group-focus-visible:delay-1000">
          @
        </tspan>
      </text>

      <text
        x={28}
        y={74.5}
        textAnchor="start"
        fontSize={14}
        fontWeight={400}
        fontFamily="var(--font-sans)"
        strokeWidth={theme.wireframe.textStrokeWidth}
        strokeOpacity={theme.wireframe.textOpacity}
        className={`${BP_MORPH} fill-transparent stroke-current group-hover:opacity-0 group-focus-visible:opacity-0`}
      >
        Email...
      </text>

      <style>{`
        @keyframes cursorJump {
          0%, 49.99% { transform: translateX(0px); }
          50%, 69.99% { transform: translateX(11px); }
          70%, 99.99% { transform: translateX(19px); }
          100% { transform: translateX(34px); }
        }
        .group:hover .cursor-jump,
        .group:focus-visible .cursor-jump {
          animation: cursorJump 1s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .group:hover .cursor-jump,
          .group:focus-visible .cursor-jump {
            animation: none;
            transform: translateX(34px);
          }
        }
      `}</style>
      <g className="cursor-jump opacity-0 transition-opacity duration-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        <line
          x1={28}
          y1={60}
          x2={28}
          y2={80}
          strokeWidth={1.5}
          className="stroke-foreground animate-pulse"
        />
      </g>

      <g className={BP_HIDE_ON_MORPH}>
        <Selection x={10} y={52} w={200} h={36} />

        <PadGuide
          x={28}
          y={60}
          w={164}
          h={20}
          offset={0.8}
          boxX={10}
          boxY={52}
          boxW={200}
          boxH={36}
          boxRx={18}
          clipOffset={0.8}
        />

        <DimLabel x={19} y={72.5}>
          18
        </DimLabel>
        <DimLabel x={201} y={72.5}>
          18
        </DimLabel>
        <DimLabel x={110} y={58}>
          8
        </DimLabel>
        <DimLabel x={110} y={86}>
          8
        </DimLabel>

        <DimV x={4} y1={52} y2={88} label="36" />
        <DimH x1={10} x2={210} y={100} label="200" />
        <DimLabel x={10} y={46} anchor="start">
          r18
        </DimLabel>
      </g>
    </Blueprint>
  );
}
