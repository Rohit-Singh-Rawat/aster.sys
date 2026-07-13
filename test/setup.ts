import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installMatchMedia, resetReducedMotion } from "./reduced-motion";

afterEach(() => {
  cleanup();
  resetReducedMotion();
  vi.restoreAllMocks();
});

// ---- jsdom gaps (each guarded so a future jsdom that implements the API wins) ----

installMatchMedia();

// usePress and Base UI's slider read isPrimary/pointerId/pointerType off
// pointer events; jsdom lacks a PointerEvent implementation (Base UI's own
// suite carries the same polyfill).
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly isPrimary: boolean;
    readonly pointerType: string;
    readonly width: number;
    readonly height: number;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      // Browser default is false; helpers in test/interactions.ts pass true.
      this.isPrimary = init.isPrimary ?? false;
      this.pointerType = init.pointerType ?? "mouse";
      this.width = init.width ?? 1;
      this.height = init.height ?? 1;
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

// Base UI captures the pointer during drags; jsdom has no implementation.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}

// useFader observes the control for re-measurement; jsdom has none. A stub
// is enough for the unit lane — real resize behavior runs in the browser lane.
if (typeof window.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}
