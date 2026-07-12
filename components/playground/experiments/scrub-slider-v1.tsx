"use client";

import { Slider } from "@base-ui/react/slider";
import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { springs } from "@/registry/aster/lib/motion-tokens";

/**
 * Playground experiment — RETIRED from the workbench (the final candidate
 * lives in scrub-slider.tsx). Kept unregistered for history/comparison.
 *
 * A parameter-scrubber slider: the control doubles as the value display
 * (label + value live inside the track, the fill edge is the reading).
 * Built on Base UI's Slider as the temporary primitive (semantics, keyboard,
 * ARIA, touch), with the experience layered on top per
 * docs/06-components/slider/notes.md. Two grammars: continuous (1:1 drag)
 * and snappy (detents — explicit `points` or few coarse steps — where every
 * hop springs into place and dots mark the points). Value adjustment is
 * pointer scrub/click or keyboard arrows; there is deliberately no typed
 * entry (decision 5, revised v4). Known limits: LTR-only transform math, no
 * disabled state, text zones don't re-measure on container resize.
 */

/** Pointer distance past the control edge before overdrag feedback engages. */
const OVERDRAG_DEAD_ZONE = 24;
/** Max elastic stretch of the track under overdrag, in px of extra width. */
const OVERDRAG_MAX = 8;
/** Damping range for the overdrag curve (larger = softer resistance). */
const OVERDRAG_RANGE = 120;
/** Sliders with this many positions or fewer behave as detents (snappy). */
const DISCRETE_LIMIT = 12;
/** Horizontal padding of the in-track label/value overlay (matches px-3.5). */
const OVERLAY_PAD = 14;
/** Safe zone around in-track text: the bar starts dodging this early (px). */
const DODGE_ZONE = 6;
/**
 * Bar geometry: thin (w-1/h-5), rendered BAR_BACKSET px behind the fill's
 * leading edge so a clear gap (BAR_BACKSET − BAR_WIDTH = 8px) always
 * separates the bar from the progress edge — enough to read past the fill's
 * 12px corner radius. BAR_MIN_INSET keeps the bar off the track's true
 * left/right edges — it lives on a layer the rounded-corner clip never
 * touches (see Track render), so this is pure breathing room, not a
 * clipping workaround.
 */
const BAR_WIDTH = 4;
const BAR_BACKSET = 12;
const BAR_MIN_INSET = 5;
/**
 * Radius around the bar's center, in px, where a snap dot is fully hidden.
 * Must exceed the bar-center-to-fill-edge distance (BAR_BACKSET −
 * BAR_WIDTH/2 = 10px): the current value's dot sits AT the fill edge, and
 * with a smaller radius it peeked out beside the bar.
 */
const DOT_HIDE_RADIUS = 12;
/** Extra px over which a dot fades in/out of hiding, so it doesn't pop. */
const DOT_HIDE_FADE = 6;

function decimalsFor(step: number): number {
  if (step >= 1) return 0;
  return Math.min(3, Math.ceil(-Math.log10(step)));
}

/** Index of the point closest to a value. */
function nearestIndex(points: number[], value: number): number {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i] - value) < Math.abs(points[best] - value)) best = i;
  }
  return best;
}

/** The bar's left edge in px, given a fill percent and the track's px width. */
function barLeftPx(percent: number, trackWidth: number): number {
  if (!trackWidth) return BAR_MIN_INSET;
  return Math.min(
    Math.max(BAR_MIN_INSET, (percent / 100) * trackWidth - BAR_BACKSET),
    trackWidth - BAR_BACKSET,
  );
}

/**
 * A snap dot crossfades between two inks as the fill passes it (darker on
 * the progress so it stays legible), and hides entirely once the bar is
 * close enough to cover it — a dot peeking out beside the bar it represents
 * reads as clutter, not information.
 */
