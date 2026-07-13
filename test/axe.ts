import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe and asserts zero violations. color-contrast is disabled in the
 * unit lane: jsdom does no real rendering and the rule needs canvas. Real
 * styles are exercised in the browser lane.
 */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(results.violations).toEqual([]);
}
