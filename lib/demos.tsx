import type { ComponentType } from "react";
import ButtonBasicDemo from "@/registry/aster/ui/button/demos/basic";
import ButtonPressedDemo from "@/registry/aster/ui/button/demos/pressed";
import FaderBasicDemo from "@/registry/aster/ui/fader/demos/basic";
import FaderHeroDemo from "@/registry/aster/ui/fader/demos/hero";
import FaderVariantsDemo from "@/registry/aster/ui/fader/demos/variants";
import { Component as FaderAnatomyDemo } from "@/registry/aster/ui/fader/demos/anatomy";

/**
 * Live demo components per primitive slug. Code strings come from the
 * loader; this map provides the rendered instances. Order here is the
 * display order; names must match the demo file names.
 */
export const demoRegistry: Record<
  string,
  { name: string; Component: ComponentType }[]
> = {
  button: [
    { name: "basic", Component: ButtonBasicDemo },
    { name: "pressed", Component: ButtonPressedDemo },
  ],
  fader: [
    { name: "hero", Component: FaderHeroDemo },
    { name: "basic", Component: FaderBasicDemo },
    { name: "variants", Component: FaderVariantsDemo },
    { name: "anatomy", Component: FaderAnatomyDemo },
  ],
};
