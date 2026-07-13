"use client";

import { useState } from "react";
import { Fader } from "@/registry/aster/ui/fader/fader";

/** Both value grammars: continuous scrub and snap points (detent hops). */
export default function BasicDemo() {
  const [opacity, setOpacity] = useState(65);
  const [radius, setRadius] = useState(8);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Fader
        label="Opacity"
        value={opacity}
        onValueChange={setOpacity}
        min={0}
        max={100}
        unit="%"
      />
      <Fader
        label="Radius"
        value={radius}
        onValueChange={setRadius}
        min={0}
        max={28}
        points={[0, 4, 8, 16, 28]}
      />
    </div>
  );
}
