"use client";

import type { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useElasticOverdrag } from "@/registry/aster/hooks/use-elastic-overdrag";
import { springs } from "@/registry/aster/lib/motion-tokens";
import { barCenterFor, fillEdgePx } from "./geometry";

/** Sliders with this many stops or fewer behave as detents (snappy). */
const DISCRETE_LIMIT = 12;
/** Safe zone around in-track text: the bar starts dodging this early (px). */
const DODGE_ZONE = 6;
/**
 * PageUp/PageDown's index jump on a snap-points grammar, as a fraction of
 * the point count (min 1). Points move in index units, not raw value:
 * Base UI's large-step is a raw value jump and can overshoot a sparse
 * points array from most positions.
 */
const LARGE_STEP_FRACTION = 4;

/**
 * Display decimals = the step's own decimal precision (capped at 3). Derived
 * from the step's string form, not its magnitude: magnitude-based rules
 * truncated fractional steps like 1.5 and 0.25, making the display disagree
 * with values the slider really lands on, and the control IS the display.
 */
function decimalsFor(step: number): number {
  const fraction = step.toString().split(".")[1];
  return Math.min(3, fraction?.length ?? 0);
}

function nearestIndex(points: number[], value: number): number {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i] - value) < Math.abs(points[best] - value)) best = i;
  }
  return best;
}

export interface UseFaderOptions {
  /** Accessible name; also used to attribute dev-time warnings. */
  label: string;
  /** Controlled-only: the single source of truth for the slider's reading. */
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Spoken after the value via aria-valuetext (e.g. "%"). */
  unit?: string;
  /**
   * Snap-points grammar: pointer input only ever lands on these values;
   * dragging hops between them on a spring (detents), clicks go to the
   * nearest point, arrows travel point-to-point. Omit for continuous.
   */
  points?: number[];
  disabled?: boolean;
  /**
   * Opaque key that forces a text-zone re-measure when it changes; pass
   * anything visual that moves the in-track text without resizing the
   * control (e.g. the size variant's overlay padding).
   */
  remeasureKey?: unknown;
}

// Formatters are stateless and shared: construction is the expensive part
// of Intl, and per-render construction was measurable during drags.
const formatterCache = new Map<number, Intl.NumberFormat>();
function formatterFor(decimals: number): Intl.NumberFormat {
  let formatter = formatterCache.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatterCache.set(decimals, formatter);
  }
  return formatter;
}

/**
 * Behavior layer for Fader: composes Base UI's slider semantics with the
 * fader's systems: value grammars (continuous vs detents), the settle
 * spring and its controlled-value contract, text-zone measurement, bar
 * dodge, and elastic overdrag. Owns every motion value; renders nothing.
 *
 * Controlled contract: `value` wins, always. A settle spring already flying
 * toward the current `value` is allowed to land; any other change (external
 * set, parent rejecting a change, keyboard) stops the spring and pins the
 * fill to the truth.
 */
