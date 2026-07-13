import { fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { describeAsterConformance } from "@/test/conformance";
import { pointerDown, pointerUp, q, stubAllRects } from "@/test/interactions";
import { mockReducedMotion } from "@/test/reduced-motion";
import { render } from "@/test/render";
import { Fader, type FaderProps } from "./fader";

type HarnessProps = Partial<Omit<FaderProps, "value" | "onValueChange">> & {
  initial?: number;
  /** Parent rejects every change — models a controlled parent clamping input. */
  reject?: boolean;
  onChange?: (value: number) => void;
};

function Controlled({
  initial = 50,
  reject = false,
  onChange,
  ...props
}: HarnessProps) {
  const [value, setValue] = useState(initial);
  return (
    <Fader
      label="Volume"
      value={value}
      onValueChange={(next) => {
        onChange?.(next);
        if (!reject) {
          setValue(next);
        }
      }}
      {...props}
    />
  );
}

const getControl = (container: HTMLElement) =>
  q<HTMLElement>(container, "[class*='cursor-grab']");
const getFill = (container: HTMLElement) =>
  q<HTMLElement>(container, "div[style*='width']");
const getTrack = (container: HTMLElement) =>
  q<HTMLElement>(container, "[class*='overflow-hidden']");

describeAsterConformance("Fader", {
  render: (props) => <Controlled {...props} />,
  role: "slider",
  accessibleName: "Volume",
});

describe("Fader: slider semantics", () => {
  it("announces value and unit via aria attributes", () => {
    const { getByRole } = render(<Controlled initial={65} unit="%" />);
    const slider = getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "65");
    // The "65%" contract from docs/06-components/fader/notes.md —
    // without getAriaValueText a screen reader hears "65", not "65%".
    expect(slider).toHaveAttribute("aria-valuetext", "65%");
  });

  it("hides the visual text overlay from assistive tech", () => {
    const { container, getByRole } = render(<Controlled />);
    // The input owns name + value…
    expect(getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    // …so the <output> (an implicit live region) must sit inside an
    // aria-hidden overlay, or every arrow press announces twice.
    const output = q<HTMLElement>(container, "output");
    expect(output.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("display precision follows the step's own precision", () => {
    const { container } = render(
      <Controlled initial={1.5} min={0} max={3} step={0.25} />,
    );
    // decimalsFor: step 0.25 → 2 decimals; the control IS the display,
    // so it must render values the slider really lands on.
    expect(q<HTMLElement>(container, "output")).toHaveTextContent("1.50");
  });
});

describe("Fader: keyboard grammar", () => {
  it("arrows move by step on a continuous slider", async () => {
    const onChange = vi.fn();
    const { user, getByRole } = render(
      <Controlled initial={50} onChange={onChange} />,
    );
    const slider = getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(51);
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("arrows travel point-to-point under the points grammar", async () => {
    const onChange = vi.fn();
    const { user, getByRole } = render(
      <Controlled initial={25} points={[0, 25, 50, 100]} onChange={onChange} />,
    );
    const slider = getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(50);
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(100);
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("Home and End jump to the first and last point", async () => {
    const onChange = vi.fn();
    const { user, getByRole } = render(
      <Controlled initial={50} points={[0, 25, 50, 100]} onChange={onChange} />,
    );
    const slider = getByRole("slider");
    slider.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith(0);
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith(100);
  });
});

describe("Fader: value grammars", () => {
  const countMarks = (container: HTMLElement) =>
    container.querySelectorAll("span[style*='left']").length;

  it("renders detent marks only for snappy sliders", () => {
    // 11 stops ≤ DISCRETE_LIMIT (12) → detents; endpoints implied by the track.
    const snappy = render(<Controlled min={0} max={10} step={1} initial={5} />);
    expect(countMarks(snappy.container)).toBe(9);
    snappy.unmount();
    // 101 stops → continuous, no marks.
    const continuous = render(
      <Controlled min={0} max={100} step={1} initial={50} />,
    );
    expect(countMarks(continuous.container)).toBe(0);
  });

  it("flips grammar exactly at the DISCRETE_LIMIT boundary", () => {
    // 12 stops (0..11) → still snappy.
    const at = render(<Controlled min={0} max={11} step={1} initial={5} />);
    expect(countMarks(at.container)).toBeGreaterThan(0);
    at.unmount();
    // 13 stops (0..12) → continuous.
    const past = render(<Controlled min={0} max={12} step={1} initial={5} />);
    expect(countMarks(past.container)).toBe(0);
  });

  it("counts max as a landable stop when step doesn't divide the range", () => {
    // (10-0)/3 → full steps at 3,6,9 plus max itself = 5 stops → snappy.
    // Marks at 30/60/90% (endpoints and near-endpoints filtered).
    const { container } = render(
      <Controlled min={0} max={10} step={3} initial={3} />,
    );
    expect(countMarks(container)).toBe(3);
  });
});

describe("Fader: controlled contract", () => {
  it("external value changes update the reading immediately", async () => {
    function External() {
      const [value, setValue] = useState(20);
      return (
        <>
          <Fader label="Volume" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(80)}>
            set
          </button>
        </>
      );
    }
    const { container, getByRole, getByText } = render(<External />);
    fireEvent.click(getByText("set"));
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "80");
    // No layout in jsdom → trackWidth 0 → fill reads in percent space.
    const fill = getFill(container);
    await waitFor(() => expect(fill.style.width).toBe("80%"));
  });

  it("a rejected pointer change snaps the fill back to the accepted value", async () => {
    stubAllRects({ width: 200 });
    const onChange = vi.fn();
    const { container } = render(
      <Controlled initial={50} reject onChange={onChange} />,
    );
    const control = getControl(container);
    const fill = getFill(container);
    // Track press at x=150 on a 200px track → raw value 75.
    pointerDown(control, { clientX: 150, clientY: 20 });
    pointerUp(control, { clientX: 150, clientY: 20 });
    expect(onChange).toHaveBeenCalledWith(75);
    // The optimistic fill departs toward 75%…
    await waitFor(() => expect(fill.style.width).not.toBe("100px"));
    // …then reconciles to the accepted truth (50% of 200px): the spring's
    // onComplete and the 300ms grace window both point back to `value`.
    await waitFor(() => expect(fill.style.width).toBe("100px"), {
      timeout: 3000,
    });
  });

  it("reduced motion: pointer commits jump without a settle spring", async () => {
    mockReducedMotion(true);
    stubAllRects({ width: 200 });
    const { container } = render(<Controlled initial={50} />);
    const control = getControl(container);
    const fill = getFill(container);
    pointerDown(control, { clientX: 150, clientY: 20 });
    pointerUp(control, { clientX: 150, clientY: 20 });
    // Two frames is nowhere near enough for the settle spring to finish —
    // arriving this fast proves it was a jump.
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(fill.style.width).toBe("150px");
  });

  it("reduced motion: overdrag never stretches the track", async () => {
    mockReducedMotion(true);
    // 200px-wide stubbed track, control rect right edge at x=200.
    stubAllRects({ width: 200 });
    const { container } = render(<Controlled initial={50} />);
    const control = getControl(container);
    const track = getTrack(container);
    const atRest = track.style.transform;
    pointerDown(control, { clientX: 190, clientY: 20 });
    // useElasticOverdrag's stretch listener is window-level (attached in
    // onPointerDown, not React-synthetic) — dispatch there, well past the
    // stubbed track's right edge (200px) and dead zone (4px).
    fireEvent.pointerMove(window, {
      pointerId: 1,
      isPrimary: true,
      clientX: 260,
      clientY: 20,
    });
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    // With reduceMotion true, onPointerDown skips
    // `window.addEventListener("pointermove", move)` entirely, so the
    // dispatched pointermove above has no listener to reach scaleX — the
    // track's transform must be exactly what it was before the drag. If
    // that branch were removed (listener always attached), scaleX would
    // leave 1 and this transform would change.
    expect(track.style.transform).toBe(atRest);
    pointerUp(control, { clientX: 260, clientY: 20 });
  });
});

describe("Fader: developer contract warnings", () => {
  it("warns when min >= max", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Controlled min={10} max={10} initial={10} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("min (10) must be less than max (10)"),
    );
  });

  it("warns when points has fewer than 2 entries", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Controlled points={[50]} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("needs at least 2 entries"),
    );
  });

  it("warns on points outside the range", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Controlled points={[0, 150]} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("points outside [0, 100]: 150"),
    );
  });
});
