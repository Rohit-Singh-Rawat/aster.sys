"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Fader } from "@/registry/aster/ui/fader/fader";

const PHRASE = "Interaction, crafted with intention.";

/**
 * Self-seeding, looping character-reveal driven live by five Faders
 * (Speed, Stagger, Size, Drop, Weight); Weight also demos the
 * snap-points grammar. Freezes fully revealed under
 * prefers-reduced-motion.
 */
export default function HeroDemo() {
  const reducedMotion = useReducedMotion();
  const [speed, setSpeed] = useState(40);
  const [stagger, setStagger] = useState(35);
  const [size, setSize] = useState(28);
  const [drop, setDrop] = useState(10);
  const [weight, setWeight] = useState(500);
  const [cycle, setCycle] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const revealMs = speed + PHRASE.length * stagger;
    const holdMs = 1400;

    function scheduleNext() {
      timeoutRef.current = setTimeout(() => {
        setCycle((c) => c + 1);
        scheduleNext();
      }, revealMs + holdMs);
    }
    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [speed, stagger, reducedMotion]);

  return (
    <div className="flex w-full flex-col items-center gap-6 py-4">
      <div
        aria-hidden="true"
        className="flex min-h-32 w-full items-center justify-center overflow-hidden rounded-2xl px-6"
      >
        <p
          className="flex flex-wrap justify-center text-center text-foreground"
          style={{ fontSize: size, fontWeight: weight }}
        >
          {PHRASE.split("").map((char, index) => (
            <motion.span
              key={reducedMotion ? `static-${index}` : `${cycle}-${index}`}
              initial={reducedMotion ? false : { opacity: 0, y: drop }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: speed / 1000,
                delay: reducedMotion ? 0 : (index * stagger) / 1000,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ whiteSpace: char === " " ? "pre" : "normal" }}
            >
              {char}
            </motion.span>
          ))}
        </p>
      </div>
      {/* Real accessible text; the animated version above is decorative (aria-hidden) */}
      <span className="sr-only">{PHRASE}</span>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-x-12 gap-y-6">
        <Fader
          label="Speed"
          value={speed}
          onValueChange={setSpeed}
          min={10}
          max={120}
          unit="ms"
          size="sm"
        />
        <Fader
          label="Stagger"
          value={stagger}
          onValueChange={setStagger}
          min={0}
          max={80}
          unit="ms"
          size="sm"
        />
        <Fader
          label="Size"
          value={size}
          onValueChange={setSize}
          min={16}
          max={40}
          size="sm"
        />
        <Fader
          label="Drop"
          value={drop}
          onValueChange={setDrop}
          min={0}
          max={40}
          unit="px"
          size="sm"
        />
        <Fader
          label="Weight"
          value={weight}
          onValueChange={setWeight}
          min={100}
          max={900}
          points={[100, 200, 300, 400, 500, 600, 700, 800, 900]}
          className="col-span-2"
          size="sm"
        />
      </div>
    </div>
  );
}
