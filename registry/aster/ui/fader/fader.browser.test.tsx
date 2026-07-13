import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Fader, type FaderProps } from "./fader";

type HarnessProps = Partial<Omit<FaderProps, "value" | "onValueChange">> & {
  initial?: number;
  onChange?: (value: number) => void;
};

function Controlled({ initial = 50, onChange, ...props }: HarnessProps) {
  const [value, setValue] = useState(initial);
  return (
    <Fader
      label="Volume"
      value={value}
      onValueChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
      {...props}
    />
  );
}

const STAGE_WIDTH = 400;
/** Fixed on both sides regardless of Stage's own width — see the resize
 * test, which must account for it when computing a target CONTENT width. */
const STAGE_PADDING = 100;

/** Padding gives pointer room to travel past the track for overdrag. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="stage"
      style={{ width: STAGE_WIDTH, padding: STAGE_PADDING }}
    >
      {children}
    </div>
  );
}

function q<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`expected element matching: ${selector}`);
  }
  return el;
}

const getControl = (container: HTMLElement) =>
  q<HTMLElement>(container, "[class*='cursor-grab']");
// Scoped to `control`, not `container`: `Stage`'s own wrapper div also
// carries an inline `width` style (`style={{ width: STAGE_WIDTH, ... }}`),
// so a container-wide `div[style*='width']` query matches that ancestor
// before it ever reaches the real fill div.
const getFill = (container: HTMLElement) =>
  q<HTMLElement>(getControl(container), "div[style*='width']");
const getBar = (container: HTMLElement) =>
  q<HTMLElement>(container, "span[class*='w-1']");
const getTrack = (container: HTMLElement) =>
  q<HTMLElement>(container, "[class*='overflow-hidden']");

function dispatchPointer(
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      pointerId: 1,
      isPrimary: true,
      button: type === "pointermove" ? -1 : 0,
      buttons: 1,
      clientX,
      clientY,
      pointerType: "mouse",
    }),
  );
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function frames(n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await frame();
  }
}

/**
 * Pointer drag: down on the element, moves/up dispatched on `document`.
 * Base UI's SliderControl adds its own drag-tracking `pointermove`/
 * `pointerup` listeners on `ownerDocument`, not `window` (see
 * SliderControl's onPointerDown: `doc.addEventListener("pointermove", ...)`).
 * Events dispatched directly at `window` never pass through `document`
 * (window sits above document in the propagation chain), so they'd miss
 * Base UI's own listeners entirely — only window-level listeners (like the
 * elastic-overdrag hook's) would see them. Dispatching at `document`
 * reaches both: it IS the target Base UI listens on, and it still bubbles
 * up through `window` for hooks that listen there.
 */
async function drag(el: HTMLElement, xs: number[], y: number): Promise<void> {
  dispatchPointer(el, "pointerdown", xs[0], y);
  await frame();
  for (const x of xs.slice(1)) {
    dispatchPointer(document, "pointermove", x, y);
    await frame();
  }
  dispatchPointer(document, "pointerup", xs[xs.length - 1], y);
  await frame();
}

const scaleOf = (el: HTMLElement): number => {
  const t = getComputedStyle(el).transform;
  return t === "none" ? 1 : new DOMMatrixReadOnly(t).a;
};

