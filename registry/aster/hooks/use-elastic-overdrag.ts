"use client";

import { animate, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { springs } from "@/registry/aster/lib/motion-tokens";

export interface UseElasticOverdragOptions {
  /** Disables all tracking (mirror the control's disabled state). */
  disabled?: boolean;
  /**
   * Skips the stretch but keeps `dragging` tracking — pass the consumer's
   * `prefers-reduced-motion` state so resistance feedback degrades to
   * nothing rather than to movement.
   */
  reduceMotion?: boolean;
  /** Pointer distance past the edge before resistance engages, px. */
  deadZone?: number;
  /** Maximum stretch at full overdrag, px. */
  maxStretch?: number;
  /** Damping range of the resistance curve (larger = softer), px. */
  range?: number;
}

export interface UseElasticOverdragResult {
  /** True from pointer-down on the surface until release/cancel anywhere. */
  dragging: boolean;
  /** Horizontal stretch factor — style the surface with `{ scaleX }`. */
  scaleX: ReturnType<typeof useMotionValue<number>>;
  /**
   * Stretch anchor — always the edge OPPOSITE the overdragged one, so the
   * surface stretches toward the pointer. Style with `{ transformOrigin }`.
   */
  transformOrigin: ReturnType<typeof useMotionValue<string>>;
  /** Attach to the surface being dragged. */
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}

/**
 * Elastic overdrag system: dragging past a surface's horizontal bounds
 * stretches it with exponentially damped resistance, and it springs home on
 * release or re-entry — "boundary reached, input heard, no more range."
 *
 * One concern, reusable: any horizontally scrubbed surface (slider, timeline,
 * crop handle) can express its edges this way. The stretch is transform-only
 * (scaleX) and spring-returned with carried velocity, so interruption and
 * re-grab retarget cleanly. Listeners are window-level for the duration of
 * one drag and are removed on release, cancel, or unmount.
 */
export function useElasticOverdrag(
  options: UseElasticOverdragOptions = {},
): UseElasticOverdragResult {
  const {
    disabled = false,
    reduceMotion = false,
    deadZone = 4,
    maxStretch = 8,
    range = 120,
  } = options;

  const [dragging, setDragging] = useState(false);
  const scaleX = useMotionValue(1);
  const transformOrigin = useMotionValue("0% 50%");
  /** Removes the current drag's window listeners, if a drag is in flight. */
  const cleanupRef = useRef<(() => void) | null>(null);

  // A drag in flight at unmount would strand its window listeners.
  useEffect(() => () => cleanupRef.current?.(), []);

  function springHome() {
    if (scaleX.get() !== 1) {
      animate(scaleX, 1, {
        ...springs.settle,
        velocity: scaleX.getVelocity(),
      });
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (disabled) return;
    // A second pointerdown before the first drag's pointerup/cancel (two
    // fingers, a stray duplicate event) would otherwise overwrite
    // cleanupRef and orphan the first session's window listeners — end()
    // never fires for it since move/end aren't scoped to a pointerId. This
    // component tracks one value with one drag session at a time, so the
    // correct model is exclusive: a new press ends whatever came before it.
    cleanupRef.current?.();
    setDragging(true);
    const rect = event.currentTarget.getBoundingClientRect();
    let outside = false;
    const move = (ev: PointerEvent) => {
      let past = 0;
      if (ev.clientX < rect.left) past = ev.clientX - rect.left;
      else if (ev.clientX > rect.right) past = ev.clientX - rect.right;
      if (past === 0) {
        if (outside) {
          outside = false;
          springHome();
        }
        return;
      }
      if (!outside) {
        outside = true;
        transformOrigin.set(past > 0 ? "0% 50%" : "100% 50%");
      }
      scaleX.stop();
      const over = Math.max(0, Math.abs(past) - deadZone);
      const stretchPx = maxStretch * (1 - Math.exp(-over / range));
      scaleX.set(1 + stretchPx / rect.width);
    };
    function removeListeners() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      cleanupRef.current = null;
    }
    function end() {
      removeListeners();
      setDragging(false);
      springHome();
    }
    if (!reduceMotion) window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    cleanupRef.current = removeListeners;
  }

  return { dragging, scaleX, transformOrigin, onPointerDown };
}
