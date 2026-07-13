/** Pure geometry shared by the behavior and visual layers so neither owns the other. */

/**
 * The bar's centering box at the fill's edge, px. Shared geometry truth:
 * the visual sizes the box from this constant and `barCenterFor` models it —
 * one source, so bar position and dodge/dot math can never disagree.
 */
export const BAR_BOX = 16;

/**
 * The visible fill edge in px, clamped to [0, trackWidth]. The upper clamp
 * matters: detent-hop springs overshoot their target, and without it the
 * fill bounced past the track end. The lower clamp at 0 lets the fill
 * shrink to nothing — the bar overflows naturally and parks at the start.
 */
export function fillEdgePx(percent: number, trackWidth: number): number {
  return Math.min(Math.max(0, (percent / 100) * trackWidth), trackWidth);
}

/**
 * The bar's center in px, accounting for ml-auto overflow at small fills.
 * When the fill is narrower than BAR_BOX, ml-auto resolves to 0 (no space
 * to push right), so the bar sits at 0–BAR_BOX and its center stays at
 * BAR_BOX/2. Once the fill exceeds BAR_BOX, ml-auto pushes the bar to the
 * fill's right edge.
 */
export function barCenterFor(fillEdge: number): number {
  return fillEdge >= BAR_BOX ? fillEdge - BAR_BOX / 2 : BAR_BOX / 2;
}
