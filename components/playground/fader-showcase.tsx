"use client";

import { useState } from "react";
import { Fader } from "@/registry/aster/ui/fader/fader";

/**
 * Recording showcase — not an experiment (it answers no design question),
 * just two Faders at the largest sanctioned size on a clean backdrop for
 * screen capture. One of each value grammar: continuous drag, and detent
 * snap points.
 */
export function FaderShowcase() {
  const [frequency, setFrequency] = useState(45);
  const [resonance, setResonance] = useState(4);

  return (
    // Literal white, not a token: a fixed, theme-independent backdrop for
    // screen recording, not a shipped surface — DESIGN-SYSTEM's color roles
    // don't apply here for the same reason they don't apply to the footer.
    // The Fader's own text/accent tokens are pinned to their light values
    // too (inline, overriding any ambient .dark ancestor) — otherwise
    // recording in dark mode would put near-white text on this white panel.
    <div
      className="flex w-full flex-col gap-8 rounded-3xl bg-white p-24 border border-border"
      style={
        {
          "--background": "oklch(0.985 0 0)",
          "--foreground": "oklch(0.205 0 0)",
          "--muted": "oklch(0.94 0 0)",
          "--muted-foreground": "oklch(0.52 0 0)",
          "--border": "oklch(0.88 0 0)",
          "--accent": "oklch(0.62 0.11 265)",
          "--ring": "oklch(0.581 0.192 295)",
        } as React.CSSProperties
      }
    >
      <Fader
        label="Frequency"
        value={frequency}
        onValueChange={setFrequency}
        min={0}
        max={100}
        unit="%"
        size="lg"
      />
      <Fader
        label="Resonance"
        value={resonance}
        onValueChange={setResonance}
        min={0}
        max={10}
        points={[0, 2, 4, 6, 8, 10]}
        size="lg"
      />
    </div>
  );
}
