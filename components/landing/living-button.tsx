"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/registry/aster/ui/button/button";

const STATES = ["idle", "hover", "press", "loading"] as const;
type ButtonState = (typeof STATES)[number];

const STATE_LABELS: Record<ButtonState, string> = {
  idle: "resting",
  hover: "hover",
  press: "press",
  loading: "loading",
};

const STATE_SCALE: Record<ButtonState, number> = {
  idle: 1,
  hover: 1.02,
  press: 0.97,
  loading: 1,
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export function LivingButton() {
  const [stateIndex, setStateIndex] = useState(0);
  const currentState = STATES[stateIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex((prev) => (prev + 1) % STATES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <motion.div
        animate={{
          scale: STATE_SCALE[currentState],
          opacity: currentState === "loading" ? [1, 0.7, 1] : 1,
        }}
        transition={
          currentState === "loading"
            ? {
                scale: springTransition,
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : springTransition
        }
      >
        <Button tabIndex={-1} className="pointer-events-none">
          Continue
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.span
          key={currentState}
          className="font-mono text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          state: {STATE_LABELS[currentState]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
