import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { describeAsterConformance } from "@/test/conformance";
import { pointerDown, pointerLeave, pointerUp } from "@/test/interactions";
import { render } from "@/test/render";
import { Button } from "./button";

describeAsterConformance("Button", {
  render: (props) => <Button {...props}>Save</Button>,
  role: "button",
  accessibleName: "Save",
});

describe("Button: press physics contract", () => {
  it("reflects an active press via data-pressed", () => {
    const { getByRole } = render(<Button>Save</Button>);
    const button = getByRole("button");
    pointerDown(button);
    expect(button).toHaveAttribute("data-pressed");
    pointerUp(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("drag off before release cancels without activating", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Save</Button>);
    const button = getByRole("button");
    pointerDown(button);
    pointerLeave(button);
    expect(button).not.toHaveAttribute("data-pressed");
    // Activation stays native (click); dragging off never produces one.
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([" ", "Enter"])(
    "keyboard parity: %j mirrors pointer press",
    (key) => {
      const { getByRole } = render(<Button>Save</Button>);
      const button = getByRole("button");
      fireEvent.keyDown(button, { key });
      expect(button).toHaveAttribute("data-pressed");
      fireEvent.keyUp(button, { key });
      expect(button).not.toHaveAttribute("data-pressed");
    },
  );

  it("rapid double activation fires twice with no stuck pressed state", async () => {
    const onClick = vi.fn();
    const { user, getByRole } = render(<Button onClick={onClick}>Save</Button>);
    const button = getByRole("button");
    await user.dblClick(button);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(button).not.toHaveAttribute("data-pressed");
  });
});

describe("Button: composition contract", () => {
  it("chains consumer pointer handlers after the press system's", () => {
    const onPointerDown = vi.fn();
    const { getByRole } = render(
      <Button onPointerDown={onPointerDown}>Save</Button>,
    );
    const button = getByRole("button");
    pointerDown(button);
    // Both ran: the consumer heard the event AND the press registered.
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("data-pressed");
  });
});

describe("Button: disabled", () => {
  it("never enters a pressed state while disabled", () => {
    const { getByRole } = render(<Button disabled>Save</Button>);
    const button = getByRole("button");
    expect(button).toBeDisabled();
    pointerDown(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("becoming disabled mid-press releases immediately", () => {
    const { getByRole, rerender } = render(<Button>Save</Button>);
    const button = getByRole("button");
    pointerDown(button);
    expect(button).toHaveAttribute("data-pressed");
    rerender(<Button disabled>Save</Button>);
    expect(button).not.toHaveAttribute("data-pressed");
  });
});

describe("Button: variants", () => {
  it.each([
    ["solid", "sm"],
    ["outline", "md"],
    ["ghost", "lg"],
  ] as const)("renders %s / %s", (variant, size) => {
    const { getByRole } = render(
      <Button variant={variant} size={size}>
        Save
      </Button>,
    );
    expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