function SnapDot({
  pct,
  fill,
  trackWidth,
}: {
  pct: number;
  fill: MotionValue<number>;
  trackWidth: number;
}) {
  const filledOpacity = useTransform(fill, (p) =>
    Math.min(1, Math.max(0, (p - pct) / 3)),
  );
  const visibility = useTransform(fill, (p) => {
    if (!trackWidth) return 1;
    const dotPx = Math.min(
      Math.max(6, (pct / 100) * trackWidth),
      trackWidth - 6,
    );
    const barCenterPx = barLeftPx(p, trackWidth) + BAR_WIDTH / 2;
    const distance = Math.abs(dotPx - barCenterPx);
    return Math.min(
      1,
      Math.max(0, (distance - DOT_HIDE_RADIUS) / DOT_HIDE_FADE),
    );
  });
  return (
    <motion.span
      aria-hidden
      className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 size-1"
      style={{
        left: `clamp(6px, ${pct}%, calc(100% - 6px))`,
        opacity: visibility,
      }}
    >
      <span className="absolute inset-0 rounded-full bg-foreground/25" />
      <motion.span
        className="absolute inset-0 rounded-full bg-foreground/60"
        style={{ opacity: filledOpacity }}
      />
    </motion.span>
  );
}

interface ScrubSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /**
   * Snap-points grammar: pointer input only ever lands on these values —
   * dragging hops between them on a spring (detents), clicks go to the
   * nearest point, arrows travel point-to-point, and a dot marks each point.
   * Omit for the continuous grammar, where the value changes fluidly at
   * every step.
   */
  points?: number[];
}

