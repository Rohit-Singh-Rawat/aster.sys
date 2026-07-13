import { hasReducedMotionListener, prefersReducedMotion } from "motion-dom";

/**
 * jsdom has no matchMedia. This stub answers reduced-motion queries from a
 * test-controlled flag so motion behavior is testable without a browser.
 * Call mockReducedMotion(true) BEFORE render — changes are not propagated
 * to already-mounted components (no change events are emitted).
 *
 * motion/react's useReducedMotion() doesn't read matchMedia on every render:
 * it lazily reads it ONCE per module lifetime into motion-dom's
 * prefersReducedMotion/hasReducedMotionListener singleton, then every
 * mounted component's useState(prefersReducedMotion.current) just captures
 * whatever the singleton held at THAT mount. It only ever refreshes via a
 * matchMedia "change" listener — which the stub below never fires. So
 * mockReducedMotion() sets the singleton directly (the same current value
 * every future mount will read), instead of relying on matchMedia's
 * "matches" being re-read, which only ever happens once per file.
 */
let reduced = false;

export function mockReducedMotion(value: boolean): void {
  reduced = value;
  hasReducedMotionListener.current = true;
  prefersReducedMotion.current = value;
}

export function resetReducedMotion(): void {
  reduced = false;
  hasReducedMotionListener.current = false;
  prefersReducedMotion.current = null;
}

export function installMatchMedia(): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query.includes("prefers-reduced-motion") ? reduced : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
