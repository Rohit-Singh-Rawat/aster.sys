"use client";

import { useState } from "react";
import { ScrubSliderV1 } from "./scrub-slider-v1";

/**
 * The scrubber contract only pays off when something responds in real time
 * (NN/g, "Input Controls for Parameters") — so the demo drives a live
 * preview instead of showing bare sliders.
 */
export function SliderDemoV1() {
  const [width, setWidth] = useState(4);
  const [opacity, setOpacity] = useState(65);
  const [scale, setScale] = useState(1);
  const [radius, setRadius] = useState(8);

  return (
    <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <ScrubSliderV1
          label="Width"
          value={width}
          onValueChange={setWidth}
          min={1}
          max={8}
        />
        <ScrubSliderV1
          label="Opacity"
          value={opacity}
          onValueChange={setOpacity}
          min={0}
          max={100}
          unit="%"
        />
        <ScrubSliderV1
          label="Scale"
          value={scale}
          onValueChange={setScale}
          min={0.5}
          max={1.5}
          step={0.01}
        />
        {/* Snap-points grammar: free drag, settles onto the nearest preset. */}
        <ScrubSliderV1
          label="Radius"
          value={radius}
          onValueChange={setRadius}
          min={0}
          max={28}
          points={[0, 4, 8, 16, 28]}
        />
      </div>
      <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-muted/20 sm:w-32">
        <div
          aria-hidden
          className="size-14 border-accent border-solid bg-accent/10"
          style={{
            borderWidth: width,
            borderRadius: radius,
            opacity: opacity / 100,
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}
