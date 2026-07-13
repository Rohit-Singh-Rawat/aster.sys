"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import { type MotionValue, motion, useTransform } from "motion/react";
import type { Ref } from "react";
import { cn } from "@/registry/aster/lib/cn";
import { springs } from "@/registry/aster/lib/motion-tokens";
import { BAR_BOX, barCenterFor, fillEdgePx } from "./geometry";
import { type UseFaderOptions, useFader } from "./use-fader";

/**
 * Fader — a parameter fader, not a form slider. The control doubles as
 * the value display: label and value live inside the track, the fill
 * edge is the reading, and a thin bar rides the edge as the grab
 * signifier — the mixing-console fader insight the name comes from.
 * Base UI supplies semantics, keyboard, and touch; behavior lives in
 * `useFader`; this file is variants and markup only.
 */

/**
 * Radius around the bar's center, in px, where a detent mark is fully
 * hidden. Must exceed BAR_BOX/2 (8px): the current value's mark sits AT the
 * fill edge, 8px right of the bar's center — with a smaller radius it
 * peeked out beside the bar instead of being covered by it.
 */
const MARK_HIDE_RADIUS = 10;
/** Extra px over which a mark fades in/out of hiding, so it doesn't pop. */
const MARK_HIDE_FADE = 6;

/**
 * Size variants. Heights sit on the 4px grid; 32px still clears the WCAG
 * 2.5.8 AA target minimum (24px), 40px is the recommended primary-target
 * size. Bar and marks scale with the track so proportions hold.
 */
const sizeVariants = {
  sm: {
    control: "h-8",
    overlay: "px-3",
    text: "text-xs",
    bar: "h-4",
    mark: "size-1",
  },
  md: {
    control: "h-10",
    overlay: "px-3.5",
    text: "text-sm",
    bar: "h-5",
    mark: "size-1",
  },
  lg: {
    control: "h-12",
    overlay: "px-4",
    text: "text-sm",
    bar: "h-6",
    mark: "size-1.5",
  },
} as const;

const toneVariants = {
  accent: {
    fill: "border border-accent/20 bg-accent/15 pointer-fine:group-hover/fader:bg-accent/20 group-data-dragging/control:bg-accent/25",
    bar: "bg-accent",
  },
  neutral: {
    fill: "border border-foreground/10 bg-foreground/10 pointer-fine:group-hover/fader:bg-foreground/15 group-data-dragging/control:bg-foreground/20",
    bar: "bg-foreground/80",
  },
} as const;

/**
 * Mark, fill, and bar share ONE coordinate space: real px, read reactively
 * from the trackWidth motion value. Before measurement lands, coverage
 * falls back to percent-space so first paint shows the correct state.
 */
function DetentMark({
  pct,
  fill,
  trackWidth,
  className,
}: {
  pct: number;
  fill: MotionValue<number>;
  trackWidth: MotionValue<number>;
  className: string;
}) {
  const filledOpacity = useTransform(() => {
    const tw = trackWidth.get();
    if (!tw) return fill.get() >= pct ? 1 : 0;
    const covered = fillEdgePx(fill.get(), tw) - (pct / 100) * tw;
    return Math.min(1, Math.max(0, covered / 8));
  });
  const visibility = useTransform(() => {
    const tw = trackWidth.get();
    if (!tw) {
      return Math.abs(fill.get() - pct) < 0.001 ? 0 : 1;
    }
    const markPx = (pct / 100) * tw;
    const barCenter = barCenterFor(fillEdgePx(fill.get(), tw));
    const distance = Math.abs(markPx - barCenter);
    return Math.min(
      1,
      Math.max(0, (distance - MARK_HIDE_RADIUS) / MARK_HIDE_FADE),
    );
  });
  return (
    <motion.span
      aria-hidden
      className={cn(
        "-translate-x-1/2 -translate-y-1/2 absolute top-1/2",
        className,
      )}
      style={{ left: `${pct}%`, opacity: visibility }}
    >
      <span className="absolute inset-0 round bg-foreground/25" />
      <motion.span
        className="absolute inset-0 round bg-foreground/60"
        style={{ opacity: filledOpacity }}
      />
    </motion.span>
  );
}

