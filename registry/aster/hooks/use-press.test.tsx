import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  pointerCancel,
  pointerDown,
  pointerLeave,
  pointerUp,
} from "@/test/interactions";
import { usePress } from "./use-press";

/** Minimal harness: reflects `pressed` the way Button does (data-pressed). */
function Probe({ disabled = false }: { disabled?: boolean }) {
  const { pressed, pressProps } = usePress<HTMLButtonElement>({ disabled });
  return (
    <button
      type="button"
      data-pressed={pressed ? "" : undefined}
      {...pressProps}
    >
      probe
    </button>
  );
}

function renderProbe(disabled = false) {
  const view = render(<Probe disabled={disabled} />);
  return { ...view, button: view.getByRole("button") };
}

const isPressed = (el: HTMLElement) => el.hasAttribute("data-pressed");

describe("usePress: pointer", () => {
  it("presses on primary pointer down and releases on pointer up", () => {
    const { button } = renderProbe();
    pointerDown(button);
    expect(isPressed(button)).toBe(true);
    pointerUp(button);
    expect(isPressed(button)).toBe(false);
  });

  it("dragging off the element cancels the press", () => {
    const { button } = renderProbe();
    pointerDown(button);
    pointerLeave(button);
    expect(isPressed(button)).toBe(false);
  });

  it("pointer cancel ends the press", () => {
    const { button } = renderProbe();
    pointerDown(button);
    pointerCancel(button);
    expect(isPressed(button)).toBe(false);
  });

  it("ignores non-primary pointers", () => {
    const { button } = renderProbe();
    pointerDown(button, { isPrimary: false });
    expect(isPressed(button)).toBe(false);
  });

  it("ignores secondary buttons", () => {
    const { button } = renderProbe();
    pointerDown(button, { button: 2 });
    expect(isPressed(button)).toBe(false);
  });
});

describe("usePress: keyboard", () => {
  it.each([" ", "Enter"])("presses while %j is held", (key) => {
    const { button } = renderProbe();
    fireEvent.keyDown(button, { key });
    expect(isPressed(button)).toBe(true);
    fireEvent.keyUp(button, { key });
    expect(isPressed(button)).toBe(false);
  });

  it("releases on blur mid-press (Alt+Tab while Space is held)", () => {
    const { button } = renderProbe();
    fireEvent.keyDown(button, { key: " " });
    expect(isPressed(button)).toBe(true);
    fireEvent.blur(button);
    expect(isPressed(button)).toBe(false);
  });
});

describe("usePress: disabled", () => {
  it("ignores all press input while disabled", () => {
    const { button } = renderProbe(true);
    pointerDown(button);
    expect(isPressed(button)).toBe(false);
    fireEvent.keyDown(button, { key: "Enter" });
    expect(isPressed(button)).toBe(false);
  });

  it("becoming disabled mid-press releases in the same render", () => {
    const { button, rerender } = renderProbe();
    pointerDown(button);
    expect(isPressed(button)).toBe(true);
    rerender(<Probe disabled />);
    // The render-phase adjustment: no frame may show pressed-but-disabled.
    expect(isPressed(button)).toBe(false);
  });
});
