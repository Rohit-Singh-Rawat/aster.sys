"use client";

import { useState } from "react";
import { Fader } from "@/registry/aster/ui/fader/fader";

/**
 * Every sanctioned look from the token contract: three sizes, two tones,
 * and the hairline outline. There is deliberately no custom-color prop —
 * new hues enter through the DESIGN-SYSTEM protocol, not component props.
 */
export default function VariantsDemo() {
  const [a, setA] = useState(30);
  const [b, setB] = useState(55);
  const [c, setC] = useState(80);
  const [d, setD] = useState(25);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Fader
        label="Compact"
        value={a}
        onValueChange={setA}
        size="sm"
        tone="neutral"
      />
      <Fader label="Default" value={b} onValueChange={setB} unit="%" />
      <Fader label="Roomy" value={c} onValueChange={setC} size="lg" bordered />
      <Fader label="Disabled" value={50} onValueChange={() => {}} disabled />
      <Fader
        label="Snap Points"
        value={d}
        onValueChange={setD}
        points={[0, 25, 50, 75, 100]}
      />
    </div>
  );
}
