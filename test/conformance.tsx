import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "./axe";
import { q } from "./interactions";
import { mockReducedMotion } from "./reduced-motion";
import { render } from "./render";

export interface ConformanceOptions {
  /** Render the component; must forward `className` and `disabled`. */
  render: (props?: { className?: string; disabled?: boolean }) => ReactElement;
  /** ARIA role the control is queryable by. */
  role: string;
  /** Accessible name the default render must expose. */
  accessibleName: string;
}

/**
 * Aster's shared conformance battery — the system invariants every
 * registry:ui item must satisfy (docs/03-templates/testing-template.md).
 * Component-specific behavior belongs in the component's own tests.
 */
export function describeAsterConformance(
  name: string,
  options: ConformanceOptions,
): void {
  describe(`${name}: Aster conformance`, () => {
    it("exposes an accessible name via its role", () => {
      const { getByRole } = render(options.render());
      expect(
        getByRole(options.role, { name: options.accessibleName }),
      ).toBeInTheDocument();
    });

    it("passes className through the cn merge", () => {
      const { container } = render(
        options.render({ className: "conformance-marker" }),
      );
      const marked = q<HTMLElement>(container, ".conformance-marker");
      // Merged, not replaced: the component's own classes survive.
      expect(marked.classList.length).toBeGreaterThan(1);
    });

    it("has no axe violations in its default render", async () => {
      const { container } = render(options.render());
      await expectNoAxeViolations(container);
    });

    it("is semantically disabled when disabled", () => {
      const { getByRole } = render(options.render({ disabled: true }));
      const el = getByRole(options.role, { name: options.accessibleName }) as
        | HTMLButtonElement
        | HTMLInputElement;
      const semantic =
        el.disabled === true || el.getAttribute("aria-disabled") === "true";
      expect(semantic).toBe(true);
    });

    it("renders under prefers-reduced-motion", () => {
      mockReducedMotion(true);
      const { getByRole } = render(options.render());
      expect(
        getByRole(options.role, { name: options.accessibleName }),
      ).toBeInTheDocument();
    });
  });
}
