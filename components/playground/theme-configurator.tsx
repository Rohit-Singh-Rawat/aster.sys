"use client";

import { Cancel01Icon, Settings01Icon } from "hugeicons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePress } from "@/registry/aster/hooks/use-press";
import { cn } from "@/registry/aster/lib/cn";
import { durations, easings } from "@/registry/aster/lib/motion-tokens";
import { useTheme } from "./theme-context";

const COLORS = [
  { name: "Dark Sky", value: "oklch(0.5 0.15 245)" },
  { name: "Amber", value: "oklch(0.7 0.2 60)" },
  { name: "Emerald", value: "oklch(0.65 0.15 150)" },
  { name: "Rose", value: "oklch(0.6 0.2 15)" },
  { name: "Indigo", value: "oklch(0.6 0.15 280)" },
  { name: "Slate", value: "oklch(0.4 0.05 260)" },
];

// motion-tokens.ts stores CSS-facing strings ("320ms", "cubic-bezier(...)");
// Framer Motion transitions need seconds + a bezier tuple, so these convert
// the canonical tokens into the shapes Framer expects — never hand-picked.
function toSeconds(ms: string): number {
  return parseFloat(ms) / 1000;
}

function toBezier(cubicBezier: string): [number, number, number, number] {
  const [x1, y1, x2, y2] = cubicBezier.match(/[\d.]+/g)!.map(Number);
  return [x1, y1, x2, y2];
}

const SHAPE_DURATION = toSeconds(durations.slow);
const SHAPE_EASE = toBezier(easings.inOut);
const FADE_OUT_DURATION = toSeconds(durations.fast);
const FADE_IN_DURATION = toSeconds(durations.base);
const CONTENT_EASE = toBezier(easings.out);
const FADE_IN_DELAY = SHAPE_DURATION * 0.4;

const pressClasses = cn(
  "transition-transform duration-(--motion-dur-fast) ease-(--motion-ease-out)",
  "data-pressed:scale-[0.97] data-pressed:duration-(--motion-dur-instant)",
  "motion-reduce:transition-none motion-reduce:data-pressed:scale-100",
);

export function ThemeConfigurator() {
  const [isOpen, setIsOpen] = useState(false);
  const { accent, setAccent, tone, setTone, size, setSize } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const { pressed: triggerPressed, pressProps: triggerPressProps } =
    usePress<HTMLButtonElement>();
  const { pressed: closePressed, pressProps: closePressProps } =
    usePress<HTMLButtonElement>();

  // Escape closes only while open — no reason to hold a global listener
  // for the entire lifetime of the page.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus moves into the panel on open, and back to the trigger on close —
  // but only once it's actually been open (skip on first mount).
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  const shapeTransition = {
    duration: shouldReduceMotion ? 0 : SHAPE_DURATION,
    ease: SHAPE_EASE,
  };
  const fadeOutTransition = {
    duration: shouldReduceMotion ? 0 : FADE_OUT_DURATION,
    ease: CONTENT_EASE,
  };
  const fadeInTransition = {
    duration: shouldReduceMotion ? 0 : FADE_IN_DURATION,
    ease: CONTENT_EASE,
    delay: shouldReduceMotion ? 0 : FADE_IN_DELAY,
  };
  const contentFilter = shouldReduceMotion
    ? { blurred: "blur(0px)", clear: "blur(0px)" }
    : { blurred: "blur(4px)", clear: "blur(0px)" };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeOutTransition}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ layout: shapeTransition }}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col items-end justify-end overflow-hidden",
          "bg-foreground text-background shadow-2xl will-change-transform pointer-events-auto",
          isOpen ? "rounded-2xl" : "rounded-full",
          isOpen
            ? "border border-black/10 dark:border-white/10"
            : "border border-transparent",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen ? (
            <motion.button
              key="closed"
              ref={triggerRef}
              layout="position"
              type="button"
              {...triggerPressProps}
              data-pressed={triggerPressed ? "" : undefined}
              onClick={() => setIsOpen(true)}
              aria-label="Open theme configurator"
              initial={{ opacity: 0, filter: contentFilter.blurred }}
              animate={{
                opacity: 1,
                filter: contentFilter.clear,
                transition: fadeInTransition,
              }}
              exit={{
                opacity: 0,
                filter: contentFilter.blurred,
                transition: fadeOutTransition,
              }}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center outline-none",
                pressClasses,
              )}
            >
              <Settings01Icon size={20} />
            </motion.button>
          ) : (
            <motion.div
              key="open"
              layout="position"
              role="dialog"
              aria-modal="false"
              aria-label="Theme configurator"
              initial={{ opacity: 0, filter: contentFilter.blurred }}
              animate={{
                opacity: 1,
                filter: contentFilter.clear,
                transition: fadeInTransition,
              }}
              exit={{
                opacity: 0,
                filter: contentFilter.blurred,
                transition: fadeOutTransition,
              }}
              className="flex w-72 shrink-0 flex-col gap-4 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium tracking-tight">
                  Slider Kit
                </h3>
                <button
                  ref={closeRef}
                  type="button"
                  {...closePressProps}
                  data-pressed={closePressed ? "" : undefined}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close theme configurator"
                  className={cn(
                    "rounded-md p-1 text-background/60 outline-none",
                    "hover:text-background focus-ring",
                    pressClasses,
                  )}
                >
                  <Cancel01Icon size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-background/60">
                  Accent Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-label={`Set accent color to ${c.name}`}
                      aria-pressed={accent === c.value}
                      onClick={() => setAccent(c.value)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 outline-none",
                        "transition-transform duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:scale-110",
                        "focus-ring",
                        accent === c.value
                          ? "border-background scale-110"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  <div className="relative flex h-6 w-6 rounded-full bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] transition-transform duration-(--motion-dur-fast) ease-(--motion-ease-out) hover:scale-110 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-foreground">
                    <input
                      type="color"
                      title="Custom Color"
                      aria-label="Pick a custom accent color"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => setAccent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-background/60">
                  Theme Tone
                </span>
                <div className="flex gap-1 rounded-lg bg-background/20 p-1">
                  {(["neutral", "accent"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      type="button"
                      aria-pressed={tone === t}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium capitalize outline-none",
                        "transition-colors duration-(--motion-dur-fast) ease-(--motion-ease-out)",
                        "focus-ring",
                        tone === t
                          ? "bg-background text-foreground shadow"
                          : "text-background/60 hover:text-background",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-background/60">
                  Component Size
                </span>
                <div className="flex gap-1 rounded-lg bg-background/20 p-1">
                  {(["sm", "md", "lg"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      type="button"
                      aria-pressed={size === s}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium uppercase outline-none",
                        "transition-colors duration-(--motion-dur-fast) ease-(--motion-ease-out)",
                        "focus-ring",
                        size === s
                          ? "bg-background text-foreground shadow"
                          : "text-background/60 hover:text-background",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
