/**
 * Motion tokens - the single source of motion truth for JS animations.
 * The CSS counterparts (--motion-* variables in the app stylesheet, shipped
 * to consumers via this item's cssVars) must mirror these values exactly.
 */
export const durations = {
  instant: "50ms",
  fast: "120ms",
  base: "200ms",
  slow: "320ms",
} as const;

export const easings = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** Spring presets for motion/react animations. */
export const springs = {
  press: { type: "spring", stiffness: 700, damping: 32, mass: 1 },
  settle: { type: "spring", stiffness: 260, damping: 26, mass: 1 },
  bounce: { type: "spring", stiffness: 260, damping: 24, mass: 1 },
} as const;
