import { fireEvent } from "@testing-library/react";
import { vi } from "vitest";

/**
 * Pointer helpers defaulting to a primary main-button press — the shape
 * usePress and Base UI accept. Override fields per call to model
 * non-primary or secondary-button input.
 */
export function pointerDown(el: Element, init: PointerEventInit = {}) {
  return fireEvent.pointerDown(el, {
    pointerId: 1,
    isPrimary: true,
    button: 0,
    buttons: 1,
    ...init,
  });
}

export function pointerUp(el: Element, init: PointerEventInit = {}) {
  return fireEvent.pointerUp(el, {
    pointerId: 1,
    isPrimary: true,
    button: 0,
    ...init,
  });
}

export function pointerLeave(el: Element, init: PointerEventInit = {}) {
  return fireEvent.pointerLeave(el, { pointerId: 1, isPrimary: true, ...init });
}

export function pointerCancel(el: Element, init: PointerEventInit = {}) {
  return fireEvent.pointerCancel(el, {
    pointerId: 1,
    isPrimary: true,
    ...init,
  });
}

/**
 * Stubs EVERY element's layout rect — Base UI's slider-test pattern; jsdom
 * has no layout. With this active, useFader measures a real track width and
 * Base UI can map clientX to a value. Returns a restore function (also
 * restored by the global afterEach's vi.restoreAllMocks()).
 */
export function stubAllRects({
  left = 0,
  width = 200,
  height = 40,
} = {}): () => void {
  const rect = {
    x: left,
    y: 0,
    left,
    top: 0,
    width,
    height,
    right: left + width,
    bottom: height,
    toJSON: () => ({}),
  } as DOMRect;
  const spy = vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockReturnValue(rect);
  return () => spy.mockRestore();
}

/** Strict query — throws instead of returning null (keeps `!` out of tests). */
export function q<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`expected element matching: ${selector}`);
  }
  return el;
}