export interface FaderProps extends Omit<UseFaderOptions, "remeasureKey"> {
  size?: keyof typeof sizeVariants;
  tone?: keyof typeof toneVariants;
  /** Hairline input outline (border-border role) for busy surfaces. */
  bordered?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function Fader({
  size = "md",
  tone = "accent",
  bordered = false,
  className,
  ref,
  ...behavior
}: FaderProps) {
  const slider = useFader({ ...behavior, remeasureKey: size });
  const sizeStyle = sizeVariants[size];
  const toneStyle = toneVariants[tone];

  return (
    <BaseSlider.Root
      ref={ref}
      {...slider.rootProps}
      className={cn("w-full data-disabled:opacity-45", className)}
    >
      {/* Named groups: the wrapper group carries hover (the text overlay is
          a sibling of the Control, so hover must resolve from up here), the
          Control group carries Base UI's data-dragging state. */}
      <div className="group/fader relative">
        <BaseSlider.Control
          {...slider.controlProps}
          className={cn(
            // squircle: the shared corner treatment for controls (Button
            // uses the same utility); falls back to rounded-md where the
            // browser lacks corner-shape support.
            // touch-pan-y: vertical swipes scroll the page; horizontal
            // gestures reach the slider.
            "group/control relative block w-full cursor-grab touch-pan-y select-none squircle outline-none data-disabled:cursor-default data-dragging:cursor-grabbing has-[&:focus-visible]:ring-2 has-[&:focus-visible]:ring-ring has-[&:focus-visible]:ring-offset-2 has-[&:focus-visible]:ring-offset-background",
            sizeStyle.control,
          )}
        >
          {/* The Track carries surface, optional hairline outline, and clip
              so the elastic stretch moves the whole visible slider; Base
              UI's inline position:relative means it must be sized, not
              positioned. */}
          <BaseSlider.Track
            render={
              <motion.div
                style={{
                  scaleX: slider.trackScaleX,
                  transformOrigin: slider.trackOrigin,
                }}
              />
            }
            className={cn(
              "h-full w-full overflow-hidden squircle bg-muted/40",
              bordered && "border border-border",
            )}
          >
            {/* Fill with the bar as its child: the element's right edge IS
                the fill edge, so the ml-auto box rides it by construction —
                no separate bar position exists to drift or clip. The fill
                shrinks to 0 at min; the bar overflows and parks at the
                start. Width animation here is a deliberate exception to the
                transform-only motion rule, scoped safely because the fill
                is absolutely positioned with a single child. */}
            <motion.div
              className={cn(
                // rounded-r-md matches the Track's squircle fallback radius
                // (6px) — squircle applies no plain border-radius fallback
                // asymmetrically, so the fill's own corner must be set to
                // agree with it explicitly, or the two curves visibly
                // disagree exactly at the fill's trailing edge.
                "absolute top-0 left-0 h-full rounded-r-md transition-colors duration-(--motion-dur-fast) ease-(--motion-ease-out)",
                toneStyle.fill,
              )}
              style={{ width: slider.fillWidth }}
            >
              {/* Box width comes from BAR_BOX so markup and dodge/mark
                  geometry share one source of truth. */}
              <div
                className="ml-auto flex h-full items-center justify-center"
                style={{ width: BAR_BOX }}
              >
                <motion.span
                  aria-hidden
                  className={cn("w-1 round", sizeStyle.bar, toneStyle.bar)}
                  initial={false}
                  animate={
                    slider.dodge
                      ? {
                          opacity: 0.3,
                          scaleY: slider.reducedMotion ? 1 : 0.75,
                        }
                      : slider.grabbed
                        ? {
                            opacity: 1,
                            scaleY: slider.reducedMotion ? 1 : 1.2,
                          }
                        : slider.focusVisible
                          ? {
                              opacity: 1,
                              scaleY: slider.reducedMotion ? 1 : 1.35,
                            }
                          : { opacity: 0.85, scaleY: 1 }
                  }
                  transition={springs.settle}
                />
              </div>
            </motion.div>
            {/* Detent marks at their true value positions — one coordinate
                space with the fill, so coverage and crossfade always agree.
                Endpoints are already filtered by the behavior layer. */}
            <div className="pointer-events-none absolute inset-0">
              {slider.markPercents.map((pct) => (
                <DetentMark
                  key={pct}
                  pct={pct}
                  fill={slider.fillPercent}
                  trackWidth={slider.trackWidth}
                  className={sizeStyle.mark}
                />
              ))}
            </div>
            {/* Sized (not zero) invisible thumb: a real focus/touch box.
                getAriaValueText restores the unit a screen reader would
                otherwise never hear ("65%", not "65"). */}
            <BaseSlider.Thumb
              {...slider.thumbProps}
              className="h-8 w-5 outline-none"
            />
          </BaseSlider.Track>
        </BaseSlider.Control>

        {/* Read-only overlay. aria-hidden because the slider input already
            announces name and value: Slider.Value is an <output> (an
            implicit live region), so leaving it in the tree makes every
            arrow press announce twice. aria-labelledby still resolves the
            hidden label for the accessible name. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-between",
            sizeStyle.overlay,
          )}
        >
          <BaseSlider.Label
            ref={slider.labelRef}
            className={cn("font-medium text-foreground", sizeStyle.text)}
          >
            {behavior.label}
          </BaseSlider.Label>
          <BaseSlider.Value
            ref={slider.valueRef}
            className={cn("text-foreground tabular-nums", sizeStyle.text)}
          >
            {(parts) => (
              <>
                {parts[0]}
                {behavior.unit ? (
                  <span className="text-muted-foreground">{behavior.unit}</span>
                ) : null}
              </>
            )}
          </BaseSlider.Value>
        </div>
      </div>
    </BaseSlider.Root>
  );
}