export function useFader(options: UseFaderOptions) {
  const {
    label,
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    unit,
    points,
    disabled = false,
    remeasureKey,
  } = options;

  const controlRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLOutputElement>(null);
  const settleRef = useRef<ReturnType<typeof animate> | null>(null);
  /** Percent the running settle spring is flying toward, if any. */
  const settleTargetRef = useRef<number | null>(null);
  /** Latest `percent`, readable from the reconcile effect below. */
  const percentRef = useRef(toPercent(value));
  const reconcileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  /**
   * Text-zone geometry in px from the control's left edge, measured from
   * the real DOM rects (never derived from padding constants; a constant
   * that must equal a class in the markup is two systems agreeing by luck).
   */
  const zonesRef = useRef({
    labelStart: 0,
    labelEnd: 0,
    valueStart: Number.POSITIVE_INFINITY,
  });

  const [focusVisible, setFocusVisible] = useState(false);
  const [dodge, setDodge] = useState(false);
  const reducedMotion = useReducedMotion();

  const overdrag = useElasticOverdrag({
    disabled,
    reduceMotion: reducedMotion ?? false,
  });

  const sortedPoints = points ? [...points].sort((a, b) => a - b) : null;
  const decimals = decimalsFor(step);
  // The same Intl formatting Base UI applies to Slider.Value, so the
  // re-measure key below tracks the string actually rendered (toFixed
  // diverges from Intl output at grouped thousands).
  const formatted = formatterFor(decimals).format(value);

  function toPercent(v: number): number {
    if (max <= min) return 0;
    return ((v - min) / (max - min)) * 100;
  }
  const percent = toPercent(value);
  percentRef.current = percent;

  // Count the stops the slider can actually land on, matching Base UI's
  // semantics: min + n·step for every full step, PLUS max itself when step
  // doesn't divide the range evenly (Base UI clamps to max as a real extra
  // stop). A bare Math.round((max-min)/step) miscounted both ways: it
  // dropped reachable marks and flipped the interaction grammar at the
  // DISCRETE_LIMIT boundary. The epsilon absorbs float noise like
  // (1.5-0.5)/0.01 = 99.999….
  const stepRatio = (max - min) / step;
  const fullSteps = Math.floor(stepRatio + 1e-9);
  const stops = fullSteps + (stepRatio - fullSteps > 1e-9 ? 2 : 1);
  const isSnappy = sortedPoints !== null || stops <= DISCRETE_LIMIT;

  // Marks exist only on snappy sliders (they signify committable detents);
  // endpoint marks are dropped: the track's capsule ends imply them.
  let markCandidates: number[] = [];
  if (sortedPoints) {
    markCandidates = sortedPoints.map(toPercent);
  } else if (isSnappy) {
    markCandidates = Array.from({ length: fullSteps }, (_, i) =>
      toPercent(min + (i + 1) * step),
    );
  }
  const markPercents = markCandidates.filter((pct) => pct > 0.5 && pct < 99.5);

  // One spring-capable motion value drives the fill, and therefore the bar,
  // which is the fill's child and needs no position of its own. Track width
  // is a motion value too, so every px computation reacts to measurement
  // and resize instead of closing over a stale number.
  const fillPercent = useMotionValue(percent);
  const trackWidth = useMotionValue(0);
  const fillWidth = useTransform(() => {
    const tw = trackWidth.get();
    if (!tw) return `${Math.min(Math.max(fillPercent.get(), 0), 100)}%`;
    return fillEdgePx(fillPercent.get(), tw);
  });

  /**
   * Dodge derives from the ANIMATED fill position, not the target value:
   * a bar sweeping under the label mid-spring must dim while it's actually
   * there. State only changes when the boolean flips, so per-frame updates
   * are almost always setState bail-outs.
   */
  function updateDodge() {
    const tw = trackWidth.get();
    if (!tw) return;
    const zones = zonesRef.current;
    const barCenter = barCenterFor(fillEdgePx(fillPercent.get(), tw));
    setDodge(
      (barCenter > zones.labelStart - DODGE_ZONE &&
        barCenter < zones.labelEnd + DODGE_ZONE) ||
        barCenter > zones.valueStart - DODGE_ZONE,
    );
  }
  useMotionValueEvent(fillPercent, "change", updateDodge);

  // Keyboard and external changes are never animated; only pointer-driven
  // clicks and detent hops get the settle spring.
  useEffect(() => {
    if (settleRef.current && settleTargetRef.current === percent) return;
    settleRef.current?.stop();
    settleRef.current = null;
    settleTargetRef.current = null;
    fillPercent.set(percent);
  }, [percent, fillPercent]);

  // A settle spring at unmount would keep writing to a dead motion value.
  useEffect(
    () => () => {
      settleRef.current?.stop();
      if (reconcileTimeoutRef.current !== null) {
        clearTimeout(reconcileTimeoutRef.current);
      }
    },
    [],
  );

  // Controlled snap-back, fired once the drag gesture ENDS: never per
  // frame during it. Mid-gesture "disagreement" between the optimistic
  // fill and the accepted value is just the parent not having caught up
  // yet (startTransition, a debounced handler): a per-frame check can't
  // tell that apart from genuine rejection, and snapping back mid-drag
  // fights every legitimate deferred-update pattern with visible flicker.
  // After release, a grace window gives a deferred parent room to land
  // its update; if the fill still disagrees once it elapses, the parent
  // genuinely rejected or clamped the change, and the fill returns to the
  // accepted truth, the same contract as a controlled input ignoring
  // keystrokes. A fresh grab before the window elapses cancels it;
  // nothing here fights an active drag or the settle spring's own
  // onComplete reconciliation.
  useEffect(() => {
    if (overdrag.dragging) return;
    reconcileTimeoutRef.current = setTimeout(() => {
      reconcileTimeoutRef.current = null;
      if (settleRef.current) return; // a spring owns the fill; onComplete reconciles
      if (fillPercent.get() !== percentRef.current) {
        fillPercent.set(percentRef.current);
      }
    }, 300);
    return () => {
      if (reconcileTimeoutRef.current !== null) {
        clearTimeout(reconcileTimeoutRef.current);
        reconcileTimeoutRef.current = null;
      }
    };
  }, [overdrag.dragging, fillPercent]);

  // Points and range are a developer contract, not user input: surface
  // violations loudly in dev instead of silently clamping them at runtime.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on points content via join(","), since literal arrays get a new identity every render
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (min >= max) {
      console.warn(
        `Fader "${label}": min (${min}) must be less than max (${max}): percent math degenerates to NaN.`,
      );
    }
    if (!points) return;
    if (points.length < 2) {
      console.warn(
        `Fader "${label}": \`points\` needs at least 2 entries to be a grammar; got ${points.length}.`,
      );
    }
    const outside = points.filter((p) => p < min || p > max);
    if (outside.length > 0) {
      console.warn(
        `Fader "${label}": points outside [${min}, ${max}]: ${outside.join(", ")}.`,
      );
    }
  }, [points?.join(","), min, max, label]);

  function measureZones() {
    const control = controlRef.current;
    if (!control) return;
    const controlRect = control.getBoundingClientRect();
    if (controlRect.width === 0) return;
    const labelRect = labelRef.current?.getBoundingClientRect();
    const valueRect = valueRef.current?.getBoundingClientRect();
    zonesRef.current = {
      labelStart: labelRect ? labelRect.left - controlRect.left : 0,
      labelEnd: labelRect ? labelRect.right - controlRect.left : 0,
      valueStart: valueRect
        ? valueRect.left - controlRect.left
        : controlRect.width,
    };
    trackWidth.set(controlRect.width);
    updateDodge();
  }

  // Re-measure only when the rendered text can actually change width:
  // tabular-nums makes the value's width a pure function of its character
  // count, so value ticks that keep the same length skip the DOM read.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the inputs that change rendered text geometry; measureZones reads refs and motion values only
  useLayoutEffect(() => {
    measureZones();
  }, [formatted.length, label, unit, remeasureKey]);

  // Container resizes (viewport, layout shifts) re-measure the same zones;
  // without this the px geometry (dodge, marks, bar) goes stale on resize.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; the observer callback reads refs and motion values, never render values
  useEffect(() => {
    const control = controlRef.current;
    if (!control) return;
    const observer = new ResizeObserver(() => measureZones());
    observer.observe(control);
    return () => observer.disconnect();
  }, []);

  function stopSettle() {
    if (settleRef.current) {
      settleRef.current.stop();
      settleRef.current = null;
    }
    settleTargetRef.current = null;
  }

  // A click or a detent hop is a teleport: animate the travel so the change
  // reads as continuous. Drag stays 1:1; keyboard is never animated.
  function settleTo(pct: number) {
    stopSettle();
    if (reducedMotion) {
      fillPercent.jump(pct);
      return;
    }
    settleTargetRef.current = pct;
    settleRef.current = animate(fillPercent, pct, {
      ...springs.settle,
      velocity: fillPercent.getVelocity(),
      onComplete: () => {
        settleRef.current = null;
        settleTargetRef.current = null;
        if (fillPercent.get() !== percentRef.current) {
          fillPercent.set(percentRef.current);
        }
      },
    });
  }

  function handleValueChange(
    next: number | number[],
    details: BaseSlider.Root.ChangeEventDetails,
  ) {
    const raw = Array.isArray(next) ? next[0] : next;
    if (details.reason === "keyboard") {
      stopSettle();
      if (sortedPoints) {
        // Every key travels in point indices; the key itself decides the
        // jump, not raw's magnitude (see LARGE_STEP_FRACTION).
        const current = nearestIndex(sortedPoints, value);
        const key = details.event.key;
        let idx: number;
        if (key === "Home") idx = 0;
        else if (key === "End") idx = sortedPoints.length - 1;
        else if (key === "PageUp" || key === "PageDown") {
          const jump = Math.max(
            1,
            Math.round(sortedPoints.length / LARGE_STEP_FRACTION),
          );
          idx = Math.min(
            sortedPoints.length - 1,
            Math.max(0, current + (key === "PageUp" ? jump : -jump)),
          );
        } else {
          // Arrow keys: single-point step; direction from Base UI's raw
          // delta, which is already RTL-correct on its side.
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
        const snapped = sortedPoints[nearestIndex(sortedPoints, raw)];
        if (snapped !== value) {
          settleTo(toPercent(snapped));
          onValueChange(snapped);
        }
        return;
      }
      if (isSnappy) {
        if (raw !== value) {
          settleTo(toPercent(raw));
          onValueChange(raw);
        }
        return;
      }
      if (details.reason === "track-press") {
        settleTo(toPercent(raw));
        onValueChange(raw);
      } else {
        stopSettle();
        fillPercent.set(toPercent(raw));
        onValueChange(raw);
      }
      return;
    }
    stopSettle();
    onValueChange(raw);
  }

  return {
    /** Attach to Slider.Label / Slider.Value so text zones can be measured. */
    labelRef,
    valueRef,
    rootProps: {
      value,
      min,
      max,
      step,
      disabled,
      format: {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      },
      onValueChange: handleValueChange,
    },
    controlProps: {
      ref: controlRef,
      onPointerDown: overdrag.onPointerDown,
    },
    thumbProps: {
      getAriaValueText: (formattedValue: string) =>
        unit ? `${formattedValue}${unit}` : formattedValue,
      onFocus: (event: React.FocusEvent<HTMLInputElement>) =>
        setFocusVisible(event.target.matches(":focus-visible")),
      onBlur: () => setFocusVisible(false),
    },
    /** Bar states, in priority order used by the visual. */
    grabbed: overdrag.dragging,
    focusVisible,
    dodge,
    reducedMotion,
    /** Percent positions of detent marks (snappy grammar only). */
    markPercents,
    fillPercent,
    trackWidth,
    fillWidth,
    trackScaleX: overdrag.scaleX,
    trackOrigin: overdrag.transformOrigin,
  };
}