describe("Fader: browser physics", () => {
  it("stylesheet sanity: Tailwind classes are applied", async () => {
    const screen = await render(
      <Stage>
        <Controlled />
      </Stage>,
    );
    const control = getControl(screen.container);
    // h-10 (md) = 40px. If this fails, globals.css didn't compile — fix
    // the browser-setup import before debugging anything else.
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(32);
  });

  it("dragging writes a monotonic value sequence and lands where released", async () => {
    const onChange = vi.fn();
    const screen = await render(
      <Stage>
        <Controlled initial={0} onChange={onChange} />
      </Stage>,
    );
    const control = getControl(screen.container);
    const rect = control.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const xAt = (f: number) => rect.left + rect.width * f;
    await drag(control, [xAt(0.1), xAt(0.3), xAt(0.5), xAt(0.75)], y);

    const values = onChange.mock.calls.map(([v]) => v as number);
    expect(values.length).toBeGreaterThan(1);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
    const last = values[values.length - 1];
    expect(last).toBeGreaterThanOrEqual(70);
    expect(last).toBeLessThanOrEqual(80);
  });

  it("pointer input only lands on points (detent grammar)", async () => {
    const onChange = vi.fn();
    const points = [0, 25, 50, 100];
    const screen = await render(
      <Stage>
        <Controlled initial={0} points={points} onChange={onChange} />
      </Stage>,
    );
    const control = getControl(screen.container);
    const rect = control.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const xAt = (f: number) => rect.left + rect.width * f;
    await drag(control, [xAt(0.05), xAt(0.2), xAt(0.4), xAt(0.6)], y);

    const values = onChange.mock.calls.map(([v]) => v as number);
    for (const value of values) {
      expect(points).toContain(value);
    }
    expect(values[values.length - 1]).toBe(50);
  });

  it("a track press travels on the settle spring and lands on the value", async () => {
    const screen = await render(
      <Stage>
        <Controlled initial={0} />
      </Stage>,
    );
    const control = getControl(screen.container);
    const fill = getFill(screen.container);
    const rect = control.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const target = rect.width * 0.75;

    dispatchPointer(control, "pointerdown", rect.left + target, y);
    dispatchPointer(control, "pointerup", rect.left + target, y);
    await frames(3);
    // Mid-flight: the fill is travelling, not teleporting.
    const mid = fill.getBoundingClientRect().width;
    expect(mid).toBeLessThan(target - 5);
    // …and it lands on the accepted value.
    await expect
      .poll(() => Math.abs(fill.getBoundingClientRect().width - target) < 3, {
        timeout: 4000,
      })
      .toBe(true);
  });

  it("dragging past the end stretches the track and springs home on release", async () => {
    const screen = await render(
      <Stage>
        <Controlled initial={50} />
      </Stage>,
    );
    const control = getControl(screen.container);
    const track = getTrack(screen.container);
    const rect = control.getBoundingClientRect();
    const y = rect.top + rect.height / 2;

    dispatchPointer(control, "pointerdown", rect.right - 10, y);
    await frame();
    // 60px past the right edge: past dead zone (4px), well into resistance.
    dispatchPointer(window, "pointermove", rect.right + 60, y);
    await frames(3);
    expect(scaleOf(track)).toBeGreaterThan(1.001);

    dispatchPointer(window, "pointerup", rect.right + 60, y);
    await expect
      .poll(() => Math.abs(scaleOf(track) - 1) < 0.005, { timeout: 4000 })
      .toBe(true);
  });

  it("the bar dims while parked under the in-track label (dodge)", async () => {
    const screen = await render(
      <Stage>
        <Controlled initial={50} unit="%" />
      </Stage>,
    );
    const control = getControl(screen.container);
    const bar = getBar(screen.container);
    // Mid-track: clear of both text zones, bar at resting opacity.
    await expect
      .poll(() => Number(getComputedStyle(bar).opacity), { timeout: 4000 })
      .toBeGreaterThan(0.7);

    // Send the bar under the label at the left edge.
    const rect = control.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    dispatchPointer(control, "pointerdown", rect.left + rect.width * 0.08, y);
    dispatchPointer(control, "pointerup", rect.left + rect.width * 0.08, y);
    await expect
      .poll(() => Number(getComputedStyle(bar).opacity), { timeout: 4000 })
      .toBeLessThan(0.5);
  });

  it("container resize keeps the fill geometry true", async () => {
    const screen = await render(
      <Stage>
        <Controlled initial={50} />
      </Stage>,
    );
    const stage = q<HTMLElement>(screen.container, "[data-testid='stage']");
    const control = getControl(screen.container);
    const fill = getFill(screen.container);
    const before = control.getBoundingClientRect().width;
    await expect
      .poll(
        () => Math.abs(fill.getBoundingClientRect().width - before / 2) < 3,
        {
          timeout: 4000,
        },
      )
      .toBe(true);

    // Halve the CONTENT width, not the outer Stage width: Stage's padding
    // is fixed regardless of its own width (border-box, per Tailwind's
    // preflight), so naively halving STAGE_WIDTH here would leave content
    // width = STAGE_WIDTH / 2 - 2 * STAGE_PADDING = 0 — a degenerate resize
    // that trips useFader's `if (controlRect.width === 0) return;` guard
    // (a deliberate defense against transient zero-width measurements) and
    // freezes trackWidth/fillWidth forever instead of exercising a real
    // resize.
    stage.style.width = `${before / 2 + 2 * STAGE_PADDING}px`;
    // ResizeObserver re-measures; the px geometry must follow.
    await expect
      .poll(
        () => {
          const trackWidth = control.getBoundingClientRect().width;
          const fillWidth = fill.getBoundingClientRect().width;
          return Math.abs(fillWidth - trackWidth / 2) < 3;
        },
        { timeout: 4000 },
      )
      .toBe(true);
  });
});