export function ScrubSliderV1({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  points,
}: ScrubSliderProps) {
  const controlRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLOutputElement>(null);
  const settleRef = useRef<ReturnType<typeof animate> | null>(null);

  const [grabbed, setGrabbed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [textZones, setTextZones] = useState({
    labelEnd: 0,
    valueStart: Number.POSITIVE_INFINITY,
    width: 0,
  });

  const reducedMotion = useReducedMotion();

  const sortedPoints = points ? [...points].sort((a, b) => a - b) : null;
  const decimals = decimalsFor(step);
  const display = value.toFixed(decimals);
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;
  const percent = toPercent(value);
  const positions = Math.round((max - min) / step);
  // Snappy sliders (explicit points, or few coarse steps) behave as detents;
  // continuous ones follow the pointer 1:1. Dots exist only on snappy ones.
  const isSnappy = sortedPoints !== null || positions <= DISCRETE_LIMIT;
  // Endpoint dots (at min/max) are dropped: the track's capsule ends already
  // imply them, and rendered ones sit on the rounded corners as clutter.
  const markPercents = (
    sortedPoints
      ? sortedPoints.map(toPercent)
      : isSnappy
        ? Array.from({ length: positions - 1 }, (_, i) =>
            toPercent(min + (i + 1) * step),
          )
        : []
  ).filter((pct) => pct > 0.5 && pct < 99.5);

  // The fill and bar are driven by one spring-capable motion value. Drag and
  // keyboard write it 1:1 (velocity tracked); clicks and detent hops animate
  // it with the settle spring, which retargets cleanly when interrupted and
  // carries the gesture's velocity ("to-spring-or-not-to-spring":
  // gesture-driven, interruptible motion wants a spring, not a curve).
  const fillPercent = useMotionValue(percent);
  const fillX = useTransform(fillPercent, (p) => `${p - 100}%`);
  // Bar position in real px (from the measured track width) so motion owns
  // the transform end to end — a raw CSS clamp() transform string is outside
  // motion's transform model and broke rendering.
  const trackWidth = textZones.width;
  const barX = useTransform(fillPercent, (p) => barLeftPx(p, trackWidth));

  // Elastic overdrag: the track itself stretches past the boundary and
  // bounces back — subtle (≤8px) so it reads as resistance, not travel.
  const trackScaleX = useMotionValue(1);
  const trackOrigin = useMotionValue("0% 50%");

  // Follow the controlled value unless a settle spring owns it right now.
  useEffect(() => {
    if (settleRef.current) return;
    fillPercent.set(percent);
  }, [percent, fillPercent]);

  useEffect(() => () => settleRef.current?.stop(), []);

  // Measure the in-track text so the bar can dodge beneath it, in px so the
  // dodge zone compares against the bar's real edges. Bails out of the state
  // update when unchanged (drag re-renders).
  // biome-ignore lint/correctness/useExhaustiveDependencies(display): the value text width is read from the DOM, so the re-measure must run after `display` re-renders
  useLayoutEffect(() => {
    const control = controlRef.current;
    if (!control || control.offsetWidth === 0) return;
    const width = control.offsetWidth;
    const labelEnd = labelRef.current
      ? OVERLAY_PAD + labelRef.current.offsetWidth
      : 0;
    const valueStart = valueRef.current
      ? width - OVERLAY_PAD - valueRef.current.offsetWidth
      : width;
    setTextZones((prev) =>
      prev.width === width &&
      prev.labelEnd === labelEnd &&
      prev.valueStart === valueStart
        ? prev
        : { labelEnd, valueStart, width },
    );
  }, [display]);

  // Dodge when the bar's real edges (plus the safe zone) reach the text.
  const barLeft = barLeftPx(percent, textZones.width);
  const dodge =
    textZones.width > 0 &&
    (barLeft - DODGE_ZONE < textZones.labelEnd ||
      barLeft + BAR_WIDTH + DODGE_ZONE > textZones.valueStart);

  function stopSettle() {
    if (settleRef.current) {
      settleRef.current.stop();
      settleRef.current = null;
    }
  }

  // A click or a detent hop is a teleport — animate the travel so the change
  // reads as continuous. Drag stays 1:1; keyboard is never animated.
  function settleTo(pct: number) {
    stopSettle();
    if (reducedMotion) {
      fillPercent.jump(pct);
      return;
    }
    settleRef.current = animate(fillPercent, pct, {
      ...springs.settle,
      velocity: fillPercent.getVelocity(),
      onComplete: () => {
        settleRef.current = null;
      },
    });
  }

  function handleValueChange(
    next: number | number[],
    details: Slider.Root.ChangeEventDetails,
  ) {
    const raw = Array.isArray(next) ? next[0] : next;
    if (details.reason === "keyboard") {
      stopSettle();
      if (sortedPoints) {
        // Arrows travel between points, not raw steps.
        let idx: number;
        if (raw >= max) idx = sortedPoints.length - 1;
        else if (raw <= min) idx = 0;
        else {
          const current = nearestIndex(sortedPoints, value);
          idx = Math.min(
            sortedPoints.length - 1,
            Math.max(0, current + (raw > value ? 1 : -1)),
          );
        }
        onValueChange(sortedPoints[idx]);
        return;
      }
      onValueChange(raw);
      return;
    }
    if (details.reason === "track-press" || details.reason === "drag") {
      if (sortedPoints) {
        // Detents: pointer input only ever lands on a point; each hop
        // springs into place.
        const snapped = sortedPoints[nearestIndex(sortedPoints, raw)];
        if (snapped !== value) {
          settleTo(toPercent(snapped));
          onValueChange(snapped);
        }
        return;
      }
      if (isSnappy) {
        // Coarse steps read as detents too.
        if (raw !== value) {
          settleTo(toPercent(raw));
          onValueChange(raw);
        }
        return;
      }
      // Continuous: clicks animate the travel; drag writes the motion value
      // before React re-renders so the fill tracks the pointer with zero
      // added latency.
      if (details.reason === "track-press") {
        settleTo(toPercent(raw));
      } else {
        stopSettle();
        fillPercent.set(toPercent(raw));
      }
      onValueChange(raw);
      return;
    }
    stopSettle();
    onValueChange(raw);
  }

  function springStretchHome() {
    if (trackScaleX.get() !== 1) {
      animate(trackScaleX, 1, {
        ...springs.settle,
        velocity: trackScaleX.getVelocity(),
      });
    }
  }

  // Overdrag: past the track edge the track stretches elastically with
  // exponential damping — "boundary reached, input heard" — and springs back
  // whether the pointer re-enters or releases. Window listeners survive the
  // pointer leaving the control; they remove themselves on release.
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    setGrabbed(true);
    const rect = event.currentTarget.getBoundingClientRect();
    let outside = false;
    const move = (ev: PointerEvent) => {
      const past =
        ev.clientX < rect.left
          ? ev.clientX - rect.left
          : ev.clientX > rect.right
            ? ev.clientX - rect.right
            : 0;
      if (past === 0) {
        if (outside) {
          outside = false;
          springStretchHome();
        }
        return;
      }
      if (!outside) {
        outside = true;
        trackOrigin.set(past > 0 ? "0% 50%" : "100% 50%");
      }
      trackScaleX.stop();
      const over = Math.max(0, Math.abs(past) - OVERDRAG_DEAD_ZONE);
      const stretchPx = OVERDRAG_MAX * (1 - Math.exp(-over / OVERDRAG_RANGE));
      trackScaleX.set(1 + stretchPx / rect.width);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      setGrabbed(false);
      springStretchHome();
    };
    if (!reducedMotion) window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      format={{
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }}
      onValueChange={handleValueChange}
      className="w-full"
    >
      <div className="relative">
        <Slider.Control
          ref={controlRef}
          onPointerDown={handlePointerDown}
          className="group relative block h-10 w-full cursor-grab touch-none select-none rounded-xl outline-none data-dragging:cursor-grabbing has-[&:focus-visible]:ring-2 has-[&:focus-visible]:ring-ring has-[&:focus-visible]:ring-offset-2 has-[&:focus-visible]:ring-offset-background"
        >
          {/* Track must be sized, not absolutely positioned — Base UI applies
              an inline `position: relative` that overrides positioning
              classes. It carries the surface so the elastic stretch moves the
              whole visible slider (the sibling text overlay stays still). */}
          <Slider.Track
            render={
              <motion.div
                style={{ scaleX: trackScaleX, transformOrigin: trackOrigin }}
              />
            }
            className="h-full w-full rounded-xl bg-muted/40"
          >
            {/* Clipped layer: fill + dots only. This is deliberately the ONLY
                thing masked by the rounded corners — it's what makes the
                fill read as a rounded capsule when it's small, an effect
                that must hold in both grammars. */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {/* Hover brightens the fill (the progress is the feedback
                  surface); the bar only changes when actually held or
                  dodging. */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-accent/15 transition-colors duration-(--motion-dur-fast) ease-(--motion-ease-out) pointer-fine:group-hover:bg-accent/20 group-data-dragging:bg-accent/25"
                style={{ x: fillX }}
              />
              {markPercents.map((pct) => (
                <SnapDot
                  key={pct}
                  pct={pct}
                  fill={fillPercent}
                  trackWidth={trackWidth}
                />
              ))}
            </div>
            {/* The bar rides its own full-width layer, deliberately OUTSIDE
                the clip above — the bar grows taller on grab/focus
                (scaleY), and clipping a growing element against a rounded
                corner is what was chopping it near the track ends. Only
                BAR_MIN_INSET keeps it off the true edges now, not the mask. */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ x: barX }}
            >
              {/* Bar states spring so grab, release, and dodge retarget
                  smoothly mid-flight; keyboard focus highlights the bar (the
                  ring lives on the outer control). */}
              <motion.span
                aria-hidden
                className="absolute top-1/2 left-0 h-5 w-1 rounded-full bg-accent"
                style={{ y: "-50%" }}
                initial={false}
                animate={
                  dodge
                    ? { opacity: 0.3, scaleY: reducedMotion ? 1 : 0.7 }
                    : grabbed
                      ? { opacity: 1, scaleY: reducedMotion ? 1 : 1.15 }
                      : focusVisible
                        ? { opacity: 1, scaleY: reducedMotion ? 1 : 1.25 }
                        : { opacity: 0.85, scaleY: 1 }
                }
                transition={{ ...springs.settle }}
              />
            </motion.div>
            {/* One tab stop per slider (Apple HIG model): arrows adjust the
                focused slider. The ring renders on the outer control,
                keyboard-only. */}
            <Slider.Thumb
              onFocus={(event) =>
                setFocusVisible(event.target.matches(":focus-visible"))
              }
              onBlur={() => setFocusVisible(false)}
              className="size-0 outline-none"
            />
          </Slider.Track>
        </Slider.Control>

        {/* Label and value are a read-only overlay — every pointer event
            falls through to the track, so scrubbing works edge to edge. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3.5">
          <Slider.Label
            ref={labelRef}
            className="font-medium text-foreground text-sm"
          >
            {label}
          </Slider.Label>
          <Slider.Value
            ref={valueRef}
            className="text-foreground text-sm tabular-nums"
          >
            {(formatted) => (
              <>
                {formatted[0]}
                {unit ? (
                  <span className="text-muted-foreground">{unit}</span>
                ) : null}
              </>
            )}
          </Slider.Value>
        </div>
      </div>
    </Slider.Root>
  );
}
