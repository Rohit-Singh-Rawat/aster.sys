import { describe, expect, it } from "vitest";
import { BAR_BOX, barCenterFor, fillEdgePx } from "./geometry";

describe("fillEdgePx", () => {
  it("maps percent to px within the track", () => {
    expect(fillEdgePx(0, 200)).toBe(0);
    expect(fillEdgePx(50, 200)).toBe(100);
    expect(fillEdgePx(100, 200)).toBe(200);
  });

  it("clamps spring overshoot to the track end", () => {
    // Detent-hop springs overshoot their target; the fill must never
    // bounce past the track (the reason the upper clamp exists).
    expect(fillEdgePx(104, 200)).toBe(200);
  });

  it("clamps below zero so the fill can shrink to nothing", () => {
    expect(fillEdgePx(-3, 200)).toBe(0);
  });
});

describe("barCenterFor", () => {
  it("rides the fill edge once the fill exceeds the bar box", () => {
    expect(barCenterFor(100)).toBe(100 - BAR_BOX / 2);
  });

  it("parks at half the bar box when the fill is narrower (ml-auto overflow)", () => {
    expect(barCenterFor(0)).toBe(BAR_BOX / 2);
    expect(barCenterFor(BAR_BOX - 1)).toBe(BAR_BOX / 2);
  });

  it("is continuous at the box boundary", () => {
    expect(barCenterFor(BAR_BOX)).toBe(BAR_BOX / 2);
  });
});
